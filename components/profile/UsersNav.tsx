"use client";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { FaHome } from "react-icons/fa";
import { User } from "lucide-react";
import { FaUser } from "react-icons/fa";
import { IoHomeOutline } from "react-icons/io5";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

const UserNav = () => {
  const { userId } = useAuth();
  const pathname = usePathname();
  const { colors } = useThemeColors();

  const inactivelink = cn(
    "text-gray-300 ml-6 hover:text-yellow-400 text-[23px] transition-colors duration-200",
    colors.textMuted
  );

  const activelink = cn(
    "text-yellow-400 hover:text-yellow ml-6 transition duration-200",
    colors.border
  );

  return (
    <div
      className={cn(
        "fixed bottom-0 w-full z-50 border-t backdrop-blur-lg",
        colors.card,
        colors.border
      )}
    >
      <div className="flex justify-around items-center w-full h-[60px] px-5 mx-auto">
        <Link href={`/profile`}>
          {pathname === `/profile` ? (
            <FaHome
              className={activelink}
              style={{ cursor: "pointer" }}
              size={pathname === `/profile` ? 26 : 25}
            />
          ) : (
            <IoHomeOutline
              className={inactivelink}
              style={{ cursor: "pointer" }}
              size={pathname === `/profile` ? 26 : 25}
            />
          )}
        </Link>

        <Link href={`/profile/${userId}/user`}>
          {pathname === `/profile/${userId}/user` ? (
            <FaUser
              className={activelink}
              size={pathname === `/profile/${userId}/user` ? 26 : 25}
              style={{ cursor: "pointer" }}
            />
          ) : (
            <User
              className={inactivelink}
              size={pathname === `/profile/${userId}/user` ? 26 : 25}
              style={{ cursor: "pointer" }}
            />
          )}
        </Link>
      </div>
    </div>
  );
};

export default UserNav;
