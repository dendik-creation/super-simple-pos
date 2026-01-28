<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeed extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table("products")->insert([
            [
                "name" => "Beras Medium 5kg",
                "stock" => 5,
                "buy_price" => 65000,
                "sell_price" => 72000,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "name" => "Beras Premium 5kg",
                "stock" => 4,
                "buy_price" => 72000,
                "sell_price" => 80000,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "name" => "Gula Pasir 1kg",
                "stock" => 8,
                "buy_price" => 14000,
                "sell_price" => 16000,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "name" => "Minyak Goreng 1L",
                "stock" => 6,
                "buy_price" => 16000,
                "sell_price" => 18500,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "name" => "Minyak Goreng 2L",
                "stock" => 5,
                "buy_price" => 31000,
                "sell_price" => 35000,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "name" => "Tepung Terigu 1kg",
                "stock" => 7,
                "buy_price" => 9000,
                "sell_price" => 11000,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "name" => "Tepung Terigu 2kg",
                "stock" => 4,
                "buy_price" => 17500,
                "sell_price" => 20000,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "name" => "Telur Ayam 1kg",
                "stock" => 6,
                "buy_price" => 26000,
                "sell_price" => 29000,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "name" => "Garam Dapur 500gr",
                "stock" => 9,
                "buy_price" => 2500,
                "sell_price" => 3500,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "name" => "Garam Dapur 1kg",
                "stock" => 8,
                "buy_price" => 4500,
                "sell_price" => 6000,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "name" => "Mie Instan Goreng",
                "stock" => 9,
                "buy_price" => 2800,
                "sell_price" => 3500,
                "created_at" => now(),
                "updated_at" => now(),
            ],
            [
                "name" => "Mie Instan Kuah",
                "stock" => 9,
                "buy_price" => 2700,
                "sell_price" => 3500,
                "created_at" => now(),
                "updated_at" => now(),
            ],
        ]);
    }
}
