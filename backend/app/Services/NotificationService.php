<?php
namespace App\Services;

use App\Models\Notification;

class NotificationService
{
    public static function send($userId, $title, $message, $type = 'system')
    {
        return Notification::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $type,
        ]);
    }
}