<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\Payment;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class PdfController extends Controller
{
    public function contract(Request $request, $id)
    {
        $contract = Contract::with(['motorcycle', 'user', 'witnesses', 'guarantors'])->findOrFail($id);

        if ($request->user()->role === 'user' && $contract->user_id !== $request->user()->id) {
            abort(403);
        }

        $pdf = Pdf::loadView('pdf.contract', ['contract' => $contract]);
        return $pdf->download("contract-{$contract->id}.pdf");
    }

    public function receipt(Request $request, $id)
    {
        $payment = Payment::with(['contract.motorcycle', 'user'])->findOrFail($id);

        if ($request->user()->role === 'user' && $payment->user_id !== $request->user()->id) {
            abort(403);
        }

        $pdf = Pdf::loadView('pdf.receipt', ['payment' => $payment]);
        return $pdf->download("receipt-{$payment->reference}.pdf");
    }
}