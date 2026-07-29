<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Auth\Notifications\ResetPassword;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = ['full_name', 'email', 'phone', 'address', 'password', 'role', 'is_active'];
    protected $hidden = ['password', 'remember_token'];

    public function contracts() { return $this->hasMany(Contract::class); }
    public function contractRequests() { return $this->hasMany(ContractRequest::class); }
    public function payments() { return $this->hasMany(Payment::class); }
    public function motorcycles() { return $this->hasMany(Motorcycle::class, 'owner_id'); }

    public function isAdmin() { return $this->role === 'admin'; }
    public function isManager() { return $this->role === 'manager'; }

    public function sendPasswordResetNotification($token)
    {
        $url = config('app.frontend_url') . '/reset-password?token=' . $token . '&email=' . urlencode($this->email);
        $this->notify(new ResetPasswordNotification($url));
    }
}