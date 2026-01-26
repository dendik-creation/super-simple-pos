<?php

namespace App\Http\Controllers\Global;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render("Admin/Dashboard", [
            "title" => "Dashboard",
            "description" => "Info cepat mengenai warung sembako Anda",
        ]);
    }
}
