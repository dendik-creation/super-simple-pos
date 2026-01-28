import { PaginatorBuilder, SearchInput } from "@/components/custom/FormElement";
import { floatToIdCurrency, inputDebounce } from "@/components/helper/helper";
import AppLayout from "@/partials/AppLayout";
import { PageTitle } from "@/partials/PageTitle";
import { router, useForm } from "@inertiajs/react";
import { useEffect, useRef } from "react";
import AdminCustomerEdit from "./ModalEdit";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import ConfirmDialog from "@/components/custom/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import EmptyTable from "@/components/custom/EmptyTable";
import { PageTitleProps } from "@/partials/PageTitle";
import { PaginationData } from "@/types/global";
import { Product } from "@/types/product";
import AdminProductCreate from "./ModalCreate";

type PageProps = PageTitleProps & {
    products: PaginationData<Product>;
    filters: {
        search?: string;
    };
};

const AdminProductIndex = ({
    title,
    description,
    products,
    filters,
}: PageProps) => {
    const firstRender = useRef(true);
    const { data: filterData, setData: setFilterData } = useForm({
        search: filters.search || "",
    });

    const handleFilter = (key: keyof typeof filterData, value: string) => {
        setFilterData(key, value);
    };

    const debounceSearch = inputDebounce((data: typeof filterData) => {
        router.get(
            "/admin/products",
            {
                search: data.search,
            },
            {
                preserveState: true,
                replace: true,
                only: ["products"],
            },
        );
    });

    const handleDelete = (id: number) => {
        router.delete(`/admin/products/${id}`, {
            preserveScroll: true,
            replace: true,
            only: ["products"],
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

            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 w-full">
                    <SearchInput
                        placeholder={`Cari nama produk...`}
                        className="lg:max-w-sm w-full"
                        onChange={(e) => handleFilter("search", e.target.value)}
                        value={filterData.search || ""}
                    />
                </div>
                <AdminProductCreate />
            </div>

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
                                Stok
                            </TableHead>
                            <TableHead className="bg-stone-200 font-semibold">
                                Harga Beli
                            </TableHead>
                            <TableHead className="bg-stone-200 font-semibold">
                                Harga Jual
                            </TableHead>
                            <TableHead className="bg-stone-200 font-semibold">
                                Aksi
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.data.map((product, index) => (
                            <TableRow key={product.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.stock}</TableCell>
                                <TableCell>
                                    {floatToIdCurrency(product.buy_price)}
                                </TableCell>
                                <TableCell>
                                    {floatToIdCurrency(product.sell_price)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <AdminCustomerEdit product={product} />
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
                                            title="Hapus produk"
                                            description="Menghapus produk menyebabkan kehilangan riwayat transaksi produk. Apakah anda yakin ?"
                                            type="danger"
                                            confirmAction={() =>
                                                handleDelete(product.id)
                                            }
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {products.data.length == 0 && (
                            <EmptyTable
                                colSpan={6}
                                message="Produk tidak ada"
                            />
                        )}
                    </TableBody>
                </Table>
            </div>
            {products.total > products.per_page && (
                <PaginatorBuilder
                    prevUrl={products.prev_page_url ?? "#"}
                    nextUrl={products.next_page_url ?? "#"}
                    currentPage={products.current_page}
                    totalPage={products.last_page}
                />
            )}
        </AppLayout>
    );
};

export default AdminProductIndex;
