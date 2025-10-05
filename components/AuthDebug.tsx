// components/AuthDebug.tsx
"use client";
import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export default  function AuthDebug() {
  const { getToken, isLoaded: authLoaded, userId } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();

  useEffect(() => {
    const debugAuth = async () => {
      console.log('=== AUTH DEBUG ===');
      console.log('Auth loaded:', authLoaded);
      console.log('User loaded:', userLoaded);
      console.log('User ID:', userId);
      console.log('User object:', user);
      
      if (authLoaded) {
        const token = await getToken();
        console.log('Token exists:', !!token);
        if (token) {
          console.log('Token length:', token.length);
          // Decode token to see contents
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('Token payload:', payload);
          } catch (e) {
            console.log('Token decode error:', e);
          }
        }
      }
      console.log('==================');
    };

    debugAuth();
  }, [authLoaded, userLoaded, userId, user, getToken]);

  return null;
}