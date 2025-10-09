"use client";
import { Avatar } from "@mui/material";
import React from "react";
import { useRouter } from "next/navigation";
import { useAllUsers } from "@/hooks/useAllUsers";
import { UserProps } from "@/types/userTypes";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

const OverlaySearch = () => {
  const { users } = useAllUsers();
  const router = useRouter();
  const { colors } = useThemeColors();

  return (
    <div>
      <div
        className={cn(
          "md:flex flex-col md:z-50 md:h-screen md:w-screen",
          colors.background
        )}
      >
        {users?.map((user: UserProps) => {
          return (
            <div
              key={user?._id}
              onClick={() => router.push(`/friends/${user?.username}`)}
              className={cn(
                "my-[15px] mx-[35px] font-mono w-[300px] md:w-[700px] rounded-xl p-2 cursor-pointer",
                "transition ease-in-out delay-150 hover:-translate-x-2 hover:scale-20 duration-300",
                colors.card,
                colors.hoverBg,
                "border",
                colors.border
              )}
            >
              <div className="flex gap-4 items-center">
                {user?.picture && (
                  <Avatar
                    src={user?.picture}
                    className="rounded-full"
                    alt="profile"
                  />
                )}
                <div>
                  <div className={cn("flex flex-col gap-2", colors.text)}>
                    {user?.firstname} {user?.lastname}
                  </div>
                  <div className={cn("text-sm", colors.textMuted)}>
                    {user?.email}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OverlaySearch;
