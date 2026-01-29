import React, { useState, useEffect, useRef } from "react";
import AppLayout from "@/partials/AppLayout";
import { PageTitle } from "@/partials/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import DynamicCard from "@/components/custom/DynamicCard";
import {
    DatePickerInput,
    PaginatorBuilder,
} from "@/components/custom/FormElement";
import { router, useForm } from "@inertiajs/react";
import { format } from "date-fns";
import Chart from "react-apexcharts";
import { Banknote, CreditCard, DollarSign } from "lucide-react";
import {
    floatToIdCurrency,
    humanPaymentStatus,
    inputDebounce,
    ymdToIdDate,
} from "@/components/helper/helper";

type Props = {
    title: string;
    description: string;
    filters: {
        start_date: string;
        end_date: string;
    };
    stats: {
        gross_sales: number;
        net_sales: number;
        real_cash_received: number;
    };
    charts: {
        date: string;
        sales: number;
        cash_received: number;
    }[];
    transactions: {
        data: {
            id: number;
            invoice_code: string;
            transaction_time: string;
            customer?: { name: string };
            payment_status: "paid" | "debt";
            total: number;
            paid_amount: number;
        }[];
        links: any[];
        current_page: number;
        last_page: number;
        prev_page_url: string;
        next_page_url: string;
    };
};

export default function IncomesReport({
    title,
    description,
    filters,
    stats,
    charts,
    transactions,
}: Props) {
    const firstRender = useRef(true);
    const { data: filterData, setData: setFilterData } = useForm({
        start_date: filters.start_date || "",
        end_date: filters.end_date || "",
    });

    const chartOptions = {
        chart: {
            id: "incomes-chart",
            toolbar: { show: false },
        },
        xaxis: {
            categories: charts.map((c) => c.date),
        },
        stroke: {
            curve: "smooth" as const,
            width: 2,
        },
        colors: ["#10b981", "#3b82f6"],
        dataLabels: { enabled: false },
        tooltip: {
            y: {
                formatter: (val: number) => floatToIdCurrency(val),
            },
        },
    };

    const chartSeries = [
        {
            name: "Penjualan (Sales)",
            data: charts.map((c) => c.sales),
        },
        {
            name: "Uang Masuk (Cash)",
            data: charts.map((c) => c.cash_received),
        },
    ];

    const debounceSearch = inputDebounce((data: typeof filterData) => {
        router.get(
            "/admin/finance/income",
            {
                start_date: data.start_date,
                end_date: data.end_date,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    });

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        debounceSearch(filterData);
    }, [filterData]);

    return (
        <AppLayout>
            <PageTitle title={title} description={description} />

            {/* Filter */}
            <div className="mb-6 flex">
                <div className="w-full md:w-1/3">
                    <DatePickerInput
                        className="w-full"
                        mode="range"
                        placeholder="Pilih rentang tanggal transaksi"
                        value={
                            filterData.start_date && filterData.end_date
                                ? {
                                      from: new Date(filterData.start_date),
                                      to: new Date(filterData.end_date),
                                  }
                                : undefined
                        }
                        onChange={(dateRange) => {
                            if (dateRange && typeof dateRange === "string") {
                                const [start, end] = dateRange.split(" - ");
                                setFilterData((prev) => ({
                                    ...prev,
                                    start_date: start,
                                    end_date: end,
                                }));
                            }
                        }}
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <DynamicCard
                    title="Penjualan Kotor"
                    value={floatToIdCurrency(stats.gross_sales)}
                    icon={<Banknote className="w-32 h-32 text-green-100" />}
                    color="green"
                />
                <DynamicCard
                    title="Penjualan Bersih"
                    value={floatToIdCurrency(stats.net_sales)}
                    icon={<DollarSign className="w-32 h-32 text-blue-100" />}
                    color="blue"
                />
                <DynamicCard
                    title="Uang Tunai Diterima"
                    value={floatToIdCurrency(stats.real_cash_received)}
                    icon={<CreditCard className="w-32 h-32 text-purple-100" />}
                    color="purple"
                />
            </div>

            {/* Grafik */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Penjualan vs Uang Diterima</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Grafik ini menampilkan perbandingan penjualan dan uang
                        tunai yang diterima berdasarkan tanggal transaksi.
                    </p>
                </CardHeader>
                <CardContent>
                    <Chart
                        options={chartOptions}
                        series={chartSeries}
                        type="area"
                        height={350}
                    />
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Riwayat Transaksi</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Invoice</TableHead>
                                <TableHead>Pelanggan</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Total
                                </TableHead>
                                <TableHead className="text-right">
                                    Dibayar
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.data.length > 0 ? (
                                transactions.data.map((trx) => (
                                    <TableRow key={trx.id}>
                                        <TableCell>
                                            {ymdToIdDate(
                                                trx.transaction_time,
                                                true,
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {trx.invoice_code}
                                        </TableCell>
                                        <TableCell>
                                            {trx.customer
                                                ? trx.customer.name
                                                : "Umum"}
                                        </TableCell>
                                        <TableCell>
                                            {humanPaymentStatus(
                                                trx.payment_status,
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {floatToIdCurrency(trx.total)}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {floatToIdCurrency(trx.paid_amount)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center h-24"
                                    >
                                        Tidak ada data.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    <PaginatorBuilder
                        prevUrl={transactions.prev_page_url}
                        nextUrl={transactions.next_page_url}
                        currentPage={transactions.current_page}
                        totalPage={transactions.last_page}
                    />
                </CardContent>
            </Card>
        </AppLayout>
    );
}
