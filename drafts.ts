// utils/draftUtils.ts
import { BusinessCategory, BandRoleInput } from "@/types/gig";

export type LocalGigInputs = {
  title: string;
  description: string;
  phoneNo?: string;
  price: string;
  category: string;
  location: string;
  secret: string;
  end: string;
  start: string;
  durationfrom: string;
  durationto: string;

  // ⭐ MAKE THESE OPTIONAL FOR FORM STATE ⭐
  tags?: string[];
  requirements?: string[];
  benefits?: string[];
  logo?: string;
  isTaken?: boolean;
  isPending?: boolean;
  isActive?: boolean;
  isPublic?: boolean;

  maxSlots?: number;
  bussinesscat: BusinessCategory;
  otherTimeline: string;
  gigtimeline: string;
  day: string;
  date: string;
  pricerange: string;
  currency: string;
  negotiable: boolean;

  // Talent-specific fields
  mcType?: string;
  mcLanguages?: string;
  djGenre?: string;
  djEquipment?: string;
  vocalistGenre?: string[];
  acceptInterestStartTime?: string;
  acceptInterestEndTime?: string;
  interestWindowDays?: number;
  enableInterestWindow?: boolean;
};

// Draft data structure with band roles including price
export interface GigDraftData {
  formValues: LocalGigInputs;
  bandRoles?: BandRoleInput[];
  customization?: {
    fontColor: string;
    font: string;
    backgroundColor: string;
  };
  imageUrl?: string;
  schedulingProcedure?: {
    type: string;
    date: Date;
  };
}

export interface GigDraft {
  id: string;
  data: GigDraftData;
  createdAt: string;
  updatedAt: string;
  title: string;
  category: string;
  progress: number;
  isBandGig?: boolean;
  bandRoleCount?: number;
  totalSlots?: number;
  estimatedBudget?: number;
}

const DRAFTS_KEY = "gig_drafts_v3";

// Helper to calculate draft completion percentage with band role support
const calculateProgress = (data: GigDraftData): number => {
  const { formValues, bandRoles } = data;
  const requiredFields = [
    "title",
    "description",
    "location",
    "bussinesscat",
  ] as const;

  let completed = 0;

  // Check required fields
  requiredFields.forEach((field) => {
    if (field === "bussinesscat") {
      if (formValues[field]) completed++;
    } else if (formValues[field]?.trim()) {
      completed++;
    }
  });

  // ADD: Check for required fields from GigFormInputs
  if (formValues.tags && formValues.tags.length > 0) completed++;
  if (formValues.requirements && formValues.requirements.length > 0)
    completed++;
  if (formValues.benefits && formValues.benefits.length > 0) completed++;
  if (formValues.logo?.trim()) completed++;
  if (formValues.phoneNo?.trim()) completed++; // Check phone (was phoneNo)

  // Add talent-specific fields if applicable
  if (formValues.bussinesscat === "mc") {
    if (formValues.mcType?.trim()) completed++;
    if (formValues.mcLanguages?.trim()) completed++;
  } else if (formValues.bussinesscat === "dj") {
    if (formValues.djGenre?.trim()) completed++;
    if (formValues.djEquipment?.trim()) completed++;
  } else if (formValues.bussinesscat === "vocalist") {
    if (formValues.vocalistGenre?.length) completed++;
  } else if (formValues.bussinesscat === "other") {
    // For "Create Band" gigs, check band roles
    if (bandRoles && bandRoles.length > 0) {
      completed += 2; // Give points for having band roles

      // Check if at least one role has required skills
      const hasRequiredSkills = bandRoles.some(
        (role) => role.requiredSkills && role.requiredSkills.length > 0
      );
      if (hasRequiredSkills) completed++;

      // Check if price is set for at least one role
      const hasPrice = bandRoles.some(
        (role) => role.price && parseFloat(role.price) > 0
      );
      if (hasPrice) completed++;
    }
  }

  // Adjust total fields based on business category
  let totalFields = 9; // CHANGED: Increased from 4 to account for new required fields

  if (formValues.bussinesscat === "other") {
    // For band gigs, add fields for band setup
    totalFields += 4;
  } else if (["mc", "dj", "vocalist"].includes(formValues.bussinesscat || "")) {
    totalFields += 2;
  }

  return Math.round((completed / totalFields) * 100);
};

