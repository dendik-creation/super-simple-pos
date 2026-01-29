<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Debt;
use App\Models\Product;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class TransactionController extends Controller
{
    private function generateInvoiceCode()
    {
        $latestTransaction = Transaction::latest()->first();
        $lastInvoiceNumber = $latestTransaction
            ? (int) substr($latestTransaction->invoice_code, -4)
            : 0;
        $newInvoiceNumber = str_pad(
            $lastInvoiceNumber + 1,
            4,
            "0",
            STR_PAD_LEFT,
        );
        $invoiceCode = "TRX-" . date("Ymd") . "-" . $newInvoiceNumber;
        return $invoiceCode;
    }
    public function index(Request $request)
    {
        $search = $request->input("search", "");
        $start_date = $request->input("start_date", "");
        $end_date = $request->input("end_date", "");
        $payment_status = $request->input("payment_status", "");
        $transactions = Transaction::with("customer")
            ->when($search, function ($query, $search) {
                $query
                    ->where("invoice_code", "like", "%$search%")
                    ->orWhereHas("customer", function ($q) use ($search) {
                        $q->where("name", "like", "%$search%");
                    });
            })
            ->when($payment_status, function ($query, $payment_status) {
                $query->where("payment_status", $payment_status);
            })
            ->when($start_date, function ($query, $start_date) {
                $query->whereDate("transaction_time", ">=", $start_date);
            })
            ->when($end_date, function ($query, $end_date) {
                $query->whereDate("transaction_time", "<=", $end_date);
            })
            ->orderBy("transaction_time", "desc")
            ->paginate(config("custom.default.pagination_size"));
        return Inertia::render("Admin/Transaction/Index", [
            "title" => "Riwayat Transaksi",
            "description" => "Kelola transaksi penjualan Anda",
            "transactions" => $transactions,
            "filters" => [
                "search" => $search,
                "payment_status" => $payment_status,
                "start_date" => $start_date,
                "end_date" => $end_date,
            ],
        ]);
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
            "invoice_code" => $this->generateInvoiceCode(),
            "customer_id" => $customer_id,
            "subtotal" => $validated["subtotal"],
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
        // IF debt OR unfull paid amount, create Debt record
        if (
            $validated["payment_status"] === "debt" ||
            $validated["paid_amount"] < $validated["total"]
        ) {
            Debt::create([
                "transaction_id" => $transaction->id,
                "customer_id" => $customer_id,
                "debt_amount" =>
                    $validated["total"] - $validated["paid_amount"],
                "remaining_debt_amount" =>
                    $validated["total"] - $validated["paid_amount"],
            ]);
        }
        Session::flash("success", "Transaksi berhasil dibuat");
        return Inertia::location(route("admin.transactions.create"));
    }

    public function show($id)
    {
        $transaction = Transaction::with([
            "customer",
            "items.product",
            "debt.debt_payments",
        ])->findOrFail($id);
        return Inertia::render("Admin/Transaction/Show", [
            "title" => "Detail Transaksi",
            "description" => "Lihat detail transaksi penjualan",
            "transaction" => $transaction,
        ]);
    }

    public function edit($id)
    {
        $transaction = Transaction::with("items")->findOrFail($id);
        if (!$transaction) {
            return redirect()
                ->route("admin.transactions.index")
                ->with("error", "Transaksi tidak ditemukan");
        }
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
        return Inertia::render("Admin/Transaction/Edit", [
            "title" => "Edit Transaksi",
            "description" => "Ubah informasi dari transaksi",
            "products" => $products,
            "transaction" => $transaction,
            "customer_options" => $customer_options,
        ]);
    }

    public function update(Request $request, $id)
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

        // Find the transaction
        $transaction = Transaction::with(["items"])->findOrFail($id);

        // Restore stock for all old items
        foreach ($transaction->items as $oldItem) {
            $product = Product::find($oldItem->product_id);
            if ($product) {
                $product->stock += $oldItem->quantity;
                $product->save();
            }
        }

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

        // Update transaction
        $transaction->customer_id = $customer_id;
        $transaction->subtotal = $validated["subtotal"];
        $transaction->discount = $validated["discount"] ?: 0;
        $transaction->total = $validated["total"];
        $transaction->paid_amount = $validated["paid_amount"];
        $transaction->change_amount = $validated["change_amount"] ?: 0;
        $transaction->payment_status = $validated["payment_status"];
        $transaction->save();

        // Remove all old items
        $transaction->items()->delete();

        // Add new items and update stock
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
            if ($product) {
                $product->stock -= $item["quantity"];
                $product->save();
            }
        }

        // Update or create Debt record
        $debt = Debt::where("transaction_id", $transaction->id)->first();
        $shouldHaveDebt =
            $validated["payment_status"] === "debt" ||
            $validated["paid_amount"] < $validated["total"];
        $debtAmount = $validated["total"] - $validated["paid_amount"];

        if ($shouldHaveDebt) {
            if ($debt) {
                // Update existing debt
                $paid = $debt->debt_amount - $debt->remaining_debt_amount;
                $debt->debt_amount = $debtAmount;
                $debt->remaining_debt_amount = max($debtAmount - $paid, 0);
                $debt->customer_id = $customer_id;
                $debt->save();
            } else {
                // Create new debt
                Debt::create([
                    "transaction_id" => $transaction->id,
                    "customer_id" => $customer_id,
                    "debt_amount" => $debtAmount,
                    "remaining_debt_amount" => $debtAmount,
                ]);
            }
        } else {
            // If no longer debt, delete debt record
            if ($debt) {
                $debt->delete();
            }
        }

        Session::flash("success", "Transaksi berhasil diperbarui");
        return Inertia::location(
            route("admin.transactions.show", $transaction->id),
        );
    }

    public function destroy($id)
    {
        $transaction = Transaction::with("items")->findOrFail($id);
        if (!$transaction) {
            return redirect()
                ->route("admin.transactions.index")
                ->with("error", "Transaksi tidak ditemukan");
        }
        // Restore stock for all items
        foreach ($transaction->items as $item) {
            $product = Product::find($item->product_id);
            if ($product) {
                $product->stock += $item->quantity;
                $product->save();
            }
        }
        // Remove associated debt if exists
        $debt = Debt::where("transaction_id", $transaction->id)->first();
        if ($debt) {
            $debt->delete();
        }
        // Delete the transaction
        $transaction->delete();
        Session::flash("success", "Transaksi berhasil dihapus");
        return Inertia::location(route("admin.transactions.index"));
    }
}
