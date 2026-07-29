<?php
namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Request as Req;

class AuditLogger
{
    public static function log($userId, $action, $model = null, $modelId = null, $description = null)
    {
        AuditLog::create([
            'user_id' => $userId,
            'action' => $action,
            'model' => $model,
            'model_id' => $modelId,
            'description' => $description,
            'ip_address' => Req::ip(),
        ]);
    }
}