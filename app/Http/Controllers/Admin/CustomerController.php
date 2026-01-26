<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input("search");

        $customers = Customer::when($search, function ($query, $search) {
            return $query
                ->where("name", "like", "%" . $search . "%")
                ->orWhere("phone", "like", "%" . $search . "%");
        })->paginate(config("app.custom.pagination_size"));

        return Inertia::render("Admin/Customer/Index", [
            "title" => "Daftar Pelanggan",
            "description" => "Halaman untuk mengelola data pelanggan.",
            "customers" => $customers,
            "filters" => [
                "search" => $search,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            "name" => "string|max:255",
            "phone" => "string|max:20|nullable",
            "address" => "string|max:500|nullable",
        ]);
        Customer::create($validated);
        Session::flash("success", "Pelanggan berhasil ditambahkan.");
        return Inertia::location(route("admin.customers.index"));
    }

    public function update(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);
        $validated = $request->validate([
            "name" => "string|max:255",
            "phone" => "string|max:20|nullable",
            "address" => "string|max:500|nullable",
        ]);
        $customer->update($validated);
        Session::flash("success", "Pelanggan berhasil diperbarui.");
        return Inertia::location(route("admin.customers.index"));
    }

    public function destroy($id)
    {
        $customer = Customer::findOrFail($id);
        $customer->delete();
        Session::flash("success", "Pelanggan berhasil dihapus.");
        return Inertia::location(route("admin.customers.index"));
    }
}
