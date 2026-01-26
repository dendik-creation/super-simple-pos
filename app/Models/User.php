<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    // Role constants
    const ROLE_ADMIN = "admin";

    protected $guarded = ["id"];
    protected $hidden = ["password", "created_at", "updated_at"];
    protected function casts(): array
    {
        return [
            "password" => "hashed",
        ];
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class, "cashier_id");
    }
}
