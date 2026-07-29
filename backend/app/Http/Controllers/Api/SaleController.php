<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Motorcycle;
use App\Models\Sale;
use App\Services\NotificationService;
use App\Services\AuditLogger;
use Illuminate\Http\Request;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        $query = Motorcycle::where('listing_type', 'sale')
            ->where('status', 'available')
            ->with('owner:id,full_name,phone,email');

        if ($request->has('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('brand', 'like', "%$s%")->orWhere('model', 'like', "%$s%");
            });
        }

        return response()->json($query->latest()->paginate(12));
    }

    public function store(Request $request)
    {
        $request->validate([
            'motorcycle_id' => 'required|exists:motorcycles,id',
            'offer_price' => 'nullable|numeric|min:0',
        ]);

        $motorcycle = Motorcycle::findOrFail($request->motorcycle_id);

        if ($motorcycle->owner_id === $request->user()->id) {
            return response()->json(['message' => 'You cannot buy your own listing'], 422);
        }
        if ($motorcycle->status !== 'available') {
            return response()->json(['message' => 'Motorcycle no longer available'], 422);
        }

        $existing = Sale::where('motorcycle_id', $motorcycle->id)
            ->where('buyer_id', $request->user()->id)
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return response()->json(['message' => 'You already have a pending request for this motorcycle'], 422);
        }

        $sale = Sale::create([
            'motorcycle_id' => $motorcycle->id,
            'seller_id' => $motorcycle->owner_id,
            'buyer_id' => $request->user()->id,
            'offer_price' => $request->offer_price ?? $motorcycle->sale_price,
            'status' => 'pending',
        ]);

        AuditLogger::log($request->user()->id, 'submitted_purchase_request', 'Sale', $sale->id,
            "Requested to buy {$motorcycle->brand} {$motorcycle->model}");

        NotificationService::send(
            $motorcycle->owner_id,
            'New Purchase Request',
            "{$request->user()->full_name} wants to buy your {$motorcycle->brand} {$motorcycle->model}.",
            'sale'
        );

        return response()->json($sale, 201);
    }

    public function indexRequests(Request $request)
    {
        $query = Sale::with(['motorcycle', 'seller', 'buyer']);

        if ($request->user()->role === 'user') {
            $query->where(function ($q) use ($request) {
                $q->where('seller_id', $request->user()->id)
                  ->orWhere('buyer_id', $request->user()->id);
            });
        }

        return response()->json($query->latest()->get());
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:approved,rejected,completed']);

        $sale = Sale::with('motorcycle')->findOrFail($id);

        $isOwner = $request->user()->id === $sale->seller_id;
        $isStaff = in_array($request->user()->role, ['manager', 'admin']);

        if (!$isOwner && !$isStaff) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($sale->status === 'completed') {
            return response()->json(['message' => 'This sale is already completed'], 422);
        }

        $sale->update(['status' => $request->status]);

        if ($request->status === 'completed') {
            $sale->motorcycle->update(['status' => 'sold']);
        }

        AuditLogger::log($request->user()->id, "sale_{$request->status}", 'Sale', $sale->id,
            "{$sale->motorcycle->brand} {$sale->motorcycle->model} sale {$request->status}");

        NotificationService::send(
            $sale->buyer_id,
            'Purchase Request ' . ucfirst($request->status),
            "Your request for {$sale->motorcycle->brand} {$sale->motorcycle->model} was {$request->status}.",
            'sale'
        );

        return response()->json($sale);
    }
}