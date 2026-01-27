<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query("search", null);
        $products = Product::when($search, function ($query, $search) {
            return $query->where("name", "like", "%" . $search . "%");
        })
            ->orderBy("created_at", "desc")
            ->paginate(config("custom.default.pagination_size"));

        return Inertia::render("Admin/Product/Index", [
            "title" => "Daftar Produk",
            "description" => "Kelola data produk warung sembako Anda.",
            "products" => $products,
            "filters" => [
                "search" => $search,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            "name" => "required|string|max:255",
            "stock" => "required|integer|min:0",
            "buy_price" => "required|integer|min:0",
            "sell_price" => "required|integer|min:0",
            "save_as_expense" => "sometimes|boolean",
        ]);
        $with_expenses = $request->input("save_as_expense", false);
        Product::create($validated);
        if ($with_expenses) {
            Expense::create([
                "description" =>
                    "Penambahan " .
                    $validated["name"] .
                    " sebanyak " .
                    $validated["stock"],
                "expense_type" => "capital",
                "amount" => $validated["buy_price"] * $validated["stock"],
            ]);
        }
        Session::flash("success", "Produk berhasil ditambahkan");
        return Inertia::location(route("admin.products.index"));
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            "name" => "required|string|max:255",
            "stock" => "required|integer|min:0",
            "buy_price" => "required|integer|min:0",
            "sell_price" => "required|integer|min:0",
        ]);
        $product = Product::findOrFail($id);
        // diff stock up
        if ($product->stock < $validated["stock"]) {
            $added_stock = $validated["stock"] - $product->stock;
            Expense::create([
                "description" =>
                    "Penambahan stok untuk " .
                    $validated["name"] .
                    " sebanyak " .
                    $added_stock,
                "expense_type" => "capital",
                "amount" => $validated["buy_price"] * $added_stock,
            ]);
        }
        if ($product) {
            $product->update($validated);
        }
        Session::flash("success", "Produk berhasil diperbarui");
        return Inertia::location(route("admin.products.index"));
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        Session::flash("success", "Produk berhasil dihapus");
        return Inertia::location(route("admin.products.index"));
    }
}
