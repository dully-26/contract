<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\Payment;
use App\Models\Sale;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    public function payments(Request $request)
    {
        $query = Payment::with(['user', 'contract.motorcycle']);

        if ($request->filled('from')) $query->whereDate('created_at', '>=', $request->from);
        if ($request->filled('to')) $query->whereDate('created_at', '<=', $request->to);

        $payments = $query->latest()->get();

        return response()->json([
            'payments' => $payments,
            'total' => $payments->sum('amount'),
            'count' => $payments->count(),
        ]);
    }

    public function contracts(Request $request)
    {
        $query = Contract::with(['user', 'motorcycle']);
        if ($request->filled('status')) $query->where('status', $request->status);

        return response()->json($query->latest()->get());
    }

    public function sales(Request $request)
    {
        return response()->json(Sale::with(['motorcycle', 'seller', 'buyer'])->latest()->get());
    }

    public function overdue()
    {
        // Contracts active, past end_date, with remaining balance
        $overdue = Contract::with(['user', 'motorcycle'])
            ->where('status', 'active')
            ->whereDate('end_date', '<', now())
            ->where('balance', '>', 0)
            ->get();

        return response()->json($overdue);
    }

    public function exportPaymentsPdf(Request $request)
    {
        $query = Payment::with(['user', 'contract.motorcycle']);
        if ($request->filled('from')) $query->whereDate('created_at', '>=', $request->from);
        if ($request->filled('to')) $query->whereDate('created_at', '<=', $request->to);
        $payments = $query->latest()->get();

        $pdf = Pdf::loadView('pdf.payment-report', [
            'payments' => $payments,
            'total' => $payments->sum('amount'),
            'from' => $request->from,
            'to' => $request->to,
        ]);

        return $pdf->download('payment-report.pdf');
    }
}