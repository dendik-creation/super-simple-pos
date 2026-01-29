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
    ErrorInput,
    SelectSearchInput,
} from "@/components/custom/FormElement";
import { router, useForm } from "@inertiajs/react";
import { format } from "date-fns";
import Chart from "react-apexcharts";
import {
    Banknote,
    Wallet,
    PieChart,
    Plus,
    Trash2,
    Pencil,
    Save,
    Loader,
    X,
} from "lucide-react";
import {
    floatToIdCurrency,
    inputDebounce,
    ymdToIdDate,
} from "@/components/helper/helper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import ConfirmDialog from "@/components/custom/ConfirmDialog";

type Expense = {
    id: number;
    description: string;
    amount: number;
    expense_type: "operational" | "capital" | "other";
    expense_date: string;
};

type Props = {
    title: string;
    description: string;
    filters: {
        start_date: string;
        end_date: string;
    };
    stats: {
        total_operational: number;
        total_capital: number;
        estimated_cogs: number;
    };
    chart: {
        series: number[];
        labels: string[];
    };
    expenses: {
        data: Expense[];
        links: any[];
        current_page: number;
        last_page: number;
        prev_page_url: string;
        next_page_url: string;
    };
};

const humanizeType = (type: string) => {
    switch (type) {
        case "operational":
            return "Operasional";
        case "capital":
            return "Modal (Capital)";
        case "other":
            return "Lain-lain";
        default:
            return type;
    }
};

const ModalExpenseForm = ({
    open,
    onOpenChange,
    expense,
    onClose,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    expense: Expense | null;
    onClose: () => void;
}) => {
    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            description: "",
            amount: "" as string | number,
            expense_type: "operational",
            expense_date: new Date().toISOString(),
        });

    useEffect(() => {
        if (open) {
            clearErrors();
            if (expense) {
                setData({
                    description: expense.description,
                    amount: expense.amount,
                    expense_type: expense.expense_type,
                    expense_date: expense.expense_date,
                });
            } else {
                reset();
                setData("expense_date", new Date().toISOString());
            }
        }
    }, [open, expense]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formattedDate = data.expense_date
            ? format(new Date(data.expense_date), "yyyy-MM-dd")
            : "";
        const payload = { ...data, expense_date: formattedDate };

        if (expense) {
            put("/admin/finance/expense/" + expense.id, {
                ...payload,
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        } else {
            post("/admin/finance/expense", {
                ...payload,
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {expense ? "Edit Pengeluaran" : "Tambah Pengeluaran"}
                    </DialogTitle>
                    <DialogDescription>
                        Isi detail pengeluaran manual (non-HPP).
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium">
                            Beban / Keterangan *
                        </label>
                        <Input
                            placeholder="Contoh: Bayar Listrik"
                            value={data.description}
                            onChange={(e) =>
                                setData("description", e.target.value)
                            }
                        />
                        {errors.description && (
                            <ErrorInput error={errors.description} />
                        )}
                    </div>
                    <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium">
                            Nominal (Rp) *
                        </label>
                        <Input
                            type="number"
                            placeholder="0"
                            value={data.amount}
                            onChange={(e) => setData("amount", e.target.value)}
                        />
                        {errors.amount && <ErrorInput error={errors.amount} />}
                    </div>
                    <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium">
                            Tipe Pengeluaran *
                        </label>
                        <SelectSearchInput
                            placeholder="Pilih Tipe"
                            options={[
                                { label: "Operasional", value: "operational" },
                                { label: "Modal (Capital)", value: "capital" },
                                { label: "Lain-lain", value: "other" },
                            ]}
                            value={data.expense_type}
                            onChange={(val) =>
                                setData("expense_type", String(val))
                            }
                        />
                        {errors.expense_type && (
                            <ErrorInput error={errors.expense_type} />
                        )}
                    </div>
                    <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium">Tanggal *</label>
                        <DatePickerInput
                            mode="single"
                            value={data.expense_date}
                            onChange={(val) =>
                                setData("expense_date", String(val))
                            }
                            placeholder="Pilih Tanggal"
                        />
                        {errors.expense_date && (
                            <ErrorInput error={errors.expense_date} />
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost" type="button" onClick={onClose}>
                            Batal
                        </Button>
                    </DialogClose>
                    <Button
                        variant="yellow"
                        onClick={handleSubmit}
                        disabled={processing}
                    >
                        {processing ? (
                            <Loader className="animate-spin w-4 h-4 mr-2" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Simpan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default function ExpenseReport({
    title,
    description,
    filters,
    stats,
    chart,
    expenses,
}: Props) {
    const firstRender = useRef(true);
    const { data: filterData, setData: setFilterData } = useForm({
        start_date: filters.start_date || "",
        end_date: filters.end_date || "",
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(
        null,
    );

    const debounceSearch = inputDebounce((data: typeof filterData) => {
        router.get(
            "/admin/finance/expense",
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

    const handleEdit = (expense: Expense) => {
        setSelectedExpense(expense);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedExpense(null);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        router.delete("/admin/finance/expense/" + id);
    };

    const chartOptions = {
        labels: chart.labels,
        colors: ["#ef4444", "#3b82f6", "#a855f7"], // Red, Blue, Purple
        legend: { position: "bottom" as const },
        plotOptions: {
            pie: {
                donut: {
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: "Total",
                            formatter: function (w: any) {
                                const total = w.globals.seriesTotals.reduce(
                                    (a: number, b: number) => a + b,
                                    0,
                                );
                                return floatToIdCurrency(total);
                            },
                        },
                    },
                },
            },
        },
        tooltip: {
            y: {
                formatter: (val: number) => floatToIdCurrency(val),
            },
        },
    };

    return (
        <AppLayout>
            <PageTitle title={title} description={description} />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
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
                <Button variant="yellow" onClick={handleAdd}>
                    <Plus className="w-4 h-4 mr-2" /> Tambah Pengeluaran
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <DynamicCard
                    title="Total Operasional"
                    value={floatToIdCurrency(stats.total_operational)}
                    icon={<Banknote className="w-32 h-32 text-red-100" />}
                    color="red"
                />
                <DynamicCard
                    title="Total Modal (Capital)"
                    value={floatToIdCurrency(stats.total_capital)}
                    icon={<Wallet className="w-32 h-32 text-blue-100" />}
                    color="blue"
                />
                <DynamicCard
                    title="Estimasi HPP (COGS)"
                    value={floatToIdCurrency(stats.estimated_cogs)}
                    icon={<PieChart className="w-32 h-32 text-purple-100" />}
                    color="purple"
                    subfooter={
                        <span className="text-xs text-muted-foreground">
                            Dari item terjual
                        </span>
                    }
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Proporsi Pengeluaran</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Chart
                            options={chartOptions}
                            series={chart.series}
                            type="donut"
                            height={350}
                        />
                    </CardContent>
                </Card>

                {/* Table */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Riwayat Pengeluaran (Manual)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Keterangan</TableHead>
                                    <TableHead>Tipe</TableHead>
                                    <TableHead className="text-right">
                                        Nominal
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenses.data.length > 0 ? (
                                    expenses.data.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                {ymdToIdDate(item.expense_date)}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {item.description}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                        item.expense_type ===
                                                        "operational"
                                                            ? "bg-red-100 text-red-700"
                                                            : item.expense_type ===
                                                                "capital"
                                                              ? "bg-blue-100 text-blue-700"
                                                              : "bg-gray-100 text-gray-700"
                                                    }`}
                                                >
                                                    {humanizeType(
                                                        item.expense_type,
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {floatToIdCurrency(item.amount)}
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button
                                                    size="icon"
                                                    variant="blue"
                                                    onClick={() =>
                                                        handleEdit(item)
                                                    }
                                                >
                                                    <Pencil />
                                                </Button>
                                                <ConfirmDialog
                                                    triggerNode={
                                                        <span>
                                                            <Button
                                                                variant={"red"}
                                                                size={"icon"}
                                                            >
                                                                <Trash2 />
                                                            </Button>
                                                        </span>
                                                    }
                                                    title="Hapus Pengeluaran"
                                                    description="Menghapus pengeluaran menyebabkan kehilangan riwayat transaksi pengeluaran. Apakah anda yakin ?"
                                                    type="danger"
                                                    confirmAction={() =>
                                                        handleDelete(item.id)
                                                    }
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center h-24"
                                        >
                                            Tidak ada data pengeluaran manual.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <PaginatorBuilder
                            prevUrl={expenses.prev_page_url}
                            nextUrl={expenses.next_page_url}
                            currentPage={expenses.current_page}
                            totalPage={expenses.last_page}
                        />
                    </CardContent>
                </Card>
            </div>

            <ModalExpenseForm
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                expense={selectedExpense}
                onClose={() => setIsModalOpen(false)}
            />
        </AppLayout>
    );
}
