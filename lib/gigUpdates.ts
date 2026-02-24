import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export interface BandRoleInput {
  role: string;
  maxSlots: number;
  filledSlots?: number;
  applicants?: Id<"users">[];
  bookedUsers?: Id<"users">[];
  requiredSkills?: string[];
  description?: string;
  isLocked?: boolean;
  price?: number;
  currency?: string;
  negotiable?: boolean;
  // Remove bookedPrice from here - it should only be in booking-specific types
}

export interface UpdateGigParams {
  gigId: Id<"gigs">;
  clerkId?: string;
  title?: string;
  description?: string;
  phone?: string;
  price?: number;
  category?: string;
  location?: string;
  secret?: string;
  bussinesscat?: string;
  otherTimeline?: string;
  gigtimeline?: string;
  day?: string;
  date?: number;
  pricerange?: string;
  currency?: string;
  negotiable?: boolean;
  mcType?: string;
  mcLanguages?: string;
  djGenre?: string;
  djEquipment?: string;
  vocalistGenre?: string[];
  acceptInterestEndTime?: number;
  acceptInterestStartTime?: number;
  maxSlots?: number;
  font?: string;
  fontColor?: string;
  backgroundColor?: string;
  logo?: string;
  bandCategory?: BandRoleInput[];
  time?: {
    start: string;
    end: string;
    durationFrom?: string;
    durationTo?: string;
  };
  isActive?: boolean;
  isPublic?: boolean;
}

export function usegigUpdate() {
  const updateGigMutation = useMutation(api.controllers.gigs.updateGig);
  const updateGigStatusMutation = useMutation(
    api.controllers.gigs.updateGigStatus,
  );
  const updateBandRoleMutation = useMutation(
    api.controllers.gigs.updateBandRole,
  );
  const updateGigVisibilityMutation = useMutation(
    api.controllers.gigs.updateGigVisibility,
  );

  const updateGig = async (params: UpdateGigParams) => {
    // Clear any existing toasts first
    toast.dismiss();

    // Show loading toast
    const loadingToast = toast.loading("Updating gig...", {
      id: "gig-update-loading",
      duration: 5000, // Auto-dismiss after 5 seconds
    });

    try {
      // Clean up undefined values and format band roles
      const cleanParams: any = {};

      Object.entries(params).forEach(([key, value]) => {
        if (key === "bandCategory" && value !== undefined) {
          // Handle bandCategory specially
          if (Array.isArray(value) && value.length > 0) {
            cleanParams[key] = value.map((role: BandRoleInput) => {
              // Create a clean object without bookedPrice
              const { bookedPrice, ...cleanRole } = role as any;

              const formattedRole: any = {
                role: cleanRole.role,
                maxSlots: cleanRole.maxSlots || 1,
                maxApplicants: cleanRole.maxApplicants || 20,
                currentApplicants: cleanRole.currentApplicants || 0,
                filledSlots: cleanRole.filledSlots || 0,
                applicants: cleanRole.applicants || [],
                bookedUsers: cleanRole.bookedUsers || [],
                requiredSkills: cleanRole.requiredSkills || [],
                description: cleanRole.description || "",
                isLocked: cleanRole.isLocked || false,
                currency: cleanRole.currency || "KES",
                negotiable:
                  cleanRole.negotiable !== undefined
                    ? cleanRole.negotiable
                    : true,
              };

              // Only include price if it's a valid number
              if (cleanRole.price !== undefined && cleanRole.price !== null) {
                const priceValue = cleanRole.price;
                if (typeof priceValue === "number" && !isNaN(priceValue)) {
                  formattedRole.price = priceValue;
                } else if (typeof priceValue === "string") {
                  const parsed = parseFloat(priceValue);
                  if (!isNaN(parsed)) {
                    formattedRole.price = parsed;
                  }
                }
              }

              // Remove undefined values
              Object.keys(formattedRole).forEach((key) => {
                if (formattedRole[key] === undefined) {
                  delete formattedRole[key];
                }
              });

              return formattedRole;
            });
          } else {
            // Empty array or null
            cleanParams[key] = value;
          }
        } else if (value !== undefined && value !== null) {
          cleanParams[key] = value;
        }
      });

      const result = await updateGigMutation(cleanParams);

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success("✅ Gig Updated", {
        description: "Your gig has been successfully updated.",
        duration: 4000,
        icon: "🎉",
      });

      return result;
    } catch (error: any) {
      console.error("Error updating gig:", error);

      // Dismiss loading toast and show error
      toast.dismiss(loadingToast);
      toast.error("❌ Update Failed", {
        description: error.message || "Failed to update gig. Please try again.",
        duration: 6000,
        action: {
          label: "Retry",
          onClick: () => updateGig(params),
        },
      });

      throw error;
    }
  };

  const updateGigStatus = async (gigId: Id<"gigs">, isActive: boolean) => {
    toast.dismiss();

    try {
      const loadingToast = toast.loading(
        `${isActive ? "Activating" : "Deactivating"} gig...`,
      );
      const result = await updateGigStatusMutation({ gigId, isActive });

      toast.dismiss(loadingToast);
      toast.success(isActive ? "🚀 Gig Activated" : "⏸️ Gig Deactivated", {
        description: isActive
          ? "Your gig is now active and visible to musicians."
          : "Your gig has been deactivated and is no longer visible.",
        duration: 4000,
      });

      return result;
    } catch (error: any) {
      console.error("Error updating gig status:", error);
      toast.error("❌ Status Update Failed", {
        description: error.message || "Failed to update gig status.",
        duration: 5000,
      });
      throw error;
    }
  };

  const updateGigVisibility = async (gigId: Id<"gigs">, isPublic: boolean) => {
    toast.dismiss();

    try {
      const loadingToast = toast.loading(
        `${isPublic ? "Making public" : "Making private"}...`,
      );
      const result = await updateGigVisibilityMutation({ gigId, isPublic });

      toast.dismiss(loadingToast);
      toast.success(isPublic ? "🌍 Now Public" : "🔒 Now Private", {
        description: isPublic
          ? "Your gig is now visible to all musicians."
          : "Your gig is now private and only visible to you.",
        duration: 4000,
      });

      return result;
    } catch (error: any) {
      console.error("Error updating gig visibility:", error);
      toast.error("❌ Visibility Update Failed", {
        description: error.message || "Failed to update gig visibility.",
        duration: 5000,
      });
      throw error;
    }
  };

  const updateBandRole = async (
    gigId: Id<"gigs">,
    roleIndex: number,
    updates: {
      role?: string;
      maxSlots?: number;
      description?: string;
      requiredSkills?: string[];
      price?: number;
      currency?: string;
      negotiable?: boolean;
      isLocked?: boolean;
    },
  ) => {
    toast.dismiss();

    try {
      const loadingToast = toast.loading("Updating band role...");
      const result = await updateBandRoleMutation({
        gigId,
        roleIndex,
        updates,
      });

      toast.dismiss(loadingToast);
      toast.success("🎯 Role Updated", {
        description: "Band role configuration has been updated.",
        duration: 4000,
      });

      return result;
    } catch (error: any) {
      console.error("Error updating band role:", error);
      toast.error("❌ Role Update Failed", {
        description: error.message || "Failed to update band role.",
        duration: 5000,
      });
      throw error;
    }
  };

  return {
    updateGig,
    updateGigStatus,
    updateGigVisibility,
    updateBandRole,
  };
}
