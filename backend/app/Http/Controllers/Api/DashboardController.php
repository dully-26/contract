<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Motorcycle;
use App\Models\Payment;
use App\Models\User;
use App\Models\Contract;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Single combined endpoint — returns stats, revenue trend,
     * motorcycle distribution, and contract status breakdown all at once.
     * This avoids the frontend making 4 separate slow round trips.
     */
    public function overview()
    {
        $stats = [
            'total_users' => User::where('role', 'user')->count(),
            'total_managers' => User::where('role', 'manager')->count(),
            'available_motorcycles' => Motorcycle::where('status', 'available')->count(),
            'contracted_motorcycles' => Motorcycle::where('status', 'rented')->count(),
            'sold_motorcycles' => Motorcycle::where('status', 'sold')->count(),
            'total_revenue' => (float) Payment::where('status', 'success')->sum('amount'),
        ];

        $revenueTrend = Payment::select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
                DB::raw('SUM(amount) as total')
            )
            ->where('status', 'success')
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $motorcycleDistribution = Motorcycle::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        $contractStatus = Contract::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        return response()->json([
            'stats' => $stats,
            'revenue_trend' => $revenueTrend,
            'motorcycle_distribution' => $motorcycleDistribution,
            'contract_status' => $contractStatus,
        ]);
    }

    // Kept for backward compatibility / individual use if needed elsewhere
    public function stats()
    {
        return response()->json([
            'total_users' => User::where('role', 'user')->count(),
            'total_managers' => User::where('role', 'manager')->count(),
            'available_motorcycles' => Motorcycle::where('status', 'available')->count(),
            'contracted_motorcycles' => Motorcycle::where('status', 'rented')->count(),
            'sold_motorcycles' => Motorcycle::where('status', 'sold')->count(),
            'total_revenue' => (float) Payment::where('status', 'success')->sum('amount'),
        ]);
    }

    public function revenueTrend()
    {
        $data = Payment::select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
                DB::raw('SUM(amount) as total')
            )
            ->where('status', 'success')
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json($data);
    }

    public function motorcycleDistribution()
    {
        $data = Motorcycle::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        return response()->json($data);
    }

    public function contractStatusBreakdown()
    {
        $data = Contract::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        return response()->json($data);
    }
}