import EmptyTable from "@/components/custom/EmptyTable";
import { PaginatorBuilder, SearchInput } from "@/components/custom/FormElement";
import { floatToIdCurrency, inputDebounce } from "@/components/helper/helper";
import { Badge } from "@/components/ui/badge";
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
import { Debt } from "@/types/debt";
import { PaginationData } from "@/types/global";
import { Link, router, useForm } from "@inertiajs/react";
import { Pencil } from "lucide-react";
import React, { useEffect, useRef } from "react";

type PageProps = PageTitleProps & {
    debts: PaginationData<Debt>;
    filters: {
        search: string;
    };
};

const AdminDebtIndex = ({ debts, filters, title, description }: PageProps) => {
    const firstRender = useRef(true);
    const { data: filterData, setData: setFilterData } = useForm({
        search: filters.search || "",
    });

    const handleFilter = (key: keyof typeof filterData, value: string) => {
        setFilterData(key, value);
    };

    const debounceSearch = inputDebounce((data: typeof filterData) => {
        router.get(
            "/admin/debts",
            {
                search: data.search,
            },
            {
                preserveState: true,
                replace: true,
                only: ["debts"],
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
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 w-full">
                    <SearchInput
                        placeholder={`Cari nama pelanggan`}
                        className="lg:max-w-sm w-full"
                        onChange={(e) => handleFilter("search", e.target.value)}
                        value={filterData.search || ""}
                    />
                </div>
            </div>

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
                                Total Hutang
                            </TableHead>
                            <TableHead className="bg-stone-200 font-semibold">
                                Terbayarkan
                            </TableHead>
                            <TableHead className="bg-stone-200 font-semibold">
                                Sisa Hutang
                            </TableHead>
                            <TableHead className="bg-stone-200 font-semibold">
                                Aksi
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {debts.data.map((debt, index) => (
                            <TableRow key={debt.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>
                                    <Link
                                        href={`/admin/transactions/${debt.transaction.id}`}
                                        className="text-blue-500 underline"
                                    >
                                        {debt.transaction.invoice_code}
                                    </Link>
                                </TableCell>
                                <TableCell>{debt.customer.name}</TableCell>
                                <TableCell>
                                    {floatToIdCurrency(debt.debt_amount)}
                                </TableCell>
                                <TableCell>
                                    {floatToIdCurrency(
                                        Number(
                                            debt.debt_payments.reduce(
                                                (sum, payment) =>
                                                    sum + payment.paid_amount,
                                                0,
                                            ),
                                        ),
                                    )}
                                </TableCell>
                                <TableCell>
                                    {debt.remaining_debt_amount <= 0 ? (
                                        <Badge variant="green">Lunas</Badge>
                                    ) : (
                                        floatToIdCurrency(
                                            debt.remaining_debt_amount,
                                        )
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Link href={`/admin/debts/edit/${debt.id}`}>
                                        <Button size={"icon"} variant={"blue"}>
                                            <Pencil />
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                        {debts.data.length == 0 && (
                            <EmptyTable
                                colSpan={6}
                                message="Hutang tidak ada"
                            />
                        )}
                    </TableBody>
                </Table>
            </div>
            {debts.total > debts.per_page && (
                <PaginatorBuilder
                    prevUrl={debts.prev_page_url ?? "#"}
                    nextUrl={debts.next_page_url ?? "#"}
                    currentPage={debts.current_page}
                    totalPage={debts.last_page}
                />
            )}
        </AppLayout>
    );
};

export default AdminDebtIndex;
