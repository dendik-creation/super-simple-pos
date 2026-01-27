<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $guarded = ["id"];
    protected $casts = [
        "transaction_time" => "datetime",
        "subtotal" => "integer",
        "discount" => "integer",
        "total" => "integer",
        "paid_amount" => "integer",
        "change_amount" => "integer",
        "customer_id" => "integer",
    ];
    protected $hidden = ["created_at", "updated_at"];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function items()
    {
        return $this->hasMany(TransactionItem::class);
    }

    public function debt()
    {
        return $this->hasOne(Debt::class);
    }
}
