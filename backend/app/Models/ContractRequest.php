<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContractRequest extends Model
{
    protected $fillable = ['user_id','motorcycle_id','status','notes','reviewed_by','applicant_photo'];

    public function user() { return $this->belongsTo(User::class); }
    public function motorcycle() { return $this->belongsTo(Motorcycle::class); }
    public function contract() { return $this->hasOne(Contract::class); }
}