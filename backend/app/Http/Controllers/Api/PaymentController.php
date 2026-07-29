<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\Payment;
use App\Services\NotificationService;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::with(['contract.motorcycle', 'user'])->where('status', 'success');
        if ($request->user()->role === 'user') {
            $query->where('user_id', $request->user()->id);
        }
        return response()->json($query->latest()->get());
    }

    /**
     * STEP 1: User initiates an online payment.
     * Creates a pending payment record and returns a tx_ref + public key
     * for the frontend to launch the Flutterwave checkout widget.
     */
    public function initiate(Request $request)
    {
        $request->validate([
            'contract_id' => 'required|exists:contracts,id',
            'amount' => 'required|numeric|min:100', // Flutterwave min amount
        ]);

        $contract = Contract::with('motorcycle', 'user')->findOrFail($request->contract_id);

        if ($contract->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        if ($request->amount > $contract->balance) {
            return response()->json(['message' => 'Amount exceeds outstanding balance'], 422);
        }

        $txRef = 'MOTO-' . strtoupper(Str::random(10)) . '-' . time();

        $payment = Payment::create([
            'contract_id' => $contract->id,
            'user_id' => $contract->user_id,
            'amount' => $request->amount,
            'method' => 'flutterwave',
            'status' => 'pending',
            'tx_ref' => $txRef,
            'reference' => $txRef,
        ]);

        return response()->json([
            'payment_id' => $payment->id,
            'tx_ref' => $txRef,
            'amount' => $request->amount,
            'public_key' => config('services.flutterwave.public'),
            'customer' => [
                'email' => $contract->user->email,
                'name' => $contract->user->full_name,
                'phone' => $contract->user->phone,
            ],
            'description' => "Payment for {$contract->motorcycle->brand} {$contract->motorcycle->model} contract",
        ]);
    }

    /**
     * STEP 2: After the Flutterwave widget closes successfully on the frontend,
     * the frontend calls this endpoint with the transaction_id to verify server-side.
     * NEVER trust the frontend result alone — always verify with Flutterwave's API.
     */
    public function verify(Request $request)
    {
        $request->validate([
            'tx_ref' => 'required|string|exists:payments,tx_ref',
            'transaction_id' => 'required|string',
        ]);

        $payment = Payment::where('tx_ref', $request->tx_ref)->firstOrFail();

        if ($payment->status === 'success') {
            return response()->json(['message' => 'Payment already verified', 'payment' => $payment]);
        }

        $response = Http::withToken(config('services.flutterwave.secret'))
            ->get("https://api.flutterwave.com/v3/transactions/{$request->transaction_id}/verify");

        if (!$response->successful()) {
            $payment->update(['status' => 'failed', 'gateway_response' => $response->json()]);
            return response()->json(['message' => 'Verification request failed'], 502);
        }

        $data = $response->json('data');

        $isValid = $response->json('status') === 'success'
            && $data['status'] === 'successful'
            && $data['tx_ref'] === $payment->tx_ref
            && (float) $data['amount'] >= (float) $payment->amount
            && $data['currency'] === 'TZS';

        if (!$isValid) {
            $payment->update(['status' => 'failed', 'gateway_response' => $data]);
            return response()->json(['message' => 'Payment verification failed', 'details' => $data], 422);
        }

        return DB::transaction(function () use ($payment, $data) {
            $payment->update(['status' => 'success', 'gateway_response' => $data]);

            $contract = Contract::findOrFail($payment->contract_id);
            $contract->paid_amount += $payment->amount;
            $contract->balance -= $payment->amount;
            if ($contract->balance <= 0) {
                $contract->balance = 0;
                $contract->status = 'completed';
            }
            $contract->save();

            NotificationService::send(
                $contract->user_id,
                'Payment Successful',
                "TZS {$payment->amount} received via mobile money/card. Remaining balance: TZS {$contract->balance}.",
                'payment'
            );

            if ($contract->status === 'completed') {
                NotificationService::send(
                    $contract->user_id,
                    'Contract Completed',
                    "Your contract for {$contract->motorcycle->brand} {$contract->motorcycle->model} is now fully paid.",
                    'contract'
                );
            }

            return response()->json(['message' => 'Payment verified successfully', 'payment' => $payment, 'contract' => $contract]);
        });
    }

    /**
     * Manager records a CASH payment (instant, no gateway needed).
     */
    public function storeCash(Request $request)
    {
        $request->validate([
            'contract_id' => 'required|exists:contracts,id',
            'amount' => 'required|numeric|min:0.01',
        ]);

        return DB::transaction(function () use ($request) {
            $contract = Contract::findOrFail($request->contract_id);

            if ($request->amount > $contract->balance) {
                return response()->json(['message' => 'Amount exceeds outstanding balance'], 422);
            }

            $payment = Payment::create([
                'contract_id' => $contract->id,
                'user_id' => $contract->user_id,
                'amount' => $request->amount,
                'method' => 'cash',
                'status' => 'success',
                'recorded_by' => $request->user()->id,
                'reference' => 'CASH-' . strtoupper(uniqid()),
            ]);

            $contract->paid_amount += $request->amount;
            $contract->balance -= $request->amount;
            if ($contract->balance <= 0) {
                $contract->balance = 0;
                $contract->status = 'completed';
            }
            $contract->save();

            AuditLogger::log($request->user()->id, 'recorded_cash_payment', 'Payment', $payment->id,
                "TZS {$request->amount} cash recorded for contract #{$contract->id}");

            NotificationService::send(
                $contract->user_id,
                'Cash Payment Recorded',
                "TZS {$request->amount} cash payment recorded by manager. Remaining balance: TZS {$contract->balance}.",
                'payment'
            );

            return response()->json($payment, 201);
        });
    }

    /**
     * Flutterwave webhook (recommended in addition to client-side verify,
     * for reliability if the user closes the browser before verify() runs).
     */
    public function webhook(Request $request)
    {
        $signature = $request->header('verif-hash');
        $secretHash = env('FLUTTERWAVE_WEBHOOK_HASH'); // set this in Flutterwave dashboard + .env

        if (!$signature || $signature !== $secretHash) {
            return response()->json(['message' => 'Invalid signature'], 401);
        }

        $payload = $request->all();

        if (($payload['event'] ?? null) === 'charge.completed' && $payload['data']['status'] === 'successful') {
            $txRef = $payload['data']['tx_ref'];
            $payment = Payment::where('tx_ref', $txRef)->where('status', 'pending')->first();

            if ($payment) {
                DB::transaction(function () use ($payment, $payload) {
                    $payment->update(['status' => 'success', 'gateway_response' => $payload['data']]);
                    $contract = Contract::findOrFail($payment->contract_id);
                    $contract->paid_amount += $payment->amount;
                    $contract->balance -= $payment->amount;
                    if ($contract->balance <= 0) {
                        $contract->balance = 0;
                        $contract->status = 'completed';
                    }
                    $contract->save();
                });
            }
        }

        return response()->json(['message' => 'ok']);
    }
}