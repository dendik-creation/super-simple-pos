<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;
    protected $guarded = ["id"];
    protected $hidden = ["created_at", "updated_at"];
    protected $casts = [
        "stock" => "integer",
        "buy_price" => "integer",
        "sell_price" => "integer",
    ];
}
