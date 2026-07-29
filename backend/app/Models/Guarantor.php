<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Guarantor extends Model {
    protected $fillable = ['contract_id','full_name','phone','address','nida_number'];
    public function contract() { return $this->belongsTo(Contract::class); }
}