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
import { DatePickerInput } from "@/components/custom/FormElement";
import { router, useForm } from "@inertiajs/react";
import { format } from "date-fns";
import Chart from "react-apexcharts";
import {
    floatToIdCurrency,
    inputDebounce,
    ymdToIdDate,
} from "@/components/helper/helper";
import { ArrowDownRight, ArrowUpRight, Minus, TrendingUp } from "lucide-react";

type Props = {
    title: string;
    description: string;
    filters: {
        start_date: string;
        end_date: string;
    };
    statement: {
        gross_sales: number;
        cogs: number;
        gross_profit: number;
        operating_expenses: number;
        net_profit: number;
    };
    chart: {
        series: {
            name: string;
            data: number[];
        }[];
        categories: string[];
    };
    daily_summary: {
        date: string;
        sales: number;
        cogs: number;
        opex: number;
        net_profit: number;
    }[];
};

export default function ProfitLossReport({
    title,
    description,
    filters,
    statement,
    chart,
    daily_summary,
}: Props) {
    const firstRender = useRef(true);
    const { data: filterData, setData: setFilterData } = useForm({
        start_date: filters.start_date || "",
        end_date: filters.end_date || "",
    });

    const chartOptions = {
        chart: {
            id: "profit-loss-chart",
            toolbar: { show: false },
        },
        xaxis: {
            categories: chart.categories,
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                distributed: true,
                columnWidth: "50%",
            },
        },
        colors: [
            "#3b82f6",
            "#ef4444",
            statement.net_profit >= 0 ? "#10b981" : "#ef4444",
        ],
        dataLabels: { enabled: false },
        legend: { show: false },
        tooltip: {
            y: {
                formatter: (val: number) => floatToIdCurrency(val),
            },
        },
    };

    const debounceSearch = inputDebounce((data: typeof filterData) => {
        router.get(
            "/admin/finance/profit-loss",
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Statement Card */}
                <Card className="shadow-md border-t-4 border-t-yellow-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" /> Ringkasan Laba
                            Rugi
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Revenue Section */}
                        <div className="pb-4 border-b border-dashed">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-muted-foreground">
                                    Total Penjualan (Omzet)
                                </span>
                                <span className="font-semibold text-lg">
                                    {floatToIdCurrency(statement.gross_sales)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-red-500">
                                <span className="flex items-center gap-1 text-sm">
                                    <Minus className="w-3 h-3" /> Modal Barang
                                    (HPP)
                                </span>
                                <span>
                                    ({floatToIdCurrency(statement.cogs)})
                                </span>
                            </div>
                        </div>

                        {/* Gross Profit */}
                        <div className="flex justify-between items-center bg-gray-50 p-2 rounded-md font-medium">
                            <span className="text-sm">
                                Keuntungan Kotor (Sisa Penjualan)
                            </span>
                            <span>
                                {floatToIdCurrency(statement.gross_profit)}
                            </span>
                        </div>

                        {/* Expenses Section */}
                        <div className="pb-4 border-b border-dashed">
                            <div className="flex justify-between items-center text-red-500">
                                <span className="flex items-center gap-1 text-sm">
                                    <Minus className="w-3 h-3" /> Biaya
                                    Operasional (Listrik, Gaji, dll)
                                </span>
                                <span>
                                    (
                                    {floatToIdCurrency(
                                        statement.operating_expenses,
                                    )}
                                    )
                                </span>
                            </div>
                        </div>

                        {/* Net Profit */}
                        <div
                            className={`p-4 rounded-lg flex justify-between items-center border ${statement.net_profit >= 0 ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}
                        >
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold uppercase tracking-wider">
                                    Keuntungan Bersih
                                </span>
                                <span className="text-xs opacity-75">
                                    Uang yang benar-benar didapat
                                </span>
                            </div>
                            <div className="text-2xl font-bold flex items-center gap-2">
                                {statement.net_profit >= 0 ? (
                                    <ArrowUpRight className="w-6 h-6" />
                                ) : (
                                    <ArrowDownRight className="w-6 h-6" />
                                )}
                                {floatToIdCurrency(statement.net_profit)}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Chart Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Overview Keuangan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Chart
                            options={chartOptions}
                            series={chart.series}
                            type="bar"
                            height={350}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Daily Summary Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Rincian Harian</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead className="text-right">
                                    Penjualan (Omzet)
                                </TableHead>
                                <TableHead className="text-right">
                                    Modal Barang
                                </TableHead>
                                <TableHead className="text-right">
                                    Pengeluaran
                                </TableHead>
                                <TableHead className="text-right">
                                    Untung Bersih
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {daily_summary.length > 0 ? (
                                daily_summary.map((day, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            {ymdToIdDate(day.date, true)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {floatToIdCurrency(day.sales)}
                                        </TableCell>
                                        <TableCell className="text-right text-red-500">
                                            ({floatToIdCurrency(day.cogs)})
                                        </TableCell>
                                        <TableCell className="text-right text-red-500">
                                            ({floatToIdCurrency(day.opex)})
                                        </TableCell>
                                        <TableCell
                                            className={`text-right font-bold ${day.net_profit >= 0 ? "text-green-600" : "text-red-600"}`}
                                        >
                                            {floatToIdCurrency(day.net_profit)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center h-24"
                                    >
                                        Tidak ada data pada periode ini.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
