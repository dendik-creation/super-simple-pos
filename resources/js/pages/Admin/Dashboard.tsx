import AppLayout from "@/partials/AppLayout";
import { PageTitle, PageTitleProps } from "@/partials/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { floatToIdCurrency, ymdToIdDate } from "@/components/helper/helper";
import { Banknote, ShoppingCart, Package, AlertTriangle } from "lucide-react";
import Chart from "react-apexcharts";
import DynamicCard from "@/components/custom/DynamicCard";

type DashboardProps = PageTitleProps & {
    summary: {
        revenue: number;
        transactions: number;
        best_seller: string;
        low_stock: number;
    };
    charts: {
        sales_trend: {
            date: string;
            revenue: number;
            count: number;
        }[];
    };
    recent_transactions: {
        id: number;
        invoice_code: string;
        customer?: { name: string };
        total: number;
        transaction_time: string;
    }[];
};

const AdminDashboard = ({
    title,
    description,
    summary,
    charts,
    recent_transactions,
}: DashboardProps) => {
    const salesTrendOptions = {
        chart: {
            type: "area" as const,
            height: 350,
            toolbar: { show: false },
        },
        colors: ["#10b981", "#3b82f6"],
        dataLabels: { enabled: false },
        stroke: { curve: "smooth" as const, width: 2 },
        xaxis: {
            categories: charts.sales_trend.map((item) => item.date),
        },
        yaxis: [
            {
                title: { text: "Pendapatan" },
                labels: {
                    formatter: (value: number) =>
                        `${(Number(value) / 1000).toFixed(0)}k`,
                },
            },
            {
                opposite: true,
                title: { text: "Transaksi" },
            },
        ],
        tooltip: {
            y: [
                {
                    formatter: (value: number) =>
                        floatToIdCurrency(Number(value)),
                },
                {
                    formatter: (value: number) => `${Number(value)} Trx`,
                },
            ],
        },
    };

    const salesTrendSeries = [
        {
            name: "Pendapatan",
            data: charts.sales_trend.map((item) => Number(item.revenue)),
        },
        {
            name: "Transaksi",
            data: charts.sales_trend.map((item) => Number(item.count)),
        },
    ];

    return (
        <AppLayout>
            <PageTitle title={title} description={description} />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <DynamicCard
                    title="Penjualan Hari Ini"
                    value={floatToIdCurrency(summary.revenue)}
                    icon={<Banknote className="w-32 h-32 text-green-100" />}
                    color="green"
                />
                <DynamicCard
                    title="Transaksi Hari Ini"
                    value={summary.transactions}
                    icon={<ShoppingCart className="w-32 h-32 text-blue-100" />}
                    color="blue"
                />
                <DynamicCard
                    title="Produk Terlaris"
                    value={summary.best_seller}
                    icon={<Package className="w-32 h-32 text-yellow-100" />}
                    color="yellow"
                />
                <DynamicCard
                    title="Stok Menipis (<5)"
                    value={summary.low_stock + " Produk"}
                    icon={<AlertTriangle className="w-32 h-32 text-red-100" />}
                    color="red"
                />
            </div>

            {/* Chart */}
            <div className="grid grid-cols-1 gap-6 mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Tren Penjualan (7 Hari Terakhir)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Chart
                            options={salesTrendOptions}
                            series={salesTrendSeries}
                            type="area"
                            height={350}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transactions Table */}
            <div className="grid grid-cols-1 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Transaksi Terbaru</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Kode Trx</TableHead>
                                    <TableHead>Pelanggan</TableHead>
                                    <TableHead className="text-right">
                                        Total
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recent_transactions.length > 0 ? (
                                    recent_transactions.map((trx) => (
                                        <TableRow key={trx.id}>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {trx.invoice_code}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {ymdToIdDate(
                                                        trx.transaction_time,
                                                        true,
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {trx.customer
                                                    ? trx.customer.name
                                                    : "Umum"}
                                            </TableCell>
                                            <TableCell className="text-right font-bold">
                                                {floatToIdCurrency(trx.total)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={3}
                                            className="text-center h-24"
                                        >
                                            Belum ada transaksi.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default AdminDashboard;
