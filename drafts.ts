// utils/draftUtils.ts

export type BusinessCategory =
  | "full"
  | "personal"
  | "other"
  | "mc"
  | "dj"
  | "vocalist"
  | null;

// Update LocalGigInputs type to include duration fields
export type LocalGigInputs = {
  title: string;
  description: string;
  phoneNo: string;
  price: string;
  category: string;
  location: string;
  secret: string;
  end: string;
  start: string;
  // Add these with correct casing (lowercase)
  durationfrom: string;
  durationto: string;

  bussinesscat: BusinessCategory;
  otherTimeline: string;
  gigtimeline: string;
  day: string;
  date: string;
  pricerange: string;
  currency: string;
  mcType?: string;
  mcLanguages?: string;
  djGenre?: string;
  djEquipment?: string;
  vocalistGenre?: string[];
};

export interface GigDraft {
  id: string;
  data: LocalGigInputs;
  createdAt: string;
  updatedAt: string;
  title: string;
  category: string;
  progress: number; // 0-100% completion
}

const DRAFTS_KEY = "gig_drafts";

// Helper to calculate draft completion percentage
const calculateProgress = (data: LocalGigInputs): number => {
  const requiredFields = [
    "title",
    "description",
    "location",
    "bussinesscat",
  ] as const;

  let completed = 0;

  requiredFields.forEach((field) => {
    if (field === "bussinesscat") {
      if (data[field]) completed++;
    } else if (data[field]?.trim()) {
      completed++;
    }
  });

  // Add talent-specific fields if applicable
  if (data.bussinesscat === "mc") {
    if (data.mcType?.trim()) completed++;
    if (data.mcLanguages?.trim()) completed++;
  } else if (data.bussinesscat === "dj") {
    if (data.djGenre?.trim()) completed++;
    if (data.djEquipment?.trim()) completed++;
  } else if (data.bussinesscat === "vocalist") {
    if (data.vocalistGenre?.length) completed++;
  }

  const totalFields = data.bussinesscat
    ? ["mc", "dj", "vocalist"].includes(data.bussinesscat)
      ? 6
      : 4
    : 4;

  return Math.round((completed / totalFields) * 100);
};

export const saveGigDraft = (
  draftData: LocalGigInputs,
  existingId?: string
): GigDraft => {
  const drafts = getGigDrafts();
  const now = new Date().toISOString();
  const draftId =
    existingId ||
    `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const progress = calculateProgress(draftData);

  const newDraft: GigDraft = {
    id: draftId,
    data: draftData,
    createdAt: existingId
      ? drafts.find((d) => d.id === existingId)?.createdAt || now
      : now,
    updatedAt: now,
    title: draftData.title || "Untitled Draft",
    category: draftData.bussinesscat || "uncategorized",
    progress,
  };

  // Remove old draft if updating
  const filteredDrafts = existingId
    ? drafts.filter((d) => d.id !== existingId)
    : drafts;

  // Add new draft to beginning of array (most recent first)
  const updatedDrafts = [newDraft, ...filteredDrafts].slice(0, 50); // Keep only last 50 drafts

  try {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(updatedDrafts));

    // Log success to console for debugging
    console.log(
      `Draft saved: ${newDraft.title} (ID: ${newDraft.id}, Progress: ${progress}%)`
    );

    return newDraft;
  } catch (error) {
    console.error("Error saving draft to localStorage:", error);

    // Check if localStorage is full
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      // Try to clear some old drafts
      const trimmedDrafts = [newDraft, ...filteredDrafts].slice(0, 10); // Keep only last 10
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(trimmedDrafts));
      return newDraft;
    }

    throw new Error("Failed to save draft: " + (error as Error).message);
  }
};

export const getGigDrafts = (): GigDraft[] => {
  if (typeof window === "undefined") return [];

  try {
    const drafts = localStorage.getItem(DRAFTS_KEY);
    return drafts ? JSON.parse(drafts) : [];
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
    console.log("All drafts cleared");
  } catch (error) {
    console.error("Error clearing drafts from localStorage:", error);
  }
};

export const getDraftStats = () => {
  const drafts = getGigDrafts();
  const now = new Date();
  const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));

  return {
    total: drafts.length,
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
  };
};

// Import/Export functionality
export const exportDrafts = (): string => {
  const drafts = getGigDrafts();
  const exportData = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    count: drafts.length,
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
    const mergedDrafts = [...importData.drafts, ...currentDrafts]
      .slice(0, 50) // Keep only 50 most recent
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
