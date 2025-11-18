import MobileNav from "@/components/dashboard/MobileNav";
import { Sidebar } from "@/components/dashboard/SideBar";
import { SubscriptionUpdateManager } from "@/components/dashboard/SubscriptionUpdateManger";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      {/* Sidebar - Fixed on desktop */}
      <SubscriptionUpdateManager />
      <div className="hidden md:flex md:w-64 md:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto">{children}</main>

        {/* Mobile navigation */}
        <div className="md:hidden">
          <MobileNav />
        </div>
      </div>
    </div>
  );
}
