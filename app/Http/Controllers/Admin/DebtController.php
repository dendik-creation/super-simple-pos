<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Debt;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class DebtController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search', '');
        $debts = Debt::with("customer", "transaction" ,"debt_payments")->when($search, function ($query, $search) {
            return $query->whereHas('customer', function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%");
            });
        })->paginate(config("custom.default.pagination_size"));
        return Inertia::render('Admin/Debt/Index', [
        "title" => "Daftar Hutang Pelanggan",
        "description" => "Hutang diambil dari transaksi yang belum lunas",    
        'debts' => $debts,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function edit($id)
    {
        $debt = Debt::with('customer', 'transaction', 'debt_payments')->findOrFail($id);
        return Inertia::render('Admin/Debt/Edit', [
            "title" => "Edit Hutang Pelanggan",
            "description" => "Pelunasan dapat dilakukan disini",
            'debt' => $debt,
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'payments' => 'required|array',
            'payments.*.paid_amount' => 'required|integer|min:1',
            'payments.*.payment_date' => 'required|date',
            'payments.*.action' => 'required|in:existing,new,removed',
        ]);

        $debt = Debt::with('debt_payments')->findOrFail($id);
        
        // Calculate expected total paid properly by excluding removed items
        $totalPaidBeforeSave = collect($request->payments)
            ->filter(fn($p) => $p['action'] !== 'removed')
            ->sum('paid_amount');

        if($totalPaidBeforeSave > $debt->debt_amount){
            return back()->withErrors(['message' => 'Total pelunasan melebihi total hutang']);
        }
        

        foreach ($request->payments as $paymentData) {
            if ($paymentData['action'] === 'existing' && isset($paymentData['id'])) {
                $payment = $debt->debt_payments->where('id', $paymentData['id'])->first();
                if ($payment) {
                    $payment->update([
                        'paid_amount' => $paymentData['paid_amount'],
                        'payment_date' => $paymentData['payment_date'],
                    ]);
                }
            } elseif ($paymentData['action'] === 'new') {
                $debt->debt_payments()->create([
                    'paid_amount' => $paymentData['paid_amount'],
                    'payment_date' => $paymentData['payment_date'],
                ]);
            } elseif ($paymentData['action'] === 'removed' && isset($paymentData['id'])) {
                $payment = $debt->debt_payments->where('id', $paymentData['id'])->first();
                if ($payment) {
                    $payment->delete();
                }
            }
        }

        // Refresh debt payments to get the latest data from DB
        $debt->load('debt_payments');

        // Recalculate remaining_debt_amount
        $totalPaid = $debt->debt_payments->sum('paid_amount');
        $debt->remaining_debt_amount = $debt->debt_amount - $totalPaid;
        $debt->save();

        // Update transaction if debt paid
        if ($debt->transaction_id) {
            $transaction = Transaction::find($debt->transaction_id);
            if ($transaction) {
                if ($debt->remaining_debt_amount <= 0) {
                    $transaction->update([
                        "payment_status" => "paid",
                    ]);
                } else {
                    $transaction->update([
                        "payment_status" => "debt",
                    ]);
                }
            }
        }

        Session::flash('success', 'Pembayaran hutang berhasil diperbarui');
        return Inertia::location(route('admin.debts.index'));
    }
}
