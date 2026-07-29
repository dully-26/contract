<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Motorcycle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class MotorcycleController extends Controller
{
    public function index(Request $request)
    {
        $query = Motorcycle::query();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('listing_type')) {
            $query->where('listing_type', $request->listing_type);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('brand', 'like', "%$search%")
                  ->orWhere('model', 'like', "%$search%");
            });
        }

        return response()->json($query->latest()->paginate(12));
    }

    public function show($id)
    {
        return response()->json(Motorcycle::with('owner')->findOrFail($id));
    }

    /**
     * Manager/Admin: add a motorcycle either for contract or for sale.
     * Validation rules are branched explicitly by listing_type to avoid
     * ambiguous required_if + nullable conflicts that caused 422 errors.
     */
    public function store(Request $request)
    {
        $baseRules = [
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'year' => 'required|integer|min:1980|max:' . (date('Y') + 1),
            'condition' => 'required|in:new,used',
            'listing_type' => 'required|in:contract,sale',
            'description' => 'nullable|string',
            'photos' => 'nullable|array',
            'photos.*' => 'file|image|max:5120', // 5MB per photo
        ];

        if ($request->input('listing_type') === 'contract') {
            $baseRules['daily_price'] = 'required|numeric|min:0';
            $baseRules['monthly_price'] = 'required|numeric|min:0';
            $baseRules['total_contract_price'] = 'required|numeric|min:0';
        } elseif ($request->input('listing_type') === 'sale') {
            $baseRules['sale_price'] = 'required|numeric|min:0';
        }

        $validator = Validator::make($request->all(), $baseRules);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validated = $validator->validated();

        $photos = [];
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $file) {
                $photos[] = $file->store('motorcycles', 'public');
            }
        }

        $motorcycle = Motorcycle::create([
            'brand' => $validated['brand'],
            'model' => $validated['model'],
            'year' => $validated['year'],
            'condition' => $validated['condition'],
            'listing_type' => $validated['listing_type'],
            'daily_price' => $validated['daily_price'] ?? 0,
            'monthly_price' => $validated['monthly_price'] ?? 0,
            'total_contract_price' => $validated['total_contract_price'] ?? 0,
            'sale_price' => $validated['sale_price'] ?? null,
            'description' => $validated['description'] ?? null,
            'photos' => $photos,
            'status' => 'available',
            'added_by' => $request->user()->id,
            'owner_id' => $request->user()->id,
        ]);

        return response()->json($motorcycle, 201);
    }

    // User: sell a motorcycle (marketplace)
    public function sell(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'year' => 'required|integer|min:1980|max:' . (date('Y') + 1),
            'sale_price' => 'required|numeric|min:0',
            'condition' => 'required|in:new,used',
            'description' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'location_name' => 'nullable|string|max:255',
            'photos' => 'nullable|array',
            'photos.*' => 'file|image|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validated = $validator->validated();

        $photos = [];
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $file) {
                $photos[] = $file->store('motorcycles', 'public');
            }
        }

        $motorcycle = Motorcycle::create([
            'brand' => $validated['brand'],
            'model' => $validated['model'],
            'year' => $validated['year'],
            'sale_price' => $validated['sale_price'],
            'condition' => $validated['condition'],
            'description' => $validated['description'] ?? null,
            'photos' => $photos,
            'listing_type' => 'sale',
            'status' => 'available',
            'owner_id' => $request->user()->id,
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'location_name' => $validated['location_name'] ?? null,
        ]);

        return response()->json($motorcycle, 201);
    }

    public function update(Request $request, $id)
    {
        $motorcycle = Motorcycle::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'brand' => 'sometimes|required|string|max:255',
            'model' => 'sometimes|required|string|max:255',
            'year' => 'sometimes|required|integer|min:1980|max:' . (date('Y') + 1),
            'daily_price' => 'sometimes|nullable|numeric|min:0',
            'monthly_price' => 'sometimes|nullable|numeric|min:0',
            'total_contract_price' => 'sometimes|nullable|numeric|min:0',
            'sale_price' => 'sometimes|nullable|numeric|min:0',
            'condition' => 'sometimes|required|in:new,used',
            'description' => 'sometimes|nullable|string',
            'latitude' => 'sometimes|nullable|numeric|between:-90,90',
            'longitude' => 'sometimes|nullable|numeric|between:-180,180',
            'location_name' => 'sometimes|nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $motorcycle->update($validator->validated());

        return response()->json($motorcycle);
    }

    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:available,rented,sold,maintenance',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $motorcycle = Motorcycle::findOrFail($id);
        $motorcycle->update(['status' => $request->status]);

        return response()->json($motorcycle);
    }

    public function destroy($id)
    {
        $motorcycle = Motorcycle::findOrFail($id);

        if (!empty($motorcycle->photos)) {
            foreach ($motorcycle->photos as $photo) {
                Storage::disk('public')->delete($photo);
            }
        }

        $motorcycle->delete();

        return response()->json(['message' => 'Motorcycle removed']);
    }
}