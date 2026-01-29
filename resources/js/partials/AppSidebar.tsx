import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import sidebarNavs from "@/lib/sidebar_navs";
import { Link } from "@inertiajs/react";
import { ArrowBigRightDash } from "lucide-react";
import { useEffect } from "react";

export default function AppSidebar({ role }: { role: string }) {
    const pathname = window.location.pathname;
    const { toggleSidebar } = useSidebar();
    useEffect(() => {
        if (
            pathname.includes("transactions/create") ||
            /transactions\/.*\/edit/.test(pathname)
        ) {
            toggleSidebar();
        }
    }, [pathname]);
    const items = sidebarNavs;
    return (
        <Sidebar>
            <SidebarContent className="bg-sky-900 min-h-full relative h-full flex flex-col">
                <SidebarHeader className="mt-3 ms-3 gap-0">
                    <span className="text-white/80 font-bold">Warungku</span>
                    <span className="text-white/60 text-sm font-normal">
                        Mudahkan Transaksimu
                    </span>
                </SidebarHeader>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item, index: number) => {
                                if (item.type === "splitter") {
                                    return (
                                        <SidebarMenuItem
                                            className="border-b border-slate-700 mt-2"
                                            key={item.title}
                                        >
                                            <SidebarMenuButton
                                                disabled
                                                className="text-white uppercase text-xs"
                                            >
                                                <ArrowBigRightDash />
                                                {item.title}
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                } else {
                                    const Icon = item.icon;
                                    return (
                                        <SidebarMenuItem
                                            className="text-white/80 transition-all mb-0.5"
                                            key={item.title}
                                        >
                                            <SidebarMenuButton
                                                isActive={
                                                    pathname == item.url ||
                                                    pathname.includes(item.url)
                                                }
                                                className="transition-all"
                                                asChild
                                            >
                                                <Link
                                                    href={
                                                        item.url == pathname
                                                            ? "#"
                                                            : item.url
                                                    }
                                                    className="flex items-center gap-2"
                                                >
                                                    {Icon && <Icon />}
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                }
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
