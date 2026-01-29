<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DebtPayment;
use App\Models\Expense;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\Session;

class ReportController extends Controller
{
    public function income(Request $request){
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));

        // Ensure dates are parsed correctly for DB queries (start of day / end of day)
        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        // 1. Stats
        // Gross Sales: Sum transactions.total
        $grossSales = Transaction::whereBetween('transaction_time', [$start, $end])
            ->sum('total');

        // Net Sales: Sum (transactions.total - transactions.discount)
        // Note: Using raw query for calculation as requested
        $netSales = Transaction::whereBetween('transaction_time', [$start, $end])
            ->sum(DB::raw('total - discount'));

        // Real Cash Received: Sum transactions.paid_amount + Sum debt_payments.paid_amount
        $transactionCash = Transaction::whereBetween('transaction_time', [$start, $end])
            ->sum('paid_amount');
        
        $debtPaymentCash = DebtPayment::whereBetween('created_at', [$start, $end])
            ->sum('paid_amount');
        
        $realCashReceived = $transactionCash + $debtPaymentCash;

        // 2. Chart Data (Sales vs Cash Received per day)
        // Group Transactions by Date for Sales and Transaction Cash
        $dailyTransactions = Transaction::whereBetween('transaction_time', [$start, $end])
            ->select(
                DB::raw('DATE(transaction_time) as date'),
                DB::raw('SUM(total) as sales'),
                DB::raw('SUM(paid_amount) as cash')
            )
            ->groupBy('date')
            ->get()
            ->keyBy('date');

        // Group Debt Payments by Date for Debt Cash
        $dailyDebtPayments = DebtPayment::whereBetween('created_at', [$start, $end])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(paid_amount) as cash')
            )
            ->groupBy('date')
            ->get()
            ->keyBy('date');

        $chartData = [];
        $period = CarbonPeriod::create($startDate, $endDate);

        foreach ($period as $date) {
            $dateStr = $date->format('Y-m-d');
            
            $trxData = $dailyTransactions->get($dateStr);
            $debtData = $dailyDebtPayments->get($dateStr);

            $sales = $trxData ? $trxData->sales : 0;
            $trxCash = $trxData ? $trxData->cash : 0;
            $debtCash = $debtData ? $debtData->cash : 0;

            $chartData[] = [
                'date' => $date->format('d M'),
                'sales' => $sales,
                'cash_received' => $trxCash + $debtCash,
            ];
        }

        // 3. Table Data (Transactions)
        $transactions = Transaction::with('customer')
            ->whereBetween('transaction_time', [$start, $end])
            ->orderBy('transaction_time', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render("Admin/Report/Incomes", [
            "title" => "Laporan Pendapatan",
            "description" => "Laporan pendapatan dari penjualan dan transaksi",
            "filters" => [
                "start_date" => $startDate,
                "end_date" => $endDate,
            ],
            "stats" => [
                "gross_sales" => $grossSales,
                "net_sales" => $netSales,
                "real_cash_received" => $realCashReceived,
            ],
            "charts" => $chartData,
            "transactions" => $transactions,
        ]);
    }
    public function expense(Request $request){
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));

        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        // 1. Stats
        // Manual Expenses
        $expensesQuery = Expense::whereBetween('expense_date', [$start, $end]);
        $totalOperational = (clone $expensesQuery)->where('expense_type', 'operational')->sum('amount');
        $totalCapital = (clone $expensesQuery)->where('expense_type', 'capital')->sum('amount');

        // Estimated COGS (HPP)
        // Sum (transaction_items.cost_price * transaction_items.quantity)
        $estimatedCogs = TransactionItem::whereHas('transaction', function($query) use ($start, $end) {
            $query->whereBetween('transaction_time', [$start, $end]);
        })->sum(DB::raw('cost_price * quantity'));
        
        // 2. Chart Data (Proportion)
        $chartData = [
            'series' => [$totalOperational, $totalCapital, $estimatedCogs],
            'labels' => ['Operasional', 'Modal (Capital)', 'Estimasi HPP']
        ];

        // 3. Table Data
        $expenses = Expense::whereBetween('expense_date', [$start, $end])
            ->orderBy('expense_date', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render("Admin/Report/Expense", [
            "title" => "Laporan Pengeluaran",
            "description" => "Laporan pengeluaran dari pembelian dan transaksi lainnya",
            "filters" => [
                "start_date" => $startDate,
                "end_date" => $endDate,
            ],
            "stats" => [
                "total_operational" => $totalOperational,
                "total_capital" => $totalCapital,
                "estimated_cogs" => $estimatedCogs,
            ],
            "chart" => $chartData,
            "expenses" => $expenses,
        ]);
    }

    public function expenseStore(Request $request)
    {
        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'expense_type' => 'required|in:operational,capital,other',
            'expense_date' => 'required|date',
        ]);

        Expense::create($validated);

        Session::flash('success', 'Pengeluaran berhasil disimpan.');
        return Inertia::location(route('admin.reports.expense'));
    }

    public function expenseUpdate(Request $request, $id)
    {
        $expense = Expense::findOrFail($id);
        
        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'expense_type' => 'required|in:operational,capital,other',
            'expense_date' => 'required|date',
        ]);

        $expense->update($validated);


        Session::flash('success', 'Pengeluaran berhasil disimpan.');
        return Inertia::location(route('admin.reports.expense'));
    }

    public function expenseDestroy($id)
    {
        $expense = Expense::findOrFail($id);
        $expense->delete();


        Session::flash('success', 'Pengeluaran berhasil dihapus.');
        return Inertia::location(route('admin.reports.expense'));
    }

    public function profitLoss(Request $request){
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));

        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        // 1. Calculations
        // Gross Sales
        $grossSales = Transaction::whereBetween('transaction_time', [$start, $end])->sum('total');

        // COGS
        $cogs = TransactionItem::whereHas('transaction', function($query) use ($start, $end) {
            $query->whereBetween('transaction_time', [$start, $end]);
        })->sum(DB::raw('cost_price * quantity'));

        // Gross Profit
        $grossProfit = $grossSales - $cogs;

        // Operating Expenses
        $operatingExpenses = Expense::whereBetween('expense_date', [$start, $end])
            ->where('expense_type', 'operational')
            ->sum('amount');

        // Net Profit
        $netProfit = $grossProfit - $operatingExpenses;

        // 2. Chart Data (Bar Chart)
        $totalExpenses = $cogs + $operatingExpenses;
        $chartData = [
            'series' => [
                [
                    'name' => 'Keuangan',
                    'data' => [$grossSales, $totalExpenses, $netProfit]
                ]
            ],
            'categories' => ['Omzet Penjualan', 'Total Pengeluaran', 'Keuntungan Bersih']
        ];

        // 3. Daily Summary Table
        $period = CarbonPeriod::create($startDate, $endDate);
        $dailySummary = [];
        
        // Fetch daily data for efficient mapping
        $dailySales = Transaction::whereBetween('transaction_time', [$start, $end])
            ->select(DB::raw('DATE(transaction_time) as date'), DB::raw('SUM(total) as total'))
            ->groupBy('date')
            ->pluck('total', 'date');

        $dailyCogs = TransactionItem::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->whereBetween('transactions.transaction_time', [$start, $end])
            ->select(DB::raw('DATE(transactions.transaction_time) as date'), DB::raw('SUM(transaction_items.cost_price * transaction_items.quantity) as total'))
            ->groupBy('date')
            ->pluck('total', 'date');

        $dailyOpEx = Expense::whereBetween('expense_date', [$start, $end])
            ->where('expense_type', 'operational')
             ->select(DB::raw('DATE(expense_date) as date'), DB::raw('SUM(amount) as total'))
            ->groupBy('date')
            ->pluck('total', 'date');
            
        foreach($period as $date) {
            $dateStr = $date->format('Y-m-d');
            $dSales = $dailySales->get($dateStr) ?? 0;
            $dCogs = $dailyCogs->get($dateStr) ?? 0;
            $dOpEx = $dailyOpEx->get($dateStr) ?? 0;
            $dNet = ($dSales - $dCogs) - $dOpEx;

            if ($dSales > 0 || $dOpEx > 0) {
                 $dailySummary[] = [
                    'date' => $dateStr,
                    'sales' => $dSales,
                    'cogs' => $dCogs,
                    'opex' => $dOpEx,
                    'net_profit' => $dNet
                ];
            }
        }
        
        // Reverse order (newest first)
        $dailySummary = array_reverse($dailySummary);

        return Inertia::render("Admin/Report/ProfitLoss", [
            "title" => "Ringkasan Laba Rugi",
            "description" => "Lihat berapa banyak uang masuk, keluar, dan sisa keuntungan bersih.",
            "filters" => [
                "start_date" => $startDate,
                "end_date" => $endDate,
            ],
            "statement" => [
                "gross_sales" => $grossSales,
                "cogs" => $cogs,
                "gross_profit" => $grossProfit,
                "operating_expenses" => $operatingExpenses,
                "net_profit" => $netProfit
            ],
            "chart" => $chartData,
            "daily_summary" => $dailySummary
        ]);
    }
}
