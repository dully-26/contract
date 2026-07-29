<!DOCTYPE html>
<html>
<head>
<style>
    body { font-family: DejaVu Sans, sans-serif; font-size: 12px; }
    h1 { color: #1e40af; text-align: center; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { border: 1px solid #e5e7eb; padding: 6px 10px; text-align: left; }
    th { background: #f4f6fb; }
    .total-row td { font-weight: bold; background: #f0fdf4; }
</style>
</head>
<body>
    <h1>Payment Report</h1>
    <p>Period: {{ $from ?? 'All time' }} to {{ $to ?? 'Now' }}</p>
    <table>
        <thead>
            <tr><th>Ref</th><th>Client</th><th>Motorcycle</th><th>Method</th><th>Amount</th><th>Date</th></tr>
        </thead>
        <tbody>
            @foreach($payments as $p)
            <tr>
                <td>{{ $p->reference }}</td>
                <td>{{ $p->user->full_name }}</td>
                <td>{{ $p->contract->motorcycle->brand }} {{ $p->contract->motorcycle->model }}</td>
                <td>{{ ucfirst($p->method) }}</td>
                <td>TZS {{ number_format($p->amount, 2) }}</td>
                <td>{{ $p->created_at->format('d/m/Y') }}</td>
            </tr>
            @endforeach
            <tr class="total-row"><td colspan="4">TOTAL</td><td colspan="2">TZS {{ number_format($total, 2) }}</td></tr>
        </tbody>
    </table>
</body>
</html>