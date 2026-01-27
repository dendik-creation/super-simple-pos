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
        Schema::create("debt_payments", function (Blueprint $table) {
            $table->id();
            $table
                ->foreignId("debt_id")
                ->constrained("debts")
                ->onDelete("cascade");

            $table->integer("paid_amount");
            $table->dateTime("payment_time")->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("debt_payments");
    }
};
