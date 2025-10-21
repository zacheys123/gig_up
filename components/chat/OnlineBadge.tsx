// components/OnlineBadge.tsx
"use client";

import { useUserCurrentChat } from "@/hooks/useCurrentUserChat";

export function OnlineBadge({ userId }: { userId: string }) {
  const { isUserOnline } = useUserCurrentChat();

  if (!isUserOnline(userId)) return null;

  return (
    <div className="flex items-center gap-1 text-xs text-green-600">
      <div className="w-2 h-2 rounded-full bg-green-500" />
      Online
    </div>
  );
}
