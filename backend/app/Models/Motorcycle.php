<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Motorcycle extends Model
{
   protected $fillable = [
    'brand','model','year','plate_number','description','daily_price',
    'monthly_price','total_contract_price','sale_price','condition',
    'status','listing_type','photos','owner_id','added_by',
    'latitude','longitude','location_name'
];
    protected $casts = ['photos' => 'array'];

    public function owner() { return $this->belongsTo(User::class, 'owner_id'); }
    public function contractRequests() { return $this->hasMany(ContractRequest::class); }
    public function contracts() { return $this->hasMany(Contract::class); }
    public function sale() { return $this->hasOne(Sale::class); }
}