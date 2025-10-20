// app/messages/layout.tsx

import { DesktopMessagesNav } from "./_components/DesktopMessagesNav";
import { MobileMessagesNav } from "./_components/MobileMessagesNav";

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      {/* Desktop Navigation Sidebar */}
      <DesktopMessagesNav />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-0">
        {children}

        {/* Mobile Bottom Navigation */}
        <MobileMessagesNav />
      </div>
    </div>
  );
}
