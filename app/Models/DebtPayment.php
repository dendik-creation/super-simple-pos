<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DebtPayment extends Model
{
    protected $guarded = ["id"];
    protected $casts = [
        "debt_id" => "integer",
        "paid_amount" => "integer",
    ];
    protected $hidden = ["created_at", "updated_at"];

    public function debt()
    {
        return $this->belongsTo(Debt::class);
    }
}
