<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create("transactions", function (Blueprint $table) {
            $table->id();
            $table->string("invoice_code")->unique();
            $table
                ->foreignId("customer_id")
                ->constrained("customers")
                ->onDelete("cascade");
            $table->string("payment_method");
            $table->integer("subtotal")->default(0);
            $table->integer("discount")->default(0);
            $table->integer("total")->default(0);
            $table->dateTime("transaction_time")->default(now());
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("transactions");
    }
};
