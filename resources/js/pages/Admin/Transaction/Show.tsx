import EmptyTable from "@/components/custom/EmptyTable";
import { floatToIdCurrency, ymdToIdDate } from "@/components/helper/helper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Transaction } from "@/types/transaction";
import { Link } from "@inertiajs/react";
import { Pencil, ShoppingBag, User, Wallet } from "lucide-react";
import React from "react";

type PageProps = PageTitleProps & {
    transaction: Transaction;
};

const AdminTransactionShow = ({
    title,
    description,
    transaction,
}: PageProps) => {
    console.log(transaction);
    return (
        <AppLayout>
            <div className="flex justify-between items-center mb-4">
                <PageTitle title={title} description={description} />
                <div className="">
                    <Link href={`/admin/transactions/edit/${transaction.id}`}>
                        <Button variant={"blue"}>
                            <Pencil />
                            <span>Edit Transaksi</span>
                        </Button>
                    </Link>
                </div>
            </div>

            <div
                className="
                    grid grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-1
                    gap-4 mb-4
                    w-full
                "
            >
                {/* Card 1: Cust Info */}
                <Card className="py-3 col-start-1 row-start-1 ">
                    <CardContent className="px-3">
                        <div className="flex items-center gap-3 mb-2">
                            <User className="text-slate-400" />
                            <h3 className="font-semibold">
                                Informasi Pelanggan
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 text-sm gap-2">
                            <div className="flex flex-col items-start">
                                <span className="font-semibold text-slate-600">
                                    Nama Pelanggan
                                </span>
                                <span>{transaction.customer.name}</span>
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="font-semibold text-slate-600">
                                    No Telepon
                                </span>
                                <span>{transaction.customer.phone || "-"}</span>
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="font-semibold text-slate-600">
                                    Alamat
                                </span>
                                <span>{transaction.customer.address}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                {/* Card 2: Trx Payment */}
                <Card className="py-3 col-start-1 row-start-2">
                    <CardContent className="px-3">
                        <div className="flex items-center gap-3 mb-2">
                            <Wallet className="text-slate-400" />
                            <h3 className="font-semibold">Detail Pembayaran</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 text-sm gap-2 mb-4">
                            <div className="flex flex-col items-start">
                                <span className="font-semibold text-slate-600">
                                    Status Pembayaran
                                </span>
                                <span>
                                    {transaction.payment_status == "paid" ? (
                                        <Badge variant="green">Lunas</Badge>
                                    ) : (
                                        <Badge variant="yellow">Hutang</Badge>
                                    )}
                                </span>
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="font-semibold text-slate-600">
                                    Total Transaksi
                                </span>
                                <span>
                                    {floatToIdCurrency(transaction.total)}
                                </span>
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="font-semibold text-slate-600">
                                    Total dibayar
                                </span>
                                <span>
                                    {floatToIdCurrency(transaction.paid_amount)}
                                </span>
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="font-semibold text-slate-600">
                                    Kembalian
                                </span>
                                <span>
                                    {transaction.change_amount == 0
                                        ? "-"
                                        : floatToIdCurrency(
                                              transaction.change_amount,
                                          )}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="font-semibold">
                                Riwayat Pelunasan (karena hutang)
                            </p>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="bg-stone-200 font-semibold">
                                                #
                                            </TableHead>
                                            <TableHead className="bg-stone-200 font-semibold">
                                                Nominal
                                            </TableHead>
                                            <TableHead className="bg-stone-200 font-semibold">
                                                Tanggal
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transaction.debt &&
                                        transaction.debt.debt_payments &&
                                        transaction.debt.debt_payments.length >
                                            0 ? (
                                            transaction.debt.debt_payments.map(
                                                (payment, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            {index + 1}
                                                        </TableCell>
                                                        <TableCell>
                                                            {floatToIdCurrency(
                                                                payment.paid_amount,
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {ymdToIdDate(
                                                                payment.payment_date,
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )
                                        ) : (
                                            <EmptyTable
                                                colSpan={3}
                                                message="Data pelunasan hutang tidak ada"
                                            />
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                {/* Card 3: Trx Details */}
                <Card className="py-3 col-start-1 md:col-start-2 row-start-3 md:row-start-1 md:row-span-2">
                    <CardContent className="px-3">
                        <div className="flex items-center gap-3 mb-2">
                            <ShoppingBag className="text-slate-400" />
                            <h3 className="font-semibold">Detail Transaksi</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-4">
                            <div className="flex flex-col items-start">
                                <span className="font-semibold text-slate-600">
                                    Kode Invoice
                                </span>
                                <span>{transaction.invoice_code}</span>
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="font-semibold text-slate-600">
                                    Waktu
                                </span>
                                <span>
                                    {ymdToIdDate(
                                        transaction.transaction_time,
                                        true,
                                    )}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <p className="font-semibold">Produk dibeli</p>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="bg-stone-200 font-semibold">
                                                #
                                            </TableHead>
                                            <TableHead className="bg-stone-200 font-semibold">
                                                Nama
                                            </TableHead>
                                            <TableHead className="bg-stone-200 font-semibold">
                                                Harga satuan
                                            </TableHead>
                                            <TableHead className="bg-stone-200 font-semibold">
                                                Qty
                                            </TableHead>
                                            <TableHead className="bg-stone-200 font-semibold">
                                                Total Harga
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transaction.items.length > 0 &&
                                            transaction.items.map(
                                                (item, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            {index + 1}
                                                        </TableCell>
                                                        <TableCell>
                                                            {item.product.name}
                                                        </TableCell>
                                                        <TableCell>
                                                            {floatToIdCurrency(
                                                                item.unit_price,
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {item.quantity}
                                                        </TableCell>
                                                        <TableCell>
                                                            {floatToIdCurrency(
                                                                item.total_price,
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )}
                                        {transaction.items.length === 0 && (
                                            <EmptyTable
                                                colSpan={4}
                                                message="Data produk tidak ada"
                                            />
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default AdminTransactionShow;
