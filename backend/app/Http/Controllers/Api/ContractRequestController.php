<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContractRequest;
use App\Models\Motorcycle;
use App\Services\NotificationService;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ContractRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = ContractRequest::with(['user', 'motorcycle', 'contract']);

        if ($request->user()->role === 'user') {
            $query->where('user_id', $request->user()->id);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->latest()->get());
    }

    public function show($id)
    {
        return response()->json(ContractRequest::with(['user', 'motorcycle', 'contract'])->findOrFail($id));
    }

    /**
     * Submit a new contract request. The applicant photo is required for
     * accountability, but if the user already has a profile photo saved,
     * that is used automatically as a fallback so they aren't forced to
     * re-upload one every time.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'motorcycle_id' => 'required|exists:motorcycles,id',
            'notes' => 'nullable|string|max:500',
            'applicant_photo' => 'nullable|file|image|max:5120', // 5MB, optional if profile photo exists
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $motorcycle = Motorcycle::findOrFail($request->motorcycle_id);

        if ($motorcycle->listing_type !== 'contract') {
            return response()->json(['message' => 'This motorcycle is not available for contract'], 422);
        }
        if ($motorcycle->status !== 'available') {
            return response()->json(['message' => 'Motorcycle is not available'], 422);
        }

        $existing = ContractRequest::where('user_id', $request->user()->id)
            ->where('motorcycle_id', $motorcycle->id)
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return response()->json(['message' => 'You already have a pending request for this motorcycle'], 422);
        }

        // Use a newly uploaded photo if provided, otherwise fall back to
        // the user's saved profile photo. If neither exists, reject the request.
        $photoPath = null;
        if ($request->hasFile('applicant_photo')) {
            $photoPath = $request->file('applicant_photo')->store('applicant_photos', 'public');
        } elseif ($request->user()->profile_photo) {
            $photoPath = $request->user()->profile_photo;
        } else {
            return response()->json([
                'message' => 'Tafadhali pakia picha yako (au weka picha ya profaili kwanza) kabla ya kuwasilisha ombi',
            ], 422);
        }

        $reqModel = ContractRequest::create([
            'user_id' => $request->user()->id,
            'motorcycle_id' => $request->motorcycle_id,
            'notes' => $request->notes,
            'applicant_photo' => $photoPath,
            'status' => 'pending',
        ]);

        AuditLogger::log(
            $request->user()->id,
            'submitted_contract_request',
            'ContractRequest',
            $reqModel->id,
            "Requested {$motorcycle->brand} {$motorcycle->model}"
        );

        return response()->json($reqModel->load('motorcycle'), 201);
    }

    /**
     * Manager/Admin approves or rejects a pending contract request.
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:approved,rejected']);

        $cr = ContractRequest::with('motorcycle')->findOrFail($id);

        if ($cr->status !== 'pending') {
            return response()->json(['message' => 'This request has already been reviewed'], 422);
        }

        $cr->update([
            'status' => $request->status,
            'reviewed_by' => $request->user()->id,
        ]);

        if ($request->status === 'approved') {
            $cr->motorcycle->update(['status' => 'rented']);
        }

        AuditLogger::log(
            $request->user()->id,
            "contract_request_{$request->status}",
            'ContractRequest',
            $cr->id,
            "{$cr->motorcycle->brand} {$cr->motorcycle->model} request {$request->status}"
        );

        NotificationService::send(
            $cr->user_id,
            'Contract Request ' . ucfirst($request->status),
            "Your request for {$cr->motorcycle->brand} {$cr->motorcycle->model} was {$request->status}.",
            'contract'
        );

        return response()->json($cr);
    }
}