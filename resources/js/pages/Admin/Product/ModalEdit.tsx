import { useForm } from "@inertiajs/react";
import React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CircleFadingPlus, CircleX, Loader, Pencil, Save } from "lucide-react";
import { ErrorInput } from "@/components/custom/FormElement";
import { Product } from "@/types/product";

const AdminProductEdit = ({ product }: { product: Product }) => {
    const {
        data,
        setData,
        put,
        processing,
        errors,
        reset,
        setError,
        clearErrors,
    } = useForm({
        name: product.name || "",
        stock: product.stock || 0,
        buy_price: product.buy_price || 0,
        sell_price: product.sell_price || 0,
    });
    const handleChangeInput = (key: keyof typeof data, value: string) => {
        setData(key, value);
    };
    const validateForm = (): boolean => {
        let isValid = true;
        clearErrors();
        if (!data.name || data.name.trim() === "") {
            setError("name", "Nama wajib diisi");
            isValid = false;
        }
        if (!data.stock || data.stock <= 0) {
            setError("stock", "Stok wajib diisi");
            isValid = false;
        }
        if (!data.buy_price || data.buy_price <= 0) {
            setError("buy_price", "Harga beli wajib diisi");
            isValid = false;
        }
        if (!data.sell_price || data.sell_price <= 0) {
            setError("sell_price", "Harga jual wajib diisi");
            isValid = false;
        }
        return isValid;
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        put("/admin/products/" + product.id, {
            replace: true,
            preserveState: true,
            only: ["products"],
            onSuccess: () => reset(),
        });
    };
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={"blue"} size={"icon"}>
                    <Pencil />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-7xl">
                <DialogHeader>
                    <DialogTitle>Tambah Produk</DialogTitle>
                    <DialogDescription className="mb-3">
                        Silakan isi data produk baru
                    </DialogDescription>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        <div className="flex flex-col w-full">
                            <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                Nama
                            </label>
                            <Input
                                type="text"
                                placeholder="Masukkan Nama"
                                className="w-full"
                                disabled={processing}
                                value={data.name || ""}
                                onChange={(e) =>
                                    handleChangeInput("name", e.target.value)
                                }
                            />
                            {errors.name && <ErrorInput error={errors.name} />}
                        </div>
                        <div className="flex flex-col w-full">
                            <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                Stok
                            </label>
                            <Input
                                type="number"
                                placeholder="Masukkan Stok"
                                className="w-full"
                                disabled={processing}
                                value={data.stock || ""}
                                onChange={(e) =>
                                    handleChangeInput("stock", e.target.value)
                                }
                            />
                            {errors.stock && (
                                <ErrorInput error={errors.stock} />
                            )}
                        </div>
                        <div className="flex flex-col w-full">
                            <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                Haga beli / satuan
                            </label>
                            <Input
                                type="number"
                                placeholder="Masukkan Harga Beli"
                                className="w-full"
                                disabled={processing}
                                value={data.buy_price || ""}
                                onChange={(e) =>
                                    handleChangeInput(
                                        "buy_price",
                                        e.target.value,
                                    )
                                }
                            />
                            {errors.buy_price && (
                                <ErrorInput error={errors.buy_price} />
                            )}
                        </div>
                        <div className="flex flex-col w-full">
                            <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                Harga jual / satuan
                            </label>
                            <Input
                                type="number"
                                placeholder="Masukkan Harga Jual"
                                className="w-full"
                                disabled={processing}
                                value={data.sell_price || ""}
                                onChange={(e) =>
                                    handleChangeInput(
                                        "sell_price",
                                        e.target.value,
                                    )
                                }
                            />
                            {errors.sell_price && (
                                <ErrorInput error={errors.sell_price} />
                            )}
                        </div>
                    </div>
                </DialogHeader>
                <DialogFooter className="mt-9">
                    <DialogClose asChild disabled={processing}>
                        <Button
                            variant="red"
                            disabled={processing}
                            className="flex items-center gap-2"
                        >
                            <CircleX /> Batalkan
                        </Button>
                    </DialogClose>
                    <Button
                        variant="yellow"
                        disabled={processing}
                        onClick={handleSubmit}
                        className="flex items-center gap-2"
                    >
                        {processing ? (
                            <Loader />
                        ) : (
                            <span className="flex items-center gap-2">
                                <Save /> Simpan
                            </span>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AdminProductEdit;
