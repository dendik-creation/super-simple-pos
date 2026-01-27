<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Debt extends Model
{
    protected $guarded = ["id"];
    protected $hidden = ["created_at", "updated_at"];
    protected $casts = [
        "customer_id" => "integer",
        "transaction_id" => "integer",
        "debt_amount" => "integer",
        "remaining_debt_amount" => "integer",
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
