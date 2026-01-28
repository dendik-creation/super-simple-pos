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
            $table->integer("subtotal")->default(0);
            $table->integer("discount")->default(0);
            $table->integer("total")->default(0);
            $table->integer("paid_amount")->default(0);
            $table->integer("change_amount")->default(0);
            $table->enum("payment_status", ["paid", "debt"]);
            $table->dateTime("transaction_time")->useCurrent();
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
