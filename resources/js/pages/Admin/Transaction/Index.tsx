import ConfirmDialog from "@/components/custom/ConfirmDialog";
import EmptyTable from "@/components/custom/EmptyTable";
import {
    DatePickerInput,
    PaginatorBuilder,
    SearchInput,
    SelectSearchInput,
} from "@/components/custom/FormElement";
import {
    floatToIdCurrency,
    humanPaymentStatus,
    inputDebounce,
    ymdToIdDate,
} from "@/components/helper/helper";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import AppLayout from "@/partials/AppLayout";
import { PageTitle, PageTitleProps } from "@/partials/PageTitle";
import { PaginationData } from "@/types/global";
import { Transaction } from "@/types/transaction";
import { Link, router, useForm } from "@inertiajs/react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import React, { useEffect, useRef } from "react";

type PageProps = PageTitleProps & {
    transactions: PaginationData<Transaction>;
    filters: {
        search: string;
        payment_status: string;
        start_date: string;
        end_date: string;
    };
};
const AdminTransactionIndex = ({
    title,
    description,
    transactions,
    filters,
}: PageProps) => {
    const firstRender = useRef(true);
    const { data: filterData, setData: setFilterData } = useForm({
        search: filters.search || "",
        payment_status: filters.payment_status || "",
        start_date: filters.start_date || "",
        end_date: filters.end_date || "",
    });

    const handleFilter = (key: keyof typeof filterData, value: string) => {
        setFilterData(key, value);
    };

    const debounceSearch = inputDebounce((data: typeof filterData) => {
        router.get(
            "/admin/transactions/records",
            {
                search: data.search,
                payment_status: data.payment_status,
                start_date: data.start_date,
                end_date: data.end_date,
            },
            {
                preserveState: true,
                replace: true,
                only: ["transactions"],
            },
        );
    });

    const handleDelete = (id: number) => {
        router.delete(`/admin/transactions/${id}`, {
            preserveScroll: true,
            replace: true,
            only: ["transactions"],
        });
    };
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
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4 ">
                <SearchInput
                    placeholder={`Cari kode trx atau nama pelanggan`}
                    className="w-full"
                    onChange={(e) => handleFilter("search", e.target.value)}
                    value={filterData.search || ""}
                />
                <div className="w-full">
                    <SelectSearchInput
                        className="w-full"
                        placeholder="Pilih Status Pembayaran"
                        value={filterData.payment_status || ""}
                        options={[
                            {
                                label: "Lunas",
                                value: "paid",
                            },
                            {
                                label: "Kasbon",
                                value: "debt",
                            },
                        ]}
                        onChange={(value) =>
                            handleFilter("payment_status", value.toString())
                        }
                        removeValue={() => handleFilter("payment_status", "")}
                    />
                </div>
                <div className="w-full">
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

            {/* Tables */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="bg-stone-200 font-semibold">
                                #
                            </TableHead>
                            <TableHead className="bg-stone-200 font-semibold">
                                Kode Trx
                            </TableHead>
                            <TableHead className="bg-stone-200 font-semibold">
                                Pelanggan
                            </TableHead>
                            <TableHead className="bg-stone-200 font-semibold">
                                Waktu Trx
                            </TableHead>
                            <TableHead className="bg-stone-200 font-semibold">
                                Pembayaran
                            </TableHead>
                            <TableHead className="bg-stone-200 font-semibold">
                                Total Harga
                            </TableHead>
                            <TableHead className="bg-stone-200 font-semibold">
                                Dibayarkan
                            </TableHead>
                            <TableHead className="bg-stone-200 font-semibold">
                                Aksi
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.data.map((transaction, index) => (
                            <TableRow key={transaction.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>
                                    {transaction.invoice_code}
                                </TableCell>
                                <TableCell>
                                    {transaction.customer.name}
                                </TableCell>
                                <TableCell>
                                    {ymdToIdDate(
                                        transaction.transaction_time,
                                        true,
                                    )}
                                </TableCell>
                                <TableCell>
                                    {humanPaymentStatus(
                                        transaction.payment_status,
                                    )}
                                </TableCell>
                                <TableCell>
                                    {floatToIdCurrency(transaction.total)}
                                </TableCell>
                                <TableCell>
                                    {floatToIdCurrency(transaction.paid_amount)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/admin/transactions/${transaction.id}`}
                                        >
                                            <Button
                                                size={"icon"}
                                                variant={"outline"}
                                            >
                                                <Eye />
                                            </Button>
                                        </Link>
                                        <Link
                                            href={`/admin/transactions/edit/${transaction.id}`}
                                        >
                                            <Button
                                                size={"icon"}
                                                variant={"blue"}
                                            >
                                                <Pencil />
                                            </Button>
                                        </Link>
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
                                            title="Hapus transaksi"
                                            description="Menghapus transaksi menyebabkan perubahan laporan keuangan. Apakah anda yakin ?"
                                            type="danger"
                                            confirmAction={() =>
                                                handleDelete(transaction.id)
                                            }
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {transactions.data.length == 0 && (
                            <EmptyTable
                                colSpan={8}
                                message="Transaksi tidak ada"
                            />
                        )}
                    </TableBody>
                </Table>
            </div>
            {transactions.total > transactions.per_page && (
                <PaginatorBuilder
                    prevUrl={transactions.prev_page_url ?? "#"}
                    nextUrl={transactions.next_page_url ?? "#"}
                    currentPage={transactions.current_page}
                    totalPage={transactions.last_page}
                />
            )}
        </AppLayout>
    );
};

export default AdminTransactionIndex;
