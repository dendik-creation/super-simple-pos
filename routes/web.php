<?php

use Illuminate\Support\Facades\Route;
// Global Controllers
use App\Http\Controllers\Global\AuthController;
use App\Http\Controllers\Global\DashboardController;
use App\Http\Controllers\Global\ProfileController;
// Spesific Controllers
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\DebtController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\TransactionController;
use App\Http\Controllers\Admin\ReportController;

Route::get("/", [AuthController::class, "signedInStatus"])->name("login");
Route::prefix("auth")->group(function () {
    Route::get("/signin", [AuthController::class, "signInView"])
        ->name("auth.signin.index")
        ->middleware("guest");

    Route::post("/signin", [AuthController::class, "signIn"])
        ->middleware("guest")
        ->name("auth.signin.store");
});
Route::post("/auth/signout", [AuthController::class, "signOut"])
    ->middleware("auth")
    ->name("auth.signout.store");

// Admin Routes (Auth)
Route::prefix("admin")
    ->middleware("auth")
    ->group(function () {
        // Dashboard
        Route::get("/dashboard", [DashboardController::class, "index"])->name(
            "dashboard.index",
        );

        // Users
        Route::prefix("users")->group(function () {
            Route::get("/", [UserController::class, "index"])->name(
                "admin.users.index",
            );
            Route::post("/", [UserController::class, "store"])->name(
                "admin.users.store",
            );
            Route::put("/{user}", [UserController::class, "update"])->name(
                "admin.users.update",
            );
            Route::delete("/{user}", [UserController::class, "destroy"])->name(
                "admin.users.destroy",
            );
            Route::put("/{id}/reset-password", [
                UserController::class,
                "resetPassword",
            ])->name("admin.users.reset-password");
        });

        // Customers
        Route::prefix("customers")->group(function () {
            Route::get("/", [CustomerController::class, "index"])->name(
                "admin.customers.index",
            );
            Route::post("/", [CustomerController::class, "store"])->name(
                "admin.customers.store",
            );
            Route::put("/{user}", [CustomerController::class, "update"])->name(
                "admin.customers.update",
            );
            Route::delete("/{user}", [
                CustomerController::class,
                "destroy",
            ])->name("admin.customers.destroy");
        });

        // Products
        Route::prefix("products")->group(function () {
            Route::get("/", [ProductController::class, "index"])->name(
                "admin.products.index",
            );
            Route::post("/", [ProductController::class, "store"])->name(
                "admin.products.store",
            );
            Route::put("/{user}", [ProductController::class, "update"])->name(
                "admin.products.update",
            );
            Route::delete("/{user}", [
                ProductController::class,
                "destroy",
            ])->name("admin.products.destroy");
        });

        // Transactions
        Route::prefix("transactions")->group(function () {
            Route::get("/records", [
                TransactionController::class,
                "index",
            ])->name("admin.transactions.index");
            Route::get("/create", [
                TransactionController::class,
                "create",
            ])->name("admin.transactions.create");
            Route::post("/store", [
                TransactionController::class,
                "store",
            ])->name("admin.transactions.store");
            Route::get("/{id}", [TransactionController::class, "show"])->name(
                "admin.transactions.show",
            );
            Route::get("/edit/{id}", [
                TransactionController::class,
                "edit",
            ])->name("admin.transactions.edit");
            Route::put("/update/{id}", [
                TransactionController::class,
                "update",
            ])->name("admin.transactions.update");
            Route::delete("/{id}", [
                TransactionController::class,
                "destroy",
            ])->name("admin.transactions.destroy");
        });

        // Debts
        Route::prefix("debts")->group(function () {
            Route::get("/", [DebtController::class, "index"])->name(
                "admin.debts.index",
            );
            Route::get("/edit/{id}", [DebtController::class, "edit"])->name(
                "admin.debts.edit",
            );
            Route::put("/{id}", [DebtController::class, "update"])->name(
                "admin.debts.update",
            );
        });

        // Finance Reports
        Route::prefix("finance")->group(function () {
            Route::get("/income", [ReportController::class, "income"])->name(
                "admin.reports.income",
            );
            Route::get("/expense", [ReportController::class, "expense"])->name(
                "admin.reports.expense",
            );
            Route::post("/expense", [ReportController::class, "expenseStore"])->name(
                "admin.reports.expense.store",
            );
            Route::put("/expense/{id}", [ReportController::class, "expenseUpdate"])->name(
                "admin.reports.expense.update",
            );
            Route::delete("/expense/{id}", [ReportController::class, "expenseDestroy"])->name(
                "admin.reports.expense.destroy",
            );
            Route::get("/profit-loss", [ReportController::class, "profitLoss"])->name(
                "admin.reports.profit-loss",
            );
        });
    });

    // Global Routes
Route::middleware("auth")->group(function () {
    Route::put("/profile/update", [
        ProfileController::class,
        "profileUpdate",
    ])->name("profile.update");

    // Change Password
    Route::post("/profile/check-password", [
        ProfileController::class,
        "checkPassword",
    ])->name("profile.check-password");
    Route::put("/profile/change-password", [
        ProfileController::class,
        "changePassword",
    ])->name("profile.change-password");
});
