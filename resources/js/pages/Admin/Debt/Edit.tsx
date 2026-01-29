import BlastToaster from "@/components/custom/BlastToaster";
import { DatePickerInput, ErrorInput } from "@/components/custom/FormElement";
import { floatToIdCurrency } from "@/components/helper/helper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import AppLayout from "@/partials/AppLayout";
import { PageTitle, PageTitleProps } from "@/partials/PageTitle";
import { Debt } from "@/types/debt";
import { useForm } from "@inertiajs/react";
import {
    Banknote,
    BanknoteX,
    HandCoins,
    Loader2,
    Plus,
    Save,
    Trash2,
    User,
} from "lucide-react";
import React, { useEffect } from "react";

type PageProps = PageTitleProps & {
    debt: Debt;
};

const AdminDebtEdit = ({ title, description, debt }: PageProps) => {
    const { data, setData, processing, errors, setError, clearErrors, put } =
        useForm({
            payments: debt.debt_payments.map((payment) => ({
                id: payment.id || null,
                paid_amount: payment.paid_amount || 0,
                payment_date: payment.payment_date || "",
                action: "existing" as "existing" | "new" | "removed",
            })),
        });

    const handleAddPayment = () => {
        setData("payments", [
            ...data.payments,
            {
                id: null,
                paid_amount: 0,
                payment_date: new Date().toISOString().split("T")[0],
                action: "new",
            },
        ]);
    };

    const handleRemovePayment = (idx: number) => {
        const updatedPayments = data.payments
            .map((payment, index) => {
                if (index === idx) {
                    if (payment.action === "new") {
                        return null;
                    }
                    return {
                        ...payment,
                        action: "removed",
                    };
                }
                return payment;
            })
            .filter((payment) => payment !== null);
        setData("payments", updatedPayments as typeof data.payments);
    };

    const handleChange = (
        idx: number,
        field: keyof (typeof data.payments)[0],
        value: any,
    ) => {
        const updatedPayments = data.payments.map((payment, index) => {
            if (index === idx) {
                return {
                    ...payment,
                    [field]: value,
                };
            }
            return payment;
        });
        setData("payments", updatedPayments as typeof data.payments);
    };

    const validateForm = (): boolean => {
        let isValid = true;
        clearErrors();
        data.payments.forEach((payment, idx) => {
            if (payment.paid_amount <= 0) {
                setError(`payments.${idx}.paid_amount`, "Harus lebih dari 0");
                isValid = false;
            }
        });
        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        put(`/admin/debts/${debt.id}`, {
            preserveScroll: true,
            replace: true,
            onError: (err) => {
                BlastToaster("error", err.message || "Terjadi kesalahan");
            },
        });
    };
    return (
        <AppLayout>
            <PageTitle title={title} description={description} />

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                    <Card className="py-3">
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
                                    <span>{debt.customer.name}</span>
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="font-semibold text-slate-600">
                                        No Telepon
                                    </span>
                                    <span>{debt.customer.phone || "-"}</span>
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="font-semibold text-slate-600">
                                        Alamat
                                    </span>
                                    <span>{debt.customer.address}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="py-3">
                        <CardContent className="px-3">
                            <div className="flex items-center gap-3 mb-2">
                                <HandCoins className="text-slate-400" />
                                <h3 className="font-semibold">Detail Hutang</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 text-sm gap-2">
                                <div className="flex flex-col items-start">
                                    <span className="font-semibold text-slate-600">
                                        Total Hutang
                                    </span>
                                    <span>
                                        {floatToIdCurrency(debt.debt_amount)}
                                    </span>
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="font-semibold text-slate-600">
                                        Sisa Hutang
                                    </span>
                                    <span>
                                        {floatToIdCurrency(
                                            debt.remaining_debt_amount,
                                        )}
                                    </span>
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="font-semibold text-slate-600">
                                        Terbayarkan
                                    </span>
                                    <span>
                                        {floatToIdCurrency(
                                            debt.debt_amount -
                                                debt.remaining_debt_amount,
                                        )}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="py-3 lg:col-span-2">
                        <CardContent className="px-3">
                            <div className="mb-4 flex flex-col justify-start lg:flex-row lg:justify-between lg:gap-3">
                                <div className="flex items-center gap-3 mb-2">
                                    <Banknote className="text-slate-400" />
                                    <h3 className="font-semibold">
                                        Proses Pelunasan
                                    </h3>
                                </div>
                                <Button
                                    onClick={handleAddPayment}
                                    variant={"yellow"}
                                    size={"sm"}
                                    type="button"
                                >
                                    <Plus />
                                    <span>Tambah Pelunasan</span>
                                </Button>
                            </div>
                            {data.payments.length === 0 && (
                                <div className="flex items-center flex-col gap-4 p-4 justify-center">
                                    <div className="text-red-400">
                                        <BanknoteX />
                                    </div>
                                    <p>Belum ada pelunasan</p>
                                </div>
                            )}

                            {data.payments.map((payment, idx) => {
                                if (payment?.action === "removed") return null;
                                return (
                                    <div
                                        key={idx}
                                        className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4"
                                    >
                                        <div className="flex flex-col w-full">
                                            <div className="flex items-center gap-2">
                                                <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                                    Jumlah Pembayaran
                                                </label>
                                                {errors[
                                                    `payments.${idx}.paid_amount`
                                                ] && (
                                                    <ErrorInput
                                                        error={
                                                            errors[
                                                                `payments.${idx}.paid_amount`
                                                            ]
                                                        }
                                                        afterLabel={true}
                                                    />
                                                )}
                                            </div>
                                            <Input
                                                type="text"
                                                placeholder="Masukkan Nominal"
                                                value={payment.paid_amount}
                                                onChange={(e) => {
                                                    const onlyNumbers =
                                                        e.target.value.replace(
                                                            /[^0-9]/g,
                                                            "",
                                                        );
                                                    const value =
                                                        Number(onlyNumbers);
                                                    handleChange(
                                                        idx,
                                                        "paid_amount",
                                                        value,
                                                    );
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col w-full">
                                            <div className="flex items-center gap-2">
                                                <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                                    Tanggal Pembayaran
                                                </label>
                                            </div>
                                            <div className="w-full">
                                                <DatePickerInput
                                                    value={
                                                        payment.payment_date ||
                                                        ""
                                                    }
                                                    onChange={(value) =>
                                                        handleChange(
                                                            idx,
                                                            "payment_date",
                                                            value,
                                                        )
                                                    }
                                                    mode="single"
                                                    placeholder="Pilih Tanggal Pembayaran"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-col w-full">
                                            <div className="flex items-center text-white opacity-0 gap-2">
                                                <label className="text-base mb-1">
                                                    BTN DEL
                                                </label>
                                            </div>
                                            <Button
                                                onClick={() =>
                                                    handleRemovePayment(idx)
                                                }
                                                variant={"red"}
                                                size={"sm"}
                                                type="button"
                                            >
                                                <Trash2 />
                                                <span>Hapus</span>
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>

                {data.payments.length > 0 && (
                    <Button
                        variant={"green"}
                        type="submit"
                        className="w-full"
                        disabled={processing}
                        size={"lg"}
                    >
                        {processing ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <Save />
                        )}
                        <span>Simpan Perubahan</span>
                    </Button>
                )}
            </form>
        </AppLayout>
    );
};

export default AdminDebtEdit;
