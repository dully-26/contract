<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\Notification;
use App\Models\Motorcycle;
use Illuminate\Http\Request;

class UserDashboardController extends Controller
{
    public function stats(Request $request)
    {
        $userId = $request->user()->id;

        $activeContracts = Contract::where('user_id', $userId)->where('status', 'active')->count();
        $totalPaid = Contract::where('user_id', $userId)->sum('paid_amount');
        $totalOutstanding = Contract::where('user_id', $userId)->where('status', 'active')->sum('balance');
        $unreadNotifications = Notification::where('user_id', $userId)->where('is_read', false)->count();

        $nextDue = Contract::where('user_id', $userId)
            ->where('status', 'active')
            ->where('balance', '>', 0)
            ->orderBy('end_date')
            ->with('motorcycle')
            ->first();

        $recentListings = Motorcycle::where('listing_type', 'contract')
            ->where('status', 'available')
            ->latest()
            ->limit(4)
            ->get();

        return response()->json([
            'active_contracts' => $activeContracts,
            'total_paid' => $totalPaid,
            'total_outstanding' => $totalOutstanding,
            'unread_notifications' => $unreadNotifications,
            'next_due_contract' => $nextDue,
            'recent_listings' => $recentListings,
        ]);
    }
}