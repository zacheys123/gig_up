// components/TestAuth.tsx
"use client";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export default function TestAuth() {
  const { userId, isLoaded, isSignedIn } = useAuth();
  const user = useQuery(api.controllers.user.getCurrentUser);

  useEffect(() => {
    console.log("🔐 Auth Test:", {
      clerk: { isLoaded, isSignedIn, userId },
      convex: { user },
      hasIdentity: !!user,
    });
  }, [isLoaded, isSignedIn, userId, user]);

  if (!isLoaded) return <div>Loading auth...</div>;

  return (
    <div className="p-4 border rounded-lg">
      <h3>Authentication Test</h3>
      <p>Clerk: {isSignedIn ? `Signed in as ${userId}` : "Not signed in"}</p>
      <p>Convex: {user ? `User found: ${user.firstname}` : "No user data"}</p>
    </div>
  );
}
