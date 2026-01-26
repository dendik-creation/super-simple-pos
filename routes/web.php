<?php

use Illuminate\Support\Facades\Route;
// Global Controllers
use App\Http\Controllers\Global\AuthController;
use App\Http\Controllers\Global\DashboardController;
// Spesific Controllers
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\CustomerController;

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
    });
