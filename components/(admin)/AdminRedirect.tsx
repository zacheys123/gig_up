// components/AdminRedirect.tsx
"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AdminRedirect() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      const { isAdmin, adminRole } = user.publicMetadata as any;
      const hasAdminAccess =
        isAdmin === true ||
        adminRole === "super" ||
        adminRole === "content" ||
        adminRole === "support" ||
        adminRole === "analytics";

      if (hasAdminAccess) {
        console.log("Redirecting admin to admin dashboard");
        router.replace("/admin/dashboard");
      }
    }
  }, [user, isLoaded, router]);

  return null;
}
