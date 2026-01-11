"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import EditGigForm from "../_components/EditForm";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Lock } from "lucide-react";
import { SecretKeyVerificationModal } from "../_components/ServerKeyModal";
import { Id } from "@/convex/_generated/dataModel";
import { useThemeColors } from "@/hooks/useTheme";

export default function EditGigPage() {
  const params = useParams();
  const gigId = params.id as string;
  const { user } = useCurrentUser();
  const { colors } = useThemeColors();

  const [showVerification, setShowVerification] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (user?._id) {
      const verificationTime = localStorage.getItem(`gig_verified_${gigId}`);
      const isRecentlyVerified =
        verificationTime &&
        Date.now() - parseInt(verificationTime) < 30 * 60 * 1000;

      if (isRecentlyVerified) {
        setIsVerified(true);
      } else {
        setShowVerification(true);
      }
    }
  }, [gigId, user]);

  const handleVerificationSuccess = () => {
    setIsVerified(true);
    setShowVerification(false);
    localStorage.setItem(`gig_verified_${gigId}`, Date.now().toString());
  };

  return (
    <div className={colors.background}>
      <SecretKeyVerificationModal
        isOpen={showVerification && !isVerified}
        onClose={() => window.history.back()}
        onSuccess={handleVerificationSuccess}
        gigId={gigId as Id<"gigs">}
        userId={user?._id!}
      />

      {isVerified && <EditGigForm />}

      {showVerification && !isVerified && (
        <div className="flex items-center justify-center min-h-screen">
          <div className={`text-center ${colors.text}`}>
            <Lock className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Verification Required
            </h2>
            <p className={colors.textMuted}>
              Please verify ownership to edit this gig.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
