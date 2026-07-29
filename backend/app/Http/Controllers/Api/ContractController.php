<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\ContractRequest;
use App\Services\AuditLogger;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ContractController extends Controller
{
    private function fullRelations(): array
    {
        return ['motorcycle', 'user', 'issuedBy', 'witnesses', 'guarantors', 'payments', 'contractRequest'];
    }

    public function index(Request $request)
    {
        $query = Contract::with($this->fullRelations());
        if ($request->user()->role === 'user') {
            $query->where('user_id', $request->user()->id);
        }
        return response()->json($query->latest()->get());
    }

    public function show(Request $request, $id)
    {
        $contract = Contract::with($this->fullRelations())->findOrFail($id);

        if ($request->user()->role === 'user' && $contract->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($contract);
    }

    public function store(Request $request)
    {
        $request->validate([
            'contract_request_id' => 'required|exists:contract_requests,id',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'total_amount' => 'required|numeric|min:0',
            'witness' => 'required|array',
            'witness.full_name' => 'required|string',
            'witness.nida_number' => 'required|string',
            'witness.phone' => 'required|string',
            'witness.address' => 'required|string',
            'guarantor' => 'required|array',
            'guarantor.full_name' => 'required|string',
            'guarantor.phone' => 'required|string',
            'guarantor.address' => 'required|string',
            'guarantor.nida_number' => 'required|string',
        ]);

        return DB::transaction(function () use ($request) {
            $cr = ContractRequest::findOrFail($request->contract_request_id);

            $contract = Contract::create([
                'user_id' => $cr->user_id,
                'issued_by' => $request->user()->id,
                'motorcycle_id' => $cr->motorcycle_id,
                'contract_request_id' => $cr->id,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'total_amount' => $request->total_amount,
                'paid_amount' => 0,
                'balance' => $request->total_amount,
                'status' => 'active',
            ]);

            $contract->witnesses()->create($request->witness);
            $contract->guarantors()->create($request->guarantor);

            NotificationService::send(
                $cr->user_id,
                'Mkataba Wako Umetayarishwa',
                "Mkataba wa {$cr->motorcycle->brand} {$cr->motorcycle->model} umetayarishwa. Tafadhali soma masharti kabla ya kuukubali.",
                'contract'
            );

            return response()->json($contract->load($this->fullRelations()), 201);
        });
    }

    public function update(Request $request, $id)
    {
        $contract = Contract::with(['witnesses', 'guarantors'])->findOrFail($id);

        if (in_array($contract->status, ['completed', 'terminated'])) {
            return response()->json(['message' => 'Cannot edit a completed or terminated contract'], 422);
        }

        $request->validate([
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|nullable|date|after:start_date',
            'total_amount' => 'sometimes|required|numeric|min:' . $contract->paid_amount,
            'witness' => 'sometimes|array',
            'witness.full_name' => 'required_with:witness|string',
            'witness.nida_number' => 'required_with:witness|string',
            'witness.phone' => 'required_with:witness|string',
            'witness.address' => 'required_with:witness|string',
            'guarantor' => 'sometimes|array',
            'guarantor.full_name' => 'required_with:guarantor|string',
            'guarantor.phone' => 'required_with:guarantor|string',
            'guarantor.address' => 'required_with:guarantor|string',
            'guarantor.nida_number' => 'required_with:guarantor|string',
        ]);

        return DB::transaction(function () use ($request, $contract) {
            $updateData = $request->only(['start_date', 'end_date']);

            if ($request->filled('total_amount')) {
                $updateData['total_amount'] = $request->total_amount;
                $updateData['balance'] = $request->total_amount - $contract->paid_amount;
            }

            $contract->update($updateData);

            if ($request->has('witness')) {
                if ($contract->witnesses->first()) {
                    $contract->witnesses->first()->update($request->witness);
                } else {
                    $contract->witnesses()->create($request->witness);
                }
            }

            if ($request->has('guarantor')) {
                if ($contract->guarantors->first()) {
                    $contract->guarantors->first()->update($request->guarantor);
                } else {
                    $contract->guarantors()->create($request->guarantor);
                }
            }

            AuditLogger::log(
                request()->user()->id,
                'edited_contract',
                'Contract',
                $contract->id,
                "Contract #{$contract->id} details updated"
            );

            return response()->json($contract->fresh($this->fullRelations()));
        });
    }

    public function accept(Request $request, $id)
    {
        $contract = Contract::findOrFail($id);

        if ($contract->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($contract->status !== 'active') {
            return response()->json(['message' => 'This contract cannot be accepted in its current state'], 422);
        }

        if ($contract->accepted_at) {
            return response()->json(['message' => 'Contract already accepted', 'contract' => $contract], 200);
        }

        $contract->update(['accepted_at' => now()]);

        AuditLogger::log(
            $request->user()->id,
            'accepted_contract',
            'Contract',
            $contract->id,
            "Mteja amekubali masharti ya mkataba #{$contract->id}"
        );

        return response()->json($contract->fresh($this->fullRelations()));
    }

    public function reject(Request $request, $id)
    {
        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $contract = Contract::with('motorcycle')->findOrFail($id);

        if ($contract->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($contract->status !== 'active') {
            return response()->json(['message' => 'This contract cannot be rejected in its current state'], 422);
        }

        return DB::transaction(function () use ($request, $contract) {
            $contract->update([
                'status' => 'terminated',
                'rejected_at' => now(),
                'rejection_reason' => $request->reason,
            ]);

            $contract->motorcycle->update(['status' => 'available']);

            AuditLogger::log(
                $request->user()->id,
                'rejected_contract',
                'Contract',
                $contract->id,
                "Mteja amekataa mkataba #{$contract->id}" . ($request->reason ? ": {$request->reason}" : '')
            );

            NotificationService::send(
                $contract->issued_by,
                'Mteja Amekataa Mkataba',
                "{$contract->user->full_name} amekataa mkataba wa {$contract->motorcycle->brand} {$contract->motorcycle->model}." .
                ($request->reason ? " Sababu: {$request->reason}" : ''),
                'contract'
            );

            return response()->json($contract->fresh(['motorcycle', 'user']));
        });
    }

    public function terminate(Request $request, $id)
    {
        $contract = Contract::findOrFail($id);
        $contract->update(['status' => 'terminated']);
        $contract->motorcycle->update(['status' => 'available']);

        AuditLogger::log(
            $request->user()->id,
            'terminated_contract',
            'Contract',
            $contract->id,
            "Mkataba #{$contract->id} umesitishwa na meneja"
        );

        return response()->json($contract);
    }
}
