"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export const useSecretKeyVerification = (gigId: Id<"gigs">) => {
  const { user } = useCurrentUser();
  const [isVerificationRequired, setIsVerificationRequired] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Get gig data to check if it has a secret
  const gig = useQuery(api.controllers.gigs.getGigById, { gigId });

  const checkVerificationStatus = useCallback(async () => {
    if (!user?._id || !gigId || !gig) {
      setIsChecking(false);
      return;
    }

    setIsChecking(true);
    try {
      // Check if gig has a secret key
      const hasSecretKey = !!gig.secret && gig.secret.trim().length > 0;

      // Check local storage for recent verification
      const verificationTime = localStorage.getItem(`gig_verified_${gigId}`);
      const isRecentlyVerified =
        verificationTime &&
        Date.now() - parseInt(verificationTime) < 30 * 60 * 1000; // 30 minutes

      // If gig has secret AND user hasn't verified recently, require verification
      setIsVerificationRequired(hasSecretKey && !isRecentlyVerified);
      setIsVerified(!hasSecretKey || !!isRecentlyVerified);
    } catch (error) {
      console.error("Error checking verification status:", error);
      setIsVerificationRequired(false);
      setIsVerified(true); // Default to verified on error
    } finally {
      setIsChecking(false);
    }
  }, [gig, gigId, user]);

  const handleVerificationSuccess = useCallback(() => {
    setIsVerified(true);
    setIsVerificationRequired(false);
    // Store verification timestamp
    localStorage.setItem(`gig_verified_${gigId}`, Date.now().toString());
  }, [gigId]);

  useEffect(() => {
    checkVerificationStatus();
  }, [checkVerificationStatus]);

  return {
    isVerificationRequired,
    isVerified,
    isChecking,
    setIsVerificationRequired,
    handleVerificationSuccess,
  };
};
