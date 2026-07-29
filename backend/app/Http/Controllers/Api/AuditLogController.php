<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AuditLog::with('user:id,full_name,role');
        if ($request->filled('user_id')) $query->where('user_id', $request->user_id);
        return response()->json($query->latest()->paginate(30));
    }
}