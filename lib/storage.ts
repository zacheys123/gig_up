import { LocalGigInputs } from "@/drafts";

// lib/storage.ts
export const saveDraftToLocal = (data: LocalGigInputs) => {
  try {
    localStorage.setItem("gigDraft", JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Local storage error:", error);
    return false;
  }
};

export const getDraftFromLocal = () => {
  try {
    const draft = localStorage.getItem("gigDraft");
    return draft ? JSON.parse(draft) : null;
  } catch (error) {
    console.error("Error reading draft:", error);
    return null;
  }
};

export const clearDraftFromLocal = () => {
  localStorage.removeItem("gigDraft");
};
