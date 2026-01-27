<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $guarded = ["id"];
    protected $hidden = ["updated_at"];

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
