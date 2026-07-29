<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model {
    protected $fillable = ['contract_id','user_id','amount','method','recorded_by','reference','tx_ref','status','gateway_response'];
protected $casts = ['gateway_response' => 'array'];
    public function contract() { return $this->belongsTo(Contract::class); }
    public function user() { return $this->belongsTo(User::class); }
}