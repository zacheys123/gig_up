"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import EditGigForm from "../_components/EditForm";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Lock, Palette } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useThemeColors } from "@/hooks/useTheme";
import { SimpleForgotSecretModal } from "../_components/SimpleForgotSecretModal";

import { Button } from "@/components/ui/button";
import GigCustomization from "../../../_components/gigs/GigCustomization";

interface CustomizationProps {
  fontColor: string;
  font: string;
  backgroundColor: string;
}

export default function EditGigPage() {
  const params = useParams();
  const gigId = params.id as string;
  const { user } = useCurrentUser();
  const { colors } = useThemeColors();

  const [showVerification, setShowVerification] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [customization, setCustomization] = useState<CustomizationProps>({
    fontColor: "",
    font: "",
    backgroundColor: "",
  });
  const [logo, setLogo] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

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
    // Note: Removed window.location.href to stay on same page
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Simulate upload (replace with actual upload logic)
    setTimeout(() => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogo(result);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }, 1000);
  };

  const handleApplyCustomization = () => {
    // Here you can save the customization to your gig data
    // For now, just close the modal
    setShowCustomization(false);

    // You might want to update the gig with the customization data
    console.log("Applying customization:", {
      ...customization,
      logo,
    });
  };

  return (
    <div className={colors.background}>
      <SimpleForgotSecretModal
        gigId={gigId as Id<"gigs">}
        isOpen={showVerification && !isVerified}
        onClose={() => window.history.back()}
        onSuccess={handleVerificationSuccess}
      />

      {showCustomization && (
        <GigCustomization
          customization={customization}
          setCustomization={setCustomization}
          closeModal={() => setShowCustomization(false)}
          logo={logo}
          handleFileChange={handleFileChange}
          isUploading={isUploading}
        />
      )}

      {isVerified && (
        <div className="container mx-auto p-4 md:p-6">
          {/* Header with Customize Button */}
          <div className="flex justify-between items-center mb-6">
            <h1 className={`text-2xl font-bold ${colors.text}`}>Edit Gig</h1>
            <Button
              variant="outline"
              onClick={() => setShowCustomization(true)}
              className="flex items-center gap-2 border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
            >
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Customize Design</span>
              <span className="sm:hidden">Design</span>
            </Button>
          </div>

          {/* Customization Preview Banner */}
          {(customization.backgroundColor ||
            customization.fontColor ||
            customization.font ||
            logo) && (
            <div
              className="mb-6 p-4 rounded-xl border"
              style={{
                backgroundColor:
                  customization.backgroundColor || colors.background,
                borderColor: colors.border,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <Palette className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3
                      className="font-medium"
                      style={{ color: customization.fontColor || colors.text }}
                    >
                      Custom Design Active
                    </h3>
                    <p
                      className="text-sm opacity-75"
                      style={{
                        color: customization.fontColor || colors.textMuted,
                      }}
                    >
                      {customization.font || "Default font"} •{" "}
                      {customization.fontColor || "Default color"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCustomization({
                      fontColor: "",
                      font: "",
                      backgroundColor: "",
                    });
                    setLogo("");
                  }}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  Reset
                </Button>
              </div>
            </div>
          )}

          {/* Edit Form with customization data */}
          <EditGigForm
            customization={customization}
            logo={logo}
            gigId={gigId}
          />
        </div>
      )}

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
