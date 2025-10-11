import { MobileNav } from "@/components/dashboard/MobileNav";
import { Sidebar } from "@/components/dashboard/SideBar";
import { SubscriptionUpdateManager } from "@/components/dashboard/SubscriptionUpdateManger";
// import NotificationHandler from "@/components/NotificationHandler";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row h-screen  ">
      {/* Sidebar */}
      <SubscriptionUpdateManager />
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main className="flex-1 overflow-y-auto  md:pb-0">
        {" "}
        {/* <NotificationHandler /> */}
        {children}
      </main>
      {/* Mobile navigation */}
      <div className="md:hidden">
        <MobileNav />
      </div>
    </div>
  );
}
