import BlastToaster from "@/components/custom/BlastToaster";
import {
    ErrorInput,
    SearchInput,
    SelectSearchInput,
} from "@/components/custom/FormElement";
import { floatToIdCurrency } from "@/components/helper/helper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/partials/AppLayout";
import { PageTitle, PageTitleProps } from "@/partials/PageTitle";
import { SelectOption } from "@/types/global";
import { Product } from "@/types/product";
import { Transaction } from "@/types/transaction";
import { useForm } from "@inertiajs/react";
import { set } from "date-fns";
import {
    ArrowLeftRight,
    CircleFadingPlus,
    Loader2,
    Minus,
    Package,
    Plus,
    Save,
    SearchX,
    ShoppingCart,
    User,
} from "lucide-react";
import React, { useEffect } from "react";

type PageProps = PageTitleProps & {
    products: Product[];
    transaction: Transaction;
    customer_options: SelectOption[];
};

const CUSTOMER_TYPE_OPTIONS = [
    {
        label: "Baru",
        value: "true",
    },
    {
        label: "Yang sudah ada",
        value: "false",
    },
];

const AdminEditTransaction = ({
    title,
    description,
    products,
    transaction,
    customer_options,
}: PageProps) => {
    const { data, setData, put, processing, errors, setError, clearErrors } =
        useForm({
            customer_id: transaction.customer_id,
            is_new_customer: transaction.customer_id ? false : true,
            new_customer: {
                name: "",
                phone: "",
                address: "",
            },
            items: transaction.items.map((item) => {
                return {
                    product_id: item.product_id,
                    name:
                        products.find((p) => p.id === item.product_id)?.name ||
                        "",
                    quantity: item.quantity,
                    cost_price: item.cost_price,
                    unit_price: item.unit_price,
                    total_price: item.total_price,
                    with_force_price:
                        item.quantity * item.unit_price !== item.total_price,
                };
            }) as {
                product_id: number;
                name: string;
                quantity: number;
                cost_price: number;
                unit_price: number;
                total_price: number;
                with_force_price: boolean;
            }[],
            subtotal: transaction.subtotal,
            discount: transaction.discount,
            total: transaction.total,
            paid_amount: transaction.paid_amount,
            change_amount: transaction.change_amount,
            payment_status: transaction.payment_status as "" | "paid" | "debt",
        });
    const { data: productFiltered, setData: setProductFiltered } = useForm({
        search: "",
        filtered: products,
    });

    const handleFilterProducts = (search: string) => {
        const filtered = products.filter((product) =>
            product.name.toLowerCase().includes(search.toLowerCase()),
        );
        setProductFiltered({
            search,
            filtered,
        });
    };

    const handleAddItem = (product: Product) => {
        if (product.stock === 0) {
            BlastToaster("error", "Stok produk tidak cukup");
            return;
        }
        const { items } = data;
        const { filtered } = productFiltered;

        const updateProductStock = (products: Product[], productId: number) =>
            products.map((p) =>
                p.id === productId
                    ? { ...p, stock: p.stock > 0 ? p.stock - 1 : 0 }
                    : p,
            );

        const existingItemIndex = items.findIndex(
            (item) => item.product_id === product.id,
        );

        if (existingItemIndex !== -1) {
            const updatedItems = items.map((item, idx) =>
                idx === existingItemIndex
                    ? {
                          ...item,
                          quantity: item.quantity + 1,
                          total_price: (item.quantity + 1) * item.unit_price,
                      }
                    : item,
            );
            setData("items", updatedItems);
        } else {
            const newItem = {
                product_id: product.id,
                quantity: 1,
                cost_price: product.buy_price,
                unit_price: product.sell_price,
                total_price: product.sell_price,
                name: product.name,
                with_force_price: false,
            };
            setData("items", [...items, newItem]);
        }

        setProductFiltered({
            ...productFiltered,
            filtered: updateProductStock(filtered, product.id),
        });
    };

    const handleRemoveItem = (product_id: number) => {
        const updatedItems = data.items.filter(
            (item) => item.product_id !== product_id,
        );

        const { filtered } = productFiltered;
        const updatedFiltered = filtered.map((product) =>
            product.id === product_id
                ? { ...product, stock: product.stock + 1 }
                : product,
        );
        setProductFiltered({
            ...productFiltered,
            filtered: updatedFiltered,
        });

        setData("items", updatedItems);
    };

    const calculateTransaction = () => {
        // Recalculate item total prices
        const updatedItems = data.items.map((item) => {
            if (item.with_force_price) {
                return item; // Keep the forced price
            }
            const total_price = item.quantity * item.unit_price;
            return {
                ...item,
                total_price,
            };
        });
        setData("items", updatedItems);
        // Recalculate subtotal
        const subtotal = updatedItems.reduce(
            (acc, item) => acc + item.total_price,
            0,
        );
        setData("subtotal", subtotal);

        // Recalculate total after discount
        const discount = data.discount || 0;
        const total = subtotal - discount;
        setData("total", total);
    };

    const calculateChangeAmount = () => {
        const paidAmount = data.paid_amount || 0;
        const total = data.total || 0;
        if (paidAmount > total) {
            const changeAmount = paidAmount - total;
            setData("change_amount", changeAmount);
        } else {
            setData("change_amount", 0);
        }
    };

    const recalculateInformation = () => {
        calculateTransaction();
        calculateChangeAmount();
    };

    useEffect(() => {
        recalculateInformation();
    }, [
        JSON.stringify(data.items),
        data.paid_amount,
        data.customer_id,
        data.payment_status,
    ]);

    const handleChangeQty = (product_id: number, action: "MIN" | "ADD") => {
        const { items } = data;
        const { filtered } = productFiltered;

        const updateProductStock = (
            products: Product[],
            productId: number,
            action: "MIN" | "ADD",
        ) =>
            products.map((p) =>
                p.id === productId
                    ? {
                          ...p,
                          stock: action === "ADD" ? p.stock - 1 : p.stock + 1,
                      }
                    : p,
            );

        const existingItemIndex = items.findIndex(
            (item) => item.product_id === product_id,
        );

        if (existingItemIndex !== -1) {
            const currentItem = items[existingItemIndex];
            if (
                action === "ADD" &&
                filtered.find((p) => p.id === product_id)?.stock === 0
            ) {
                BlastToaster("error", "Stok produk tidak cukup");
                return;
            }
            const newQuantity =
                action === "ADD"
                    ? currentItem.quantity + 1
                    : currentItem.quantity - 1;
            if (newQuantity <= 0) {
                handleRemoveItem(product_id);
            } else {
                const updatedItems = items.map((item, idx) =>
                    idx === existingItemIndex
                        ? {
                              ...item,
                              quantity: newQuantity,
                              total_price: newQuantity * item.unit_price,
                          }
                        : item,
                );
                setData("items", updatedItems);
            }

            setProductFiltered({
                ...productFiltered,
                filtered: updateProductStock(filtered, product_id, action),
            });
        }
    };

    const validateForm = (): boolean => {
        let valid = true;
        clearErrors();

        if (data.is_new_customer) {
            if (
                !data.new_customer.name ||
                data.new_customer.name.trim() === ""
            ) {
                setError(
                    "new_customer.name",
                    "Nama pelanggan baru wajib diisi",
                );
                valid = false;
            }
        } else {
            if (!data.customer_id || data.customer_id == undefined) {
                setError("customer_id", "Pelanggan wajib dipilih");
                valid = false;
            }
        }
        if (data.items.length === 0) {
            setError("items", "Minimal satu produk harus ditambahkan");
            valid = false;
        }
        if (!data.payment_status) {
            setError("payment_status", "Status pembayaran wajib dipilih");
            valid = false;
        }
        if (
            data.payment_status === "paid" &&
            (data.paid_amount || 0) < (data.total || 0)
        ) {
            setError("paid_amount", "tidak boleh kurang");
            valid = false;
        }

        return valid;
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            BlastToaster("error", "Periksa kembali inputan anda");
            return;
        }
        put("/admin/transactions/update/" + transaction.id, {
            preserveState: true,
            replace: true,
            onError: (err) => {
                BlastToaster("error", err);
            },
        });
    };

    return (
        <AppLayout pageTitleHeader={title} pageDescriptionHeader={description}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/*Customer & Product List*/}
                <div className="flex flex-col lg:col-span-2 gap-4">
                    {/* Customer Selection & New Customer Form */}
                    <Card className="py-3">
                        <CardContent className="px-3">
                            <div className="flex items-center gap-2 text-md font-bold mb-4">
                                <User className="h-5 w-5" />
                                Informasi Pelanggan
                            </div>
                            <div className="flex flex-col mb-4">
                                <div className="flex items-center gap-2">
                                    <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                        Tipe Pelanggan
                                    </label>
                                    {errors["new_customer.name"] && (
                                        <ErrorInput
                                            error={errors["new_customer.name"]}
                                            afterLabel={true}
                                        />
                                    )}
                                    {errors["customer_id"] && (
                                        <ErrorInput
                                            error={errors["customer_id"]}
                                            afterLabel={true}
                                        />
                                    )}
                                </div>
                                <div className="flex flex-col lg:flex-row gap-4">
                                    <div className="w-full">
                                        <SelectSearchInput
                                            placeholder="Pilih tipe pelanggan"
                                            options={CUSTOMER_TYPE_OPTIONS}
                                            value={data.is_new_customer.toString()}
                                            onChange={(value) => {
                                                const isNew = value === "true";
                                                setData(
                                                    "is_new_customer",
                                                    isNew,
                                                );
                                                if (!isNew) {
                                                    setData("new_customer", {
                                                        name: "",
                                                        phone: "",
                                                        address: "",
                                                    });
                                                    clearErrors("new_customer");
                                                }
                                            }}
                                        />
                                    </div>
                                    {data.is_new_customer ? (
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <div className="w-full">
                                                    <Button
                                                        className="w-full"
                                                        variant={"yellow"}
                                                        disabled={processing}
                                                    >
                                                        <CircleFadingPlus />
                                                        <span>
                                                            Form Pelanggan Baru
                                                        </span>
                                                    </Button>
                                                </div>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-7xl">
                                                <DialogHeader>
                                                    <DialogTitle>
                                                        Pelanggan Baru
                                                    </DialogTitle>
                                                    <DialogDescription className="mb-3">
                                                        Pelanggan baru akan
                                                        disimpan ketika
                                                        transaksi simpan juga
                                                    </DialogDescription>
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                                        <div className="flex flex-col w-full">
                                                            <div className="flex items-center gap-2">
                                                                <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                                                    Nama
                                                                </label>
                                                                {errors[
                                                                    "new_customer.name"
                                                                ] && (
                                                                    <ErrorInput
                                                                        error={
                                                                            errors[
                                                                                "new_customer.name"
                                                                            ]
                                                                        }
                                                                        afterLabel={
                                                                            true
                                                                        }
                                                                    />
                                                                )}
                                                            </div>
                                                            <Input
                                                                type="text"
                                                                placeholder="Masukkan Nama"
                                                                className="w-full"
                                                                disabled={
                                                                    processing
                                                                }
                                                                value={
                                                                    data
                                                                        .new_customer
                                                                        .name ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        "new_customer",
                                                                        {
                                                                            ...data.new_customer,
                                                                            name: e
                                                                                .target
                                                                                .value,
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                        <div className="flex flex-col w-full">
                                                            <label className="text-base mb-1">
                                                                No HP
                                                            </label>
                                                            <Input
                                                                type="tel"
                                                                placeholder="Masukkan No Hp"
                                                                className="w-full"
                                                                disabled={
                                                                    processing
                                                                }
                                                                value={
                                                                    data
                                                                        .new_customer
                                                                        .phone ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        "new_customer",
                                                                        {
                                                                            ...data.new_customer,
                                                                            phone: e
                                                                                .target
                                                                                .value,
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                            {errors[
                                                                "new_customer.phone"
                                                            ] && (
                                                                <div className="text-sm text-red-500 mt-1">
                                                                    {
                                                                        errors[
                                                                            "new_customer.phone"
                                                                        ]
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col w-full">
                                                            <label className="text-base mb-1">
                                                                Alamat
                                                            </label>
                                                            <Textarea
                                                                placeholder="Masukkan Alamat"
                                                                disabled={
                                                                    processing
                                                                }
                                                                value={
                                                                    data
                                                                        .new_customer
                                                                        .address ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        "new_customer",
                                                                        {
                                                                            ...data.new_customer,
                                                                            address:
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </DialogHeader>
                                                <DialogFooter className="mt-9">
                                                    <DialogClose asChild>
                                                        <Button
                                                            variant="yellow"
                                                            disabled={
                                                                processing
                                                            }
                                                            className="flex items-center gap-2"
                                                        >
                                                            <Save /> Simpan
                                                        </Button>
                                                    </DialogClose>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    ) : (
                                        <div className="w-full">
                                            <SelectSearchInput
                                                placeholder="Pilih pelanggan"
                                                options={customer_options}
                                                value={
                                                    data.customer_id?.toString() ||
                                                    ""
                                                }
                                                onChange={(value) => {
                                                    setData(
                                                        "customer_id",
                                                        Number(value),
                                                    );
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Product List*/}
                    <Card className="py-3">
                        <CardContent className="px-3">
                            <div className="flex items-center gap-2 text-md font-bold mb-4">
                                <Package className="h-5 w-5" />
                                Daftar Produk
                            </div>
                            {/*Filter product*/}
                            <div className="mb-4">
                                <SearchInput
                                    placeholder="Cari nama produk..."
                                    onChange={(e) =>
                                        handleFilterProducts(e.target.value)
                                    }
                                    value={productFiltered.search}
                                />
                            </div>
                            {/*Product List Content*/}
                            <div
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto"
                                style={{ maxHeight: "calc(100vh - 420px)" }}
                            >
                                {productFiltered.filtered.length == 0 && (
                                    <div className="flex items-center md:col-span-2 lg:col-span-3 flex-col gap-4 p-4 justify-center">
                                        <div className="text-red-400">
                                            <SearchX />
                                        </div>
                                        <p>Produk tidak ada</p>
                                    </div>
                                )}
                                {productFiltered.filtered.map(
                                    (product, idx) => (
                                        <Card
                                            className="py-3 flex flex-col cursor-pointer hover:shadow-lg transition-shadow overflow-hidden relative"
                                            key={idx}
                                            onClick={() =>
                                                handleAddItem(product)
                                            }
                                        >
                                            <CardContent className="flex flex-col items-start px-3">
                                                <h3 className="font-bold text-lg text-start">
                                                    {product.name}
                                                </h3>
                                                <Badge
                                                    variant={
                                                        product.stock > 0
                                                            ? "outline"
                                                            : "destructive"
                                                    }
                                                    className="mb-2"
                                                >
                                                    <span className="text-sm">
                                                        {product.stock} stok
                                                        tersisa
                                                    </span>
                                                </Badge>
                                                <h3 className="font-bold text-green-600 text-lg text-start">
                                                    {floatToIdCurrency(
                                                        product.sell_price,
                                                    )}
                                                </h3>
                                            </CardContent>
                                            <Package
                                                className="absolute -bottom-4 -right-4 text-yellow-400/40"
                                                size={56}
                                            />
                                        </Card>
                                    ),
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/*Cart & Summary*/}
                <Card className="py-3 col-span-1 relative overflow-hidden">
                    <CardContent className="px-3">
                        <div className="flex items-center gap-2 text-md font-bold mb-4">
                            <ArrowLeftRight className="h-5 w-5" />
                            Keranjang dan Ringkasan
                        </div>

                        {/*Cart*/}
                        <div
                            style={{ maxHeight: "170px" }}
                            className="flex flex-col gap-2 text-sm overflow-y-auto"
                        >
                            {data.items.length === 0 && (
                                <div className="flex items-center flex-col gap-4 p-4 justify-center">
                                    <div className="text-red-400">
                                        <ShoppingCart />
                                    </div>
                                    <p>Keranjang kosong</p>
                                </div>
                            )}
                            {data.items.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center border-b-2 mb-2 pb-2 justify-between"
                                >
                                    {/*Product info*/}
                                    <div className="flex flex-col gap-1">
                                        <h3 className="font-normal text-gray-700 text-md">
                                            {item.quantity} {item.name}
                                        </h3>
                                        <div className="flex items-center gap-1">
                                            <span className="text-sm text-gray-600 font-bold">
                                                Rp
                                            </span>
                                            <Input
                                                type="number"
                                                value={item.total_price}
                                                className="w-1/2 h-5 p-3 rounded-md text-sm font-bold text-gray-700"
                                                onChange={(e) => {
                                                    setData(
                                                        "items",
                                                        data.items.map(
                                                            (it, i) =>
                                                                i === idx
                                                                    ? {
                                                                          ...it,
                                                                          total_price:
                                                                              Number(
                                                                                  e
                                                                                      .target
                                                                                      .value,
                                                                              ),
                                                                          with_force_price: true,
                                                                      }
                                                                    : it,
                                                        ),
                                                    );
                                                }}
                                            />
                                        </div>
                                    </div>
                                    {/*Qty Action*/}
                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() =>
                                                handleChangeQty(
                                                    item.product_id,
                                                    "MIN",
                                                )
                                            }
                                        >
                                            <Minus />
                                        </Button>
                                        <span className="font-normal text-md">
                                            {item.quantity}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() =>
                                                handleChangeQty(
                                                    item.product_id,
                                                    "ADD",
                                                )
                                            }
                                        >
                                            <Plus />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary Trx */}
                        {data.items.length > 0 && (
                            <div className="p-0 pt-2 left-0 w-full lg:p-2 lg:absolute lg:bottom-2 bg-white">
                                {/*Discount input*/}
                                {data.items.length > 0 && (
                                    <div className="flex flex-col text-sm">
                                        <label className="text-sm mb-1">
                                            Diskon
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="Masukkan Nominal"
                                            value={data.discount}
                                            className="mb-4 p-2 h-7 rounded-md text-sm placeholder:text-sm font-normal text-gray-700"
                                            onChange={(e) => {
                                                const onlyNumbers =
                                                    e.target.value.replace(
                                                        /[^0-9]/g,
                                                        "",
                                                    );
                                                const value =
                                                    Number(onlyNumbers);
                                                const discount =
                                                    value > (data.subtotal || 0)
                                                        ? data.subtotal || 0
                                                        : value;
                                                setData("discount", discount);
                                                setData(
                                                    "total",
                                                    (data.subtotal || 0) -
                                                        discount,
                                                );
                                            }}
                                        />
                                    </div>
                                )}

                                {/*Summary*/}
                                {data.items.length > 0 && (
                                    <div className="flex flex-col gap-2 mb-4">
                                        <div className="flex text-sm justify-between">
                                            <span className="font-medium text-gray-700">
                                                Subtotal
                                            </span>
                                            <span className="font-bold text-gray-900">
                                                {floatToIdCurrency(
                                                    data.subtotal || 0,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex text-sm justify-between">
                                            <span className="font-medium text-gray-700">
                                                Diskon
                                            </span>
                                            <span className="font-bold text-green-600">
                                                {floatToIdCurrency(
                                                    data.discount || 0,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex text-sm justify-between">
                                            <span className="font-medium text-gray-700">
                                                Total
                                            </span>
                                            <span className="font-bold text-lg text-gray-900">
                                                {floatToIdCurrency(
                                                    data.total || 0,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/*Payment Status & Paid Amount*/}
                                {errors["payment_status"] && (
                                    <ErrorInput
                                        error={errors["payment_status"]}
                                    />
                                )}
                                {data.items.length > 0 && (
                                    <div className="grid mt-1 grid-cols-2 mb-4 gap-3">
                                        <Button
                                            disabled={processing}
                                            variant={
                                                data.payment_status == "paid"
                                                    ? "yellow"
                                                    : "outline"
                                            }
                                            onClick={() => {
                                                setData(
                                                    "payment_status",
                                                    "paid",
                                                );
                                            }}
                                        >
                                            Bayar Lunas
                                        </Button>
                                        <Button
                                            disabled={processing}
                                            variant={
                                                data.payment_status == "debt"
                                                    ? "yellow"
                                                    : "outline"
                                            }
                                            onClick={() => {
                                                setData(
                                                    "payment_status",
                                                    "debt",
                                                );
                                            }}
                                        >
                                            Kasbon
                                        </Button>
                                    </div>
                                )}

                                {/*Paid Amount input*/}

                                {data.items.length > 0 && (
                                    <div className="flex flex-col text-sm">
                                        <div className="flex items-center gap-2">
                                            <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                                Nominal Bayar
                                            </label>
                                            {errors["paid_amount"] && (
                                                <ErrorInput
                                                    error={
                                                        errors["paid_amount"]
                                                    }
                                                    afterLabel={true}
                                                />
                                            )}
                                        </div>
                                        <Input
                                            type="text"
                                            placeholder="Masukkan Nominal"
                                            value={data.paid_amount}
                                            className="mb-4 p-2 h-7 rounded-md text-sm placeholder:text-sm font-normal text-gray-700"
                                            onChange={(e) => {
                                                const onlyNumbers =
                                                    e.target.value.replace(
                                                        /[^0-9]/g,
                                                        "",
                                                    );
                                                const value =
                                                    Number(onlyNumbers);
                                                setData("paid_amount", value);
                                                if (
                                                    data.total !== undefined &&
                                                    value > data.total
                                                ) {
                                                    setData(
                                                        "payment_status",
                                                        "paid",
                                                    );
                                                }
                                            }}
                                        />
                                    </div>
                                )}
                                {data.items.length > 0 &&
                                    data.change_amount != undefined &&
                                    data.change_amount > 0 && (
                                        <div className="flex justify-between text-sm mb-4">
                                            <span>Kembalian</span>
                                            <span className="text-green-600 font-bold">
                                                {floatToIdCurrency(
                                                    data.change_amount || 0,
                                                )}
                                            </span>
                                        </div>
                                    )}
                                {/*Submit button*/}
                                <Button
                                    className="w-full"
                                    variant={"green"}
                                    disabled={
                                        processing || data.items.length === 0
                                    }
                                    onClick={handleSubmit}
                                >
                                    <div className="flex items-center gap-2">
                                        {processing ? (
                                            <Loader2 className="animate-spin" />
                                        ) : (
                                            <Save />
                                        )}
                                        <span>Simpan Transaksi</span>
                                    </div>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default AdminEditTransaction;