export const saveGigDraft = (
  draftData: GigDraftData,
  existingId?: string
): GigDraft => {
  const drafts = getGigDrafts();
  const now = new Date().toISOString();
  const draftId =
    existingId ||
    `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const progress = calculateProgress(draftData);

  const isBandGig = draftData.formValues.bussinesscat === "other";
  const bandRoleCount = isBandGig ? draftData.bandRoles?.length || 0 : 0;
  const totalSlots = isBandGig
    ? draftData.bandRoles?.reduce((sum, role) => sum + role.maxSlots, 0) || 0
    : 0;

  // Calculate estimated budget for band gigs
  const estimatedBudget = isBandGig
    ? draftData.bandRoles?.reduce((sum, role) => {
        const price = parseFloat(role.price || "0");
        return sum + price * role.maxSlots;
      }, 0) || 0
    : 0;

  const newDraft: GigDraft = {
    id: draftId,
    data: draftData,
    createdAt: existingId
      ? drafts.find((d) => d.id === existingId)?.createdAt || now
      : now,
    updatedAt: now,
    title: draftData.formValues.title || "Untitled Draft",
    category: draftData.formValues.bussinesscat || "uncategorized",
    progress,
    isBandGig,
    bandRoleCount: isBandGig ? bandRoleCount : undefined,
    totalSlots: isBandGig ? totalSlots : undefined,
    estimatedBudget: isBandGig ? estimatedBudget : undefined,
  };

  // Remove old draft if updating
  const filteredDrafts = existingId
    ? drafts.filter((d) => d.id !== existingId)
    : drafts;

  // Add new draft to beginning of array (most recent first)
  const updatedDrafts = [newDraft, ...filteredDrafts].slice(0, 50);

  try {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(updatedDrafts));

    // Log success to console for debugging
    console.log(
      `Draft saved: ${newDraft.title} (ID: ${newDraft.id}, Progress: ${progress}%)`,
      isBandGig
        ? `[Band Gig: ${bandRoleCount} roles, ${totalSlots} slots, Budget: ${estimatedBudget}]`
        : ""
    );

    return newDraft;
  } catch (error) {
    console.error("Error saving draft to localStorage:", error);

    // Check if localStorage is full
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      // Try to clear some old drafts
      const trimmedDrafts = [newDraft, ...filteredDrafts].slice(0, 10);
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(trimmedDrafts));
      return newDraft;
    }

    throw new Error("Failed to save draft: " + (error as Error).message);
  }
};

// ADD: Helper function to ensure backward compatibility
const migrateOldDraftData = (oldData: any): GigDraftData => {
  // If it's the old format (just formValues object)
  if (oldData.formValues && !oldData.formValues.tags) {
    const formValues = oldData.formValues;

    // Migrate phoneNo to phone
    const phone = formValues.phoneNo || formValues.phone || "";

    return {
      formValues: {
        ...formValues,
        phone, // Use phone field
        tags: formValues.tags || [],
        requirements: formValues.requirements || [],
        benefits: formValues.benefits || [],
        logo: formValues.logo || "",
        isTaken: formValues.isTaken || false,
        isPending: formValues.isPending || false,
        isActive: formValues.isActive || true,
        isPublic: formValues.isPublic || true,
      },
      bandRoles: oldData.bandRoles || [],
      customization: oldData.customization,
      imageUrl: oldData.imageUrl,
      schedulingProcedure: oldData.schedulingProcedure,
    };
  }

  return oldData;
};

export const getGigDrafts = (): GigDraft[] => {
  if (typeof window === "undefined") return [];

  try {
    // Try to get current version first
    let drafts = localStorage.getItem(DRAFTS_KEY);

    if (!drafts) {
      // Try to migrate from version 2
      const v2Drafts = localStorage.getItem("gig_drafts_v2");
      if (v2Drafts) {
        const parsedDrafts = JSON.parse(v2Drafts);
        const migratedDrafts = parsedDrafts.map((draft: any) => {
          const migratedData = migrateOldDraftData(draft.data);

          return {
            ...draft,
            data: migratedData,
            estimatedBudget: draft.isBandGig
              ? migratedData.bandRoles?.reduce((sum: number, role: any) => {
                  const price = parseFloat(role.price || "0");
                  return sum + price * role.maxSlots;
                }, 0) || 0
              : undefined,
          };
        });

        localStorage.setItem(DRAFTS_KEY, JSON.stringify(migratedDrafts));
        localStorage.removeItem("gig_drafts_v2");
        return migratedDrafts;
      }

      // Try to migrate from version 1
      const v1Drafts = localStorage.getItem("gig_drafts");
      if (v1Drafts) {
        const parsedOldDrafts = JSON.parse(v1Drafts);
        const migratedDrafts = parsedOldDrafts.map((oldDraft: any) => {
          const migratedData = migrateOldDraftData({
            formValues: oldDraft.data,
            bandRoles: [],
            customization: undefined,
            imageUrl: undefined,
            schedulingProcedure: undefined,
          });

          return {
            ...oldDraft,
            data: migratedData,
            isBandGig: oldDraft.data?.bussinesscat === "other",
            estimatedBudget: 0,
          };
        });

        localStorage.setItem(DRAFTS_KEY, JSON.stringify(migratedDrafts));
        localStorage.removeItem("gig_drafts");
        return migratedDrafts;
      }
      return [];
    }

    const parsedDrafts = JSON.parse(drafts);

    // Ensure all drafts have the new structure
    const updatedDrafts = parsedDrafts.map((draft: GigDraft) => {
      const migratedData = migrateOldDraftData(draft.data);

      // Recalculate progress with migrated data
      const progress = calculateProgress(migratedData);

      const isBandGig = migratedData.formValues.bussinesscat === "other";
      const bandRoleCount = isBandGig ? migratedData.bandRoles?.length || 0 : 0;
      const totalSlots = isBandGig
        ? migratedData.bandRoles?.reduce(
            (sum, role) => sum + role.maxSlots,
            0
          ) || 0
        : 0;

      const estimatedBudget = isBandGig
        ? migratedData.bandRoles?.reduce((sum, role) => {
            const price = parseFloat(role.price || "0");
            return sum + price * role.maxSlots;
          }, 0) || 0
        : 0;

      return {
        ...draft,
        data: migratedData,
        progress,
        isBandGig,
        bandRoleCount: isBandGig ? bandRoleCount : undefined,
        totalSlots: isBandGig ? totalSlots : undefined,
        estimatedBudget: isBandGig ? estimatedBudget : undefined,
      };
    });

    // Save back if any updates were made
    if (JSON.stringify(updatedDrafts) !== JSON.stringify(parsedDrafts)) {
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(updatedDrafts));
    }

    return updatedDrafts;
  } catch (error) {
    console.error("Error reading drafts from localStorage:", error);
    return [];
  }
};

export const getGigDraftById = (id: string): GigDraft | null => {
  const drafts = getGigDrafts();
  return drafts.find((draft) => draft.id === id) || null;
};

export const deleteGigDraft = (id: string): boolean => {
  try {
    const drafts = getGigDrafts();
    const draftToDelete = drafts.find((d) => d.id === id);

    if (!draftToDelete) {
      return false;
    }

    const updatedDrafts = drafts.filter((draft) => draft.id !== id);
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(updatedDrafts));

    console.log(`Draft deleted: ${draftToDelete.title} (ID: ${id})`);

    return true;
  } catch (error) {
    console.error("Error deleting draft from localStorage:", error);
    return false;
  }
};

export const clearAllGigDrafts = (): void => {
  try {
    localStorage.removeItem(DRAFTS_KEY);
    localStorage.removeItem("gig_drafts"); // Also clear old version
    console.log("All drafts cleared");
  } catch (error) {
    console.error("Error clearing drafts from localStorage:", error);
  }
};

export const getDraftStats = () => {
  const drafts = getGigDrafts();
  const now = new Date();
  const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));

  // Calculate total budget for band gigs
  const totalBandBudget = drafts.reduce(
    (sum, d) => sum + (d.estimatedBudget || 0),
    0
  );
  const averageBandBudget =
    drafts.filter((d) => d.isBandGig).length > 0
      ? Math.round(totalBandBudget / drafts.filter((d) => d.isBandGig).length)
      : 0;

  const stats = {
    total: drafts.length,
    bandGigs: drafts.filter((d) => d.isBandGig).length,
    individualGigs: drafts.filter((d) => !d.isBandGig).length,
    byCategory: drafts.reduce(
      (acc, draft) => {
        const category = draft.category || "uncategorized";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
    recent: drafts.filter((d) => new Date(d.updatedAt) > sevenDaysAgo).length,
    averageProgress:
      drafts.length > 0
        ? Math.round(
            drafts.reduce((sum, d) => sum + d.progress, 0) / drafts.length
          )
        : 0,
    lastUpdated: drafts[0]?.updatedAt || null,
    totalBandRoles: drafts.reduce((sum, d) => sum + (d.bandRoleCount || 0), 0),
    totalBandSlots: drafts.reduce((sum, d) => sum + (d.totalSlots || 0), 0),
    totalBandBudget: totalBandBudget,
    averageBandBudget: averageBandBudget,
    bandGigsWithPrice: drafts.filter(
      (d) => d.isBandGig && d.estimatedBudget && d.estimatedBudget > 0
    ).length,
  };

  return stats;
};

// Helper to get band role summary with price
export const getBandRoleSummary = (draft: GigDraft): string => {
  if (!draft.isBandGig || !draft.bandRoleCount) return "";

  const roleText = `${draft.bandRoleCount} role${draft.bandRoleCount !== 1 ? "s" : ""}`;
  const slotText = draft.totalSlots
    ? `, ${draft.totalSlots} slot${draft.totalSlots !== 1 ? "s" : ""}`
    : "";

  let priceText = "";
  if (draft.estimatedBudget && draft.estimatedBudget > 0) {
    // Find the main currency used
    const mainCurrency = draft.data.bandRoles?.[0]?.currency || "KES";
    priceText = `, ${mainCurrency} ${draft.estimatedBudget.toLocaleString()}`;
  }

  return `🎵 ${roleText}${slotText}${priceText}`;
};

// Import/Export functionality
export const exportDrafts = (): string => {
  const drafts = getGigDrafts();
  const exportData = {
    version: "3.0", // CHANGED: Updated version
    exportedAt: new Date().toISOString(),
    count: drafts.length,
    bandGigs: drafts.filter((d) => d.isBandGig).length,
    drafts,
  };
  return JSON.stringify(exportData, null, 2);
};

export const importDrafts = (jsonData: string): boolean => {
  try {
    const importData = JSON.parse(jsonData);

    if (!importData.drafts || !Array.isArray(importData.drafts)) {
      throw new Error("Invalid import format");
    }

    const currentDrafts = getGigDrafts();

    // Migrate imported drafts to new structure
    const migratedDrafts = importData.drafts.map((draft: any) => {
      const migratedData = migrateOldDraftData(draft.data);

      return {
        ...draft,
        data: migratedData,
        isBandGig: migratedData.formValues.bussinesscat === "other",
      };
    });

    const mergedDrafts = [...migratedDrafts, ...currentDrafts]
      .slice(0, 50)
      .map((draft) => ({
        ...draft,
        id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }));

    localStorage.setItem(DRAFTS_KEY, JSON.stringify(mergedDrafts));
    return true;
  } catch (error) {
    console.error("Error importing drafts:", error);
    return false;
  }
};

// Filter drafts by category
export const filterDraftsByCategory = (
  category: BusinessCategory
): GigDraft[] => {
  const drafts = getGigDrafts();
  if (!category) return drafts;
  return drafts.filter(
    (draft) => draft.data.formValues.bussinesscat === category
  );
};

// Get band-specific drafts
export const getBandGigDrafts = (): GigDraft[] => {
  return getGigDrafts().filter((draft) => draft.isBandGig);
};

// Update band roles for a draft
export const updateDraftBandRoles = (
  draftId: string,
  bandRoles: BandRoleInput[]
): GigDraft | null => {
  const draft = getGigDraftById(draftId);
  if (!draft) return null;

  // Calculate estimated budget
  const estimatedBudget = bandRoles.reduce((sum, role) => {
    const price = parseFloat(role.price || "0");
    return sum + price * role.maxSlots;
  }, 0);

  const updatedDraft = {
    ...draft,
    data: {
      ...draft.data,
      bandRoles,
    },
    updatedAt: new Date().toISOString(),
    bandRoleCount: bandRoles.length,
    totalSlots: bandRoles.reduce((sum, role) => sum + role.maxSlots, 0),
    estimatedBudget,
    progress: calculateProgress({ ...draft.data, bandRoles }),
  };

  const drafts = getGigDrafts();
  const updatedDrafts = drafts.map((d) =>
    d.id === draftId ? updatedDraft : d
  );
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(updatedDrafts));

  return updatedDraft;
};

// Search drafts by title or description
export const searchDrafts = (query: string): GigDraft[] => {
  const drafts = getGigDrafts();
  const lowerQuery = query.toLowerCase();

  return drafts.filter((draft) => {
    const title = draft.data.formValues.title?.toLowerCase() || "";
    const description = draft.data.formValues.description?.toLowerCase() || "";
    const location = draft.data.formValues.location?.toLowerCase() || "";

    return (
      title.includes(lowerQuery) ||
      description.includes(lowerQuery) ||
      location.includes(lowerQuery)
    );
  });
};
