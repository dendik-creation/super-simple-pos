<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionItem extends Model
{
    protected $guarded = ["id"];
    protected $hidden = ["created_at", "updated_at"];
    protected $casts = [
        "transaction_id" => "integer",
        "product_id" => "integer",
        "quantity" => "integer",
        "cost_price" => "integer",
        "unit_price" => "integer",
        "total_price" => "integer",
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }
}
