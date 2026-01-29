<?php

namespace App\Http\Controllers\Global;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();
        $last7Days = Carbon::today()->subDays(6);

        // 1. Stats (Today)
        
        // Total Sales Today
        $totalSalesToday = Transaction::whereDate('transaction_time', $today)->sum('total');
        
        // Total Transactions Today
        $totalTransactionsToday = Transaction::whereDate('transaction_time', $today)->count();

        // Best Seller Today
        $bestSellerItem = TransactionItem::select('product_id', DB::raw('SUM(quantity) as total_qty'))
            ->whereHas('transaction', function($query) use ($today) {
                $query->whereDate('transaction_time', $today);
            })
            ->groupBy('product_id')
            ->orderByDesc('total_qty')
            ->with('product')
            ->first();
        
        $bestSellerName = $bestSellerItem && $bestSellerItem->product ? $bestSellerItem->product->name : '-';

        // Low Stock (< 5)
        $lowStockCount = Product::where('stock', '<', 5)->count();

        // 2. Chart Data: Gross Sales for the last 7 days
        $salesTrend = Transaction::whereDate('transaction_time', '>=', $last7Days)
            ->select(
                DB::raw('DATE(transaction_time) as date'),
                DB::raw('sum(total) as revenue'),
                DB::raw('count(*) as count')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();
        
        $chartData = [];
        $period = CarbonPeriod::create($last7Days, Carbon::today());
        foreach($period as $date) {
            $dateStr = $date->format('Y-m-d');
            $dayData = $salesTrend->first(function($item) use ($dateStr) {
                return $item->date == $dateStr;
            });
            
            $chartData[] = [
                'date' => $date->format('d M'),
                'revenue' => $dayData ? $dayData->revenue : 0,
                'count' => $dayData ? $dayData->count : 0
            ];
        }

        // 3. Recent Transactions (5 latest)
        $recentTransactions = Transaction::with('customer')
            ->orderBy('transaction_time', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render("Admin/Dashboard", [
            "title" => "Dashboard",
            "description" => "Info cepat mengenai warung sembako Anda",
            "summary" => [
                "revenue" => $totalSalesToday,
                "transactions" => $totalTransactionsToday,
                "best_seller" => $bestSellerName,
                "low_stock" => $lowStockCount
            ],
            "charts" => [
                "sales_trend" => $chartData
            ],
            "recent_transactions" => $recentTransactions
        ]);
    }
}
