<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();
        if ($request->has('role')) $query->where('role', $request->role);
        if ($request->has('search')) {
            $s = $request->search;
            $query->where('full_name', 'like', "%$s%")->orWhere('email', 'like', "%$s%");
        }
        return response()->json($query->latest()->get());
    }

    public function show($id)
    {
        return response()->json(User::with(['contracts.motorcycle', 'payments'])->findOrFail($id));
    }

    // Admin adds a manager
    public function storeManager(Request $request)
    {
        $request->validate([
            'full_name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string',
            'password' => 'required|string|min:6',
        ]);

        $manager = User::create([
            'full_name' => $request->full_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => 'manager',
            'is_active' => true,
        ]);

        return response()->json($manager, 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $user->update($request->only(['full_name', 'email', 'phone', 'address']));
        return response()->json($user);
    }

    public function toggleActive($id)
    {
        $user = User::findOrFail($id);
        $user->update(['is_active' => !$user->is_active]);
        return response()->json($user);
    }

    public function resetPassword(Request $request, $id)
    {
        $newPassword = Str::random(10);
        $user = User::findOrFail($id);
        $user->update(['password' => Hash::make($newPassword)]);

        // In production: email this to the user instead of returning it
        return response()->json(['message' => 'Password reset', 'temporary_password' => $newPassword]);
    }

    public function destroy($id)
    {
        User::findOrFail($id)->delete();
        return response()->json(['message' => 'User deleted']);
    }
}