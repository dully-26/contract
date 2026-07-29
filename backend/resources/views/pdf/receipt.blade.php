<!DOCTYPE html>
<html>
<head>
<style>
    body { font-family: DejaVu Sans, sans-serif; font-size: 13px; }
    .header { text-align: center; margin-bottom: 20px; }
    .header h1 { color: #1e40af; font-size: 18px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
    .label { font-weight: bold; width: 200px; }
    .total { font-size: 16px; font-weight: bold; color: #16a34a; }
</style>
</head>
<body>
    <div class="header">
        <h1>PAYMENT RECEIPT</h1>
        <p>Reference: {{ $payment->reference }}</p>
    </div>
    <table>
        <tr><td class="label">Client</td><td>{{ $payment->user->full_name }}</td></tr>
        <tr><td class="label">Motorcycle</td><td>{{ $payment->contract->motorcycle->brand }} {{ $payment->contract->motorcycle->model }}</td></tr>
        <tr><td class="label">Payment Method</td><td>{{ ucfirst($payment->method) }}</td></tr>
        <tr><td class="label">Date</td><td>{{ $payment->created_at->format('d M Y, H:i') }}</td></tr>
        <tr><td class="label">Amount Paid</td><td class="total">TZS {{ number_format($payment->amount, 2) }}</td></tr>
        <tr><td class="label">Remaining Balance</td><td>TZS {{ number_format($payment->contract->balance, 2) }}</td></tr>
    </table>
</body>
</html>