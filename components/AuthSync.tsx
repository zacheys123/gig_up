// components/AuthSync.tsx
"use client";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useEffect, useState } from "react";

export function AuthSync() {
  const { user, isLoaded } = useUser();
  const createOrUpdateUser = useMutation(api.controllers.user.createOrUpdateUserPublic);
  const [hasSynced, setHasSynced] = useState(false);

  useEffect(() => {
    if (isLoaded && user && !hasSynced) {
      createOrUpdateUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress || "",
        username: user.username || user.primaryEmailAddress?.emailAddress?.split('@')[0] || `user_${user.id.slice(0, 8)}`,
        picture: user.imageUrl,
        firstname: user.firstName || "",
        lastname: user.lastName || "",
      })
        .then(() => {
          console.log('User synced successfully');
          setHasSynced(true);
        })
        .catch((error) => {
          console.error('Error syncing user:', error);
        });
    }
  }, [user, isLoaded, createOrUpdateUser, hasSynced]);

  return null;
}