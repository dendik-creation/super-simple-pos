<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    protected $guarded = ["id"];
    protected $casts = [
        "amount" => "integer",
        "expense_time" => "datetime",
    ];
    protected $hidden = ["created_at", "updated_at"];
}
