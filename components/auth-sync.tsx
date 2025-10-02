"use client";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";

import { useEffect } from "react";

export function AuthSync() {
  const { user, isLoaded } = useUser();
  const createOrUpdateUser = useMutation(api.controllers.user.createOrUpdateUser);

  useEffect(() => {
    if (isLoaded && user) {
      // Sync user data to Convex
      createOrUpdateUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        username: user.username || user.primaryEmailAddress?.emailAddress?.split('@')[0] || `user_${user.id.slice(0, 8)}`,
        picture: user.imageUrl,
        firstname: user.firstName || "",
        lastname: user.lastName || "",
      }).catch(console.error);
    }
  }, [user, isLoaded, createOrUpdateUser]);

  return null;
}