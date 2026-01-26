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
        Schema::create("debts", function (Blueprint $table) {
            $table->id();
            $table
                ->foreignId("customer_id")
                ->constrained("customers")
                ->onDelete("cascade");
            $table->integer("debt_amount");
            $table->dateTime("debt_date")->default(now());
            $table->integer("paid_amount");
            $table->dateTime("completed_at")->nullable();
            $table
                ->foreignId("transaction_id")
                ->constrained("transactions")
                ->onDelete("cascade");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("debts");
    }
};
