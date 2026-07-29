<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Witness extends Model {
    protected $fillable = ['contract_id','full_name','nida_number','phone','address'];
    public function contract() { return $this->belongsTo(Contract::class); }
}