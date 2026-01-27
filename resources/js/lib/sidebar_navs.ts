import {
    ArrowRightLeft,
    BanknoteArrowDown,
    BanknoteArrowUp,
    Coins,
    Grid2X2,
    HandCoins,
    LucideProps,
    Package,
    ShoppingBag,
    Users,
    Users2,
} from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

export type NavItems = {
    type: "item" | "splitter";
    title: string;
    url: string;
    icon?: ForwardRefExoticComponent<
        Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >;
}[];

const sidebarNavs: NavItems = [
    {
        type: "item",
        title: "Dashboard",
        url: "/admin/dashboard",
        icon: Grid2X2,
    },
    {
        type: "item",
        title: "Transaksi Baru",
        url: "/admin/transactions/create",
        icon: ShoppingBag,
    },
    {
        type: "splitter",
        url: "#",
        title: "Master Data",
    },
    {
        type: "item",
        title: "Data Pengguna",
        url: "/admin/users",
        icon: Users2,
    },
    {
        type: "item",
        title: "Data Pelanggan",
        url: "/admin/customers",
        icon: Users,
    },
    {
        type: "item",
        title: "Data Produk",
        url: "/admin/products",
        icon: Package,
    },
    {
        type: "splitter",
        url: "#",
        title: "Data Transaksi",
    },
    {
        type: "item",
        title: "Riwayat Transaksi",
        url: "/admin/transactions/records",
        icon: ArrowRightLeft,
    },
    {
        type: "item",
        title: "Hutang Pelanggan",
        url: "/admin/debts",
        icon: HandCoins,
    },
    {
        type: "splitter",
        url: "#",
        title: "Laporan Keuangan",
    },
    {
        type: "item",
        title: "Pemasukan",
        url: "/admin/finance/incomes",
        icon: BanknoteArrowDown,
    },
    {
        type: "item",
        title: "Pengeluaran (Kulaan)",
        url: "/admin/finance/expense",
        icon: BanknoteArrowUp,
    },
    {
        type: "item",
        title: "Laba Rugi",
        url: "/admin/finance/profit-loss",
        icon: Coins,
    },
];

export default sidebarNavs;
