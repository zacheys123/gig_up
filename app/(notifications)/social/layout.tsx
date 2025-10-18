"use client";

import { useState } from "react";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import MobileNav from "./_components/MobileNav";
import Sidebar from "./_components/SideBar";

export default function SocialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { colors, isDarkMode } = useThemeColors();

  return (
    <div className={cn("min-h-screen w-full", colors.background)}>
      {/* Mobile Navigation */}
      <MobileNav onMenuClick={() => setSidebarOpen(true)} />

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 min-h-screen">
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
