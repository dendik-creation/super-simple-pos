<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Session;

class TransactionController extends Controller
{
    private function generateInvoiceCode()
    {
        $latestTransaction = Transaction::latest()->first();
        $lastInvoiceNumber = $latestTransaction
            ? (int) substr($latestTransaction->invoice_code, -6)
            : 0;
        $newInvoiceNumber = str_pad(
            $lastInvoiceNumber + 1,
            6,
            "0",
            STR_PAD_LEFT,
        );
        $invoiceCode = "TRX-" . date("Ymd") . "-" . $newInvoiceNumber;
        return $invoiceCode;
    }
    public function index(Request $request)
    {
        return;
    }

    public function create(Request $request)
    {
        $products = Product::select(
            "id",
            "name",
            "sell_price",
            "stock",
            "buy_price",
        )
            ->orderBy("name", "asc")
            ->orderBy("stock", "desc")
            ->get();
        $customer_options = Customer::select("id", "name")
            ->orderBy("name")
            ->get()
            ->map(function ($customer) {
                return [
                    "value" => $customer->id,
                    "label" => $customer->name,
                ];
            });
        return Inertia::render("Admin/Transaction/Create", [
            "title" => "Transaksi Baru",
            "description" => "Buat transaksi penjualan baru",
            "products" => $products,
            "customer_options" => $customer_options,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            "customer_id" =>
                "nullable|integer|exists:customers,id|required_unless:is_new_customer,true",
            "is_new_customer" => "required|boolean",
            "new_customer" => "required_if:is_new_customer,true|array",
            "new_customer.name" => "nullable|string|max:255",
            "new_customer.phone" => "nullable|string|max:30",
            "new_customer.address" => "nullable|string|max:255",
            "items" => "required|array|min:1",
            "items.*.product_id" => "required|integer|exists:products,id",
            "items.*.name" => "required|string|max:255",
            "items.*.quantity" => "required|integer|min:1",
            "items.*.cost_price" => "required|numeric|min:0",
            "items.*.unit_price" => "required|numeric|min:0",
            "items.*.total_price" => "required|numeric|min:0",
            "items.*.with_force_price" => "required|boolean",
            "subtotal" => "required|numeric|min:0",
            "discount" => "nullable|numeric|min:0",
            "total" => "required|numeric|min:0",
            "paid_amount" => "required|numeric|min:0",
            "change_amount" => "nullable|numeric|min:0",
            "payment_status" => "required|in:paid,debt",
        ]);
        // Handle Customer
        $is_new_customer = $validated["is_new_customer"];
        $customer_id = null;
        if ($is_new_customer) {
            $new_customer_data = $validated["new_customer"];
            $customer = Customer::create([
                "name" => $new_customer_data["name"],
                "phone" => $new_customer_data["phone"] ?: null,
                "address" => $new_customer_data["address"] ?: null,
            ]);
            $customer_id = $customer->id;
        } else {
            $customer_id = $validated["customer_id"];
        }
        // Create Trx
        $transaction = Transaction::create([
            "customer_id" => $customer_id,
            "subtotal" => $validated["subtotal"],
            "invoice_code" => $this->generateInvoiceCode(),
            "discount" => $validated["discount"] ?: 0,
            "total" => $validated["total"],
            "paid_amount" => $validated["paid_amount"],
            "change_amount" => $validated["change_amount"] ?: 0,
            "payment_status" => $validated["payment_status"],
        ]);
        // Create Trx Items
        foreach ($validated["items"] as $item) {
            $transaction->items()->create([
                "transaction_id" => $transaction->id,
                "product_id" => $item["product_id"],
                "quantity" => $item["quantity"],
                "cost_price" => $item["cost_price"],
                "unit_price" => $item["unit_price"],
                "total_price" => $item["total_price"],
                "with_force_price" => $item["with_force_price"],
            ]);
            // Update Product Stock
            $product = Product::find($item["product_id"]);
            $product->stock -= $item["quantity"];
            $product->save();
        }
        Session::flash("success", "Transaksi berhasil dibuat");
        return Inertia::location(route("admin.transactions.create"));
    }
}
