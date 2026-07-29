<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contract extends Model
{
    protected $fillable = [
        'user_id',
        'issued_by',
        'motorcycle_id',
        'contract_request_id',
        'start_date',
        'end_date',
        'total_amount',
        'paid_amount',
        'balance',
        'status',
        'accepted_at',
        'rejected_at',
        'rejection_reason',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'accepted_at' => 'datetime',
        'rejected_at' => 'datetime',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'balance' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function issuedBy()
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    public function motorcycle()
    {
        return $this->belongsTo(Motorcycle::class);
    }

    public function contractRequest()
    {
        return $this->belongsTo(ContractRequest::class);
    }

    public function witnesses()
    {
        return $this->hasMany(Witness::class);
    }

    public function guarantors()
    {
        return $this->hasMany(Guarantor::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function daysUntilAutoTermination(): ?int
    {
        if ($this->status !== 'active' || !$this->end_date || $this->balance <= 0) {
            return null;
        }

        $graceDeadline = $this->end_date->copy()->addDays(7);
        $daysLeft = now()->diffInDays($graceDeadline, false);

        return max(0, (int) $daysLeft);
    }
}