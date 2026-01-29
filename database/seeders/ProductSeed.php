<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeed extends Seeder
{
    public function run()
    {
        $products = [
            // SEMBAKO & BAHAN POKOK
            ["name" => "Beras Medium 5kg", "stock" => 10, "buy_price" => 68000, "sell_price" => 75000],
            ["name" => "Beras Premium 5kg", "stock" => 5, "buy_price" => 75000, "sell_price" => 82000],
            ["name" => "Minyak Goreng Bimoli 2L", "stock" => 12, "buy_price" => 34000, "sell_price" => 38000],
            ["name" => "Minyak Goreng Kita 1L", "stock" => 20, "buy_price" => 14500, "sell_price" => 16000],
            ["name" => "Gula Pasir 1kg", "stock" => 15, "buy_price" => 16500, "sell_price" => 18000],
            ["name" => "Telur Ayam 1kg", "stock" => 10, "buy_price" => 26000, "sell_price" => 29000],
            
            // MIE INSTAN
            ["name" => "Indomie Goreng Spesial", "stock" => 40, "buy_price" => 2850, "sell_price" => 3500],
            ["name" => "Indomie Kari Ayam", "stock" => 40, "buy_price" => 2900, "sell_price" => 3500],
            ["name" => "Mie Sedaap Goreng", "stock" => 40, "buy_price" => 2750, "sell_price" => 3500],

            // MINUMAN & KOPI
            ["name" => "Kopi Kapal Api Mix 20gr", "stock" => 50, "buy_price" => 1500, "sell_price" => 2000],
            ["name" => "Le Minerale 600ml", "stock" => 24, "buy_price" => 2800, "sell_price" => 4000],
            ["name" => "Teh Pucuk Harum 350ml", "stock" => 12, "buy_price" => 3200, "sell_price" => 4500],
            ["name" => "Susu Kental Manis Frisian Flag", "stock" => 15, "buy_price" => 11000, "sell_price" => 13000],

            // SABUN & KEBUTUHAN RUMAH
            ["name" => "Sabun Lifebuoy Merah 110gr", "stock" => 15, "buy_price" => 4500, "sell_price" => 5500],
            ["name" => "Shampoo Pantene Sachet", "stock" => 36, "buy_price" => 800, "sell_price" => 1500],
            ["name" => "Deterjen Rinso Cair 750ml", "stock" => 10, "buy_price" => 18500, "sell_price" => 21000],
            ["name" => "Pasta Gigi Pepsodent 190gr", "stock" => 12, "buy_price" => 13500, "sell_price" => 16000],

            // CAMILAN
            ["name" => "Chitato Sapi Panggang 68gr", "stock" => 10, "buy_price" => 9500, "sell_price" => 12000],
            ["name" => "Roma Kelapa 300gr", "stock" => 8, "buy_price" => 9000, "sell_price" => 11000],
        ];

        foreach ($products as $p) {
            DB::table("products")->insert([
                "name" => $p['name'],
                "stock" => $p['stock'],
                "buy_price" => $p['buy_price'],
                "sell_price" => $p['sell_price'],
                "created_at" => now(),
                "updated_at" => now(),
            ]);

            DB::table("expenses")->insert([
                "description" => "Penambahan " . $p['name'] . " sebanyak " . $p['stock'],
                "amount" => $p['buy_price'] * $p['stock'],
                "expense_type" => "capital",
                "expense_date" => now(),
                "created_at" => now(),
                "updated_at" => now(),
            ]);
        }
    }
}