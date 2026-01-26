<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Debt extends Model
{
    protected $guarded = ["id"];
    protected $hidden = ["created_at", "updated_at"];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
