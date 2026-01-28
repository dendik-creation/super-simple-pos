import { ReactNode, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import AppHeader from "@/partials/AppHeader";
import AppFooter from "@/partials/AppFooter";
import AppSidebar from "@/partials/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { usePage } from "@inertiajs/react";
import BlastToaster from "@/components/custom/BlastToaster";

interface AppLayoutProps {
    children: ReactNode;
    className?: string;
    pageTitleHeader?: string;
    pageDescriptionHeader?: string;
}

export const useInertiaShared = () => {
    const { flash } = usePage().props as any;
    return { flash };
};

export default function AppLayout({
    children,
    className,
    pageTitleHeader,
    pageDescriptionHeader,
}: AppLayoutProps) {
    const { flash } = useInertiaShared();

    useEffect(() => {
        if (flash?.success) {
            BlastToaster("success", flash?.success);
        } else if (flash?.error) {
            BlastToaster("error", flash?.error);
        }
    }, []);

    return (
        <SidebarProvider>
            <Toaster position={"bottom-right"} />
            <div className={`flex min-h-screen w-full ${className}`}>
                <AppSidebar role={flash?.user?.role as string} />
                <div className="flex flex-col w-full">
                    <AppHeader
                        name={flash?.user?.name}
                        role={flash?.user?.role}
                        pageTitle={pageTitleHeader}
                        pageDescription={pageDescriptionHeader}
                    />
                    <main className="flex-1 p-4 bg-gray-50 overflow-y-auto">
                        {children}
                    </main>
                    {/*<AppFooter />*/}
                </div>
            </div>
        </SidebarProvider>
    );
}
