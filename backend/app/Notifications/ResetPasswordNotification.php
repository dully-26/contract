<?php
namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public function __construct(protected string $url) {}

    public function via($notifiable) { return ['mail']; }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Reset Your Password - MotoContract')
            ->greeting("Hello {$notifiable->full_name},")
            ->line('You requested a password reset. Click below to set a new password.')
            ->action('Reset Password', $this->url)
            ->line('This link expires in 60 minutes. If you did not request this, ignore this email.');
    }
}