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
  bookedPrice?: number;
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

export function useGigUpdate() {
  const updateGigMutation = useMutation(api.controllers.gigs.updateGig);
  const updateGigStatusMutation = useMutation(
    api.controllers.gigs.updateGigStatus
  );
  const updateBandRoleMutation = useMutation(
    api.controllers.gigs.updateBandRole
  );
  const updateGigVisibilityMutation = useMutation(
    api.controllers.gigs.updateGigVisibility
  );

  const updateGig = async (params: UpdateGigParams) => {
    try {
      // Clean up undefined values and format band roles
      const cleanParams: any = {};

      Object.entries(params).forEach(([key, value]) => {
        if (key === "bandCategory" && value !== undefined) {
          // Handle bandCategory specially
          if (Array.isArray(value) && value.length > 0) {
            cleanParams[key] = value.map((role: BandRoleInput) => ({
              role: role.role,
              maxSlots: role.maxSlots || 1,
              filledSlots: role.filledSlots || 0,
              applicants: role.applicants || [],
              bookedUsers: role.bookedUsers || [],
              requiredSkills: role.requiredSkills || [],
              description: role.description || "",
              isLocked: role.isLocked || false,
              price: role.price !== undefined ? role.price : null,
              currency: role.currency || "KES",
              negotiable:
                role.negotiable !== undefined ? role.negotiable : true,
              bookedPrice:
                role.bookedPrice !== undefined ? role.bookedPrice : null,
            }));
          } else {
            // Empty array or null
            cleanParams[key] = value;
          }
        } else if (value !== undefined && value !== null) {
          cleanParams[key] = value;
        }
      });

      const result = await updateGigMutation(cleanParams);
      toast.success("Gig updated successfully");
      return result;
    } catch (error: any) {
      console.error("Error updating gig:", error);
      toast.error(error.message || "Failed to update gig");
      throw error;
    }
  };

  const updateGigStatus = async (gigId: Id<"gigs">, isActive: boolean) => {
    try {
      const result = await updateGigStatusMutation({ gigId, isActive });
      toast.success(isActive ? "Gig activated" : "Gig deactivated");
      return result;
    } catch (error: any) {
      console.error("Error updating gig status:", error);
      toast.error(error.message || "Failed to update gig status");
      throw error;
    }
  };

  const updateGigVisibility = async (gigId: Id<"gigs">, isPublic: boolean) => {
    try {
      const result = await updateGigVisibilityMutation({ gigId, isPublic });
      toast.success(isPublic ? "Gig made public" : "Gig made private");
      return result;
    } catch (error: any) {
      console.error("Error updating gig visibility:", error);
      toast.error(error.message || "Failed to update gig visibility");
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
    }
  ) => {
    try {
      const result = await updateBandRoleMutation({
        gigId,
        roleIndex,
        updates,
      });
      toast.success("Band role updated");
      return result;
    } catch (error: any) {
      console.error("Error updating band role:", error);
      toast.error(error.message || "Failed to update band role");
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
