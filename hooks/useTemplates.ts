// hooks/useTemplates.ts - COMPLETE REWRITTEN VERSION
import { useMutation, useQuery } from "convex/react";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { GigTemplate } from "@/convex/instantGigsTypes";
import { useCurrentUser } from "./useCurrentUser";

// Cache keys
const TEMPLATES_CACHE_KEY = "instant_gig_templates_cache";
const CACHE_TIMESTAMP_KEY = "instant_gig_templates_timestamp";
const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes

// Trial configuration
const TRIAL_DURATION_DAYS = 14; // 14-day trial
const TRIAL_DURATION_MS = TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000;

// Types for better organization
interface TemplateState {
  templates: GigTemplate[];
  isLoading: boolean;
  isRefetching: boolean;
  lastRefetchTime: number;
  error: string | null;
}

interface TemplateActions {
  createTemplate: (
    templateData: Omit<GigTemplate, "id" | "status" | "createdAt" | "_id">
  ) => Promise<string>;
  updateTemplate: (
    templateId: string,
    updates: Partial<GigTemplate>
  ) => Promise<void>;
  deleteTemplate: (templateId: string) => Promise<void>;
  refetchTemplates: () => Promise<void>;
}

export const useTemplates = (userId: Id<"users">) => {
  // State management
  const [state, setState] = useState<TemplateState>({
    templates: [],
    isLoading: true,
    isRefetching: false,
    lastRefetchTime: 0,
    error: null,
  });

  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const { user } = useCurrentUser();

  // Refs for stable references
  const pendingMutations = useRef<Set<string>>(new Set());
  const isMounted = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Calculate isInGracePeriod based on user creation time
  const isInGracePeriod = useMemo(() => {
    if (!user?._creationTime) {
      console.log("❌ [TRIAL] No user creation time found");
      return false;
    }

    const userCreationTime = user._creationTime;
    const trialEndTime = userCreationTime + TRIAL_DURATION_MS;
    const currentTime = Date.now();
    const isInTrial = currentTime < trialEndTime;

    console.log("🔍 [TRIAL CALCULATION]:", {
      userCreationTime: new Date(userCreationTime).toISOString(),
      trialEndTime: new Date(trialEndTime).toISOString(),
      currentTime: new Date(currentTime).toISOString(),
      daysRemaining: Math.ceil(
        (trialEndTime - currentTime) / (1000 * 60 * 60 * 24)
      ),
      isInTrial,
    });

    return isInTrial;
  }, [user?._creationTime]);

  // Convex query with refetch trigger
  const convexQueryResult = useQuery(
    api.controllers.instantGigs.getClientTemplates,
    userId
      ? {
          clientId: userId,
          refetchTrigger,
        }
      : "skip"
  );

  // Cache management
  const getCachedTemplates = useCallback((): GigTemplate[] | null => {
    try {
      const cached = localStorage.getItem(TEMPLATES_CACHE_KEY);
      const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

      if (!cached || !timestamp) return null;

      const age = Date.now() - parseInt(timestamp);
      if (age > CACHE_MAX_AGE) {
        console.log("💾 [TEMPLATES] Cache expired, age:", age);
        localStorage.removeItem(CACHE_TIMESTAMP_KEY);
        return null;
      }

      return JSON.parse(cached);
    } catch (error) {
      console.warn("❌ [TEMPLATES] Failed to read cache:", error);
      return null;
    }
  }, []);

  const setCachedTemplates = useCallback((templates: GigTemplate[]) => {
    if (!isMounted.current) return;

    try {
      localStorage.setItem(TEMPLATES_CACHE_KEY, JSON.stringify(templates));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.warn("❌ [TEMPLATES] Failed to update cache:", error);
    }
  }, []);

  // Initialize with cache-first approach
  useEffect(() => {
    isMounted.current = true;
    abortControllerRef.current = new AbortController();

    // Try cache first for instant loading
    const cached = getCachedTemplates();
    if (cached && cached.length > 0) {
      console.log("💾 [TEMPLATES] Using cached templates:", cached.length);
      setState((prev) => ({
        ...prev,
        templates: cached,
        isLoading: false,
      }));
    }

    return () => {
      isMounted.current = false;
      pendingMutations.current.clear();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [getCachedTemplates]);

  // Sync with Convex data
  useEffect(() => {
    if (!isMounted.current) return;

    console.log("🏁 [TEMPLATES] Convex query state:", {
      data: convexQueryResult?.length,
      isUndefined: convexQueryResult === undefined,
      isNull: convexQueryResult === null,
      refetchTrigger,
      timestamp: Date.now(),
    });

    // Still loading from Convex
    if (convexQueryResult === undefined) {
      console.log("🔄 [TEMPLATES] Still loading from Convex...");
      return;
    }

    // Convex query failed
    if (convexQueryResult === null) {
      console.log("❌ [TEMPLATES] Convex query failed");
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isRefetching: false,
        error: "Failed to load templates",
      }));
      return;
    }

    // Successfully loaded from Convex
    console.log(
      "✅ [TEMPLATES] Loaded from Convex:",
      convexQueryResult.length,
      "templates"
    );

    // Transform Convex data to GigTemplate format
    const transformedTemplates: GigTemplate[] = convexQueryResult.map((t) => ({
      id: t._id,
      title: t.title,
      description: t.description,
      date: t.date || "",
      venue: t.venue || "",
      budget: t.budget,
      gigType: t.gigType,
      duration: t.duration,
      fromTime: t.fromTime || "",
      setlist: t.setlist,
      icon: t.icon || "✨",
      createdAt: t.createdAt,
      _id: t._id,
      timesUsed: t.timesUsed,
    }));

    // Only update if data actually changed
    const currentCacheString = JSON.stringify(state.templates);
    const newCacheString = JSON.stringify(transformedTemplates);

    if (currentCacheString !== newCacheString) {
      console.log("🔄 [TEMPLATES] Updating cache with new data");
      setState((prev) => ({
        ...prev,
        templates: transformedTemplates,
        isLoading: false,
        isRefetching: false,
        lastRefetchTime: Date.now(),
        error: null,
      }));
      setCachedTemplates(transformedTemplates);
    } else {
      console.log("💾 [TEMPLATES] Cache is already up to date");
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isRefetching: false,
        error: null,
      }));
    }
  }, [convexQueryResult, state.templates, setCachedTemplates, refetchTrigger]);

  // Mutations
  const saveTemplateMutation = useMutation(
    api.controllers.instantGigs.saveTemplate
  );
  const deleteTemplateMutation = useMutation(
    api.controllers.instantGigs.deleteTemplate
  );

  // Template limit check - FIXED VERSION
  const canCreateTemplate = useCallback(() => {
    const userTier = user?.tier || "free";
    const isFreeUser = userTier === "free";

    console.log("🔍 [TEMPLATE LIMIT DEBUG]:", {
      userTier,
      templatesCount: state.templates.length,
      isInGracePeriod,
      userIsFree: isFreeUser,
      userCreationTime: user?._creationTime
        ? new Date(user._creationTime).toISOString()
        : "none",
    });

    // If user is NOT free (pro, premium, elite), they can create unlimited templates
    if (!isFreeUser) {
      console.log("✅ [TEMPLATE LIMIT]: Paid user - unlimited templates");
      return true;
    }

    // If user IS free AND in grace period, apply limit
    if (isInGracePeriod) {
      const currentCount = state.templates.length;
      const maxFreeTemplates = 3;

      console.log("🔍 [TEMPLATE LIMIT CHECK]:", {
        currentCount,
        maxFreeTemplates,
        shouldLimit: currentCount >= maxFreeTemplates,
      });

      if (currentCount >= maxFreeTemplates) {
        console.log(
          "🚫 [TEMPLATE LIMIT]: Free user in grace period reached limit"
        );
        return false;
      }

      console.log("✅ [TEMPLATE LIMIT]: Free user in grace period can create");
      return true;
    }

    // If user is free but NOT in grace period - they can create unlimited
    console.log(
      "✅ [TEMPLATE LIMIT]: Free user not in grace period - unlimited"
    );
    return true;
  }, [
    state.templates.length,
    isInGracePeriod,
    user?.tier,
    user?._creationTime,
  ]);

  // Refetch function
  const refetchTemplates = useCallback(async () => {
    if (!isMounted.current || state.isRefetching) return;

    console.log("🔄 [TEMPLATES] Manual refetch triggered");

    setState((prev) => ({ ...prev, isRefetching: true, error: null }));

    try {
      // Clear cache to force fresh data
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);

      // Increment refetch trigger to force Convex re-execution
      setRefetchTrigger((prev) => prev + 1);

      console.log(
        "✅ [TEMPLATES] Refetch initiated, trigger:",
        refetchTrigger + 1
      );
    } catch (error) {
      console.warn("❌ [TEMPLATES] Refetch failed:", error);
      setState((prev) => ({
        ...prev,
        isRefetching: false,
        error: "Failed to refetch templates",
      }));
    }
  }, [state.isRefetching, refetchTrigger]);

  // Template creation with HARD CHECK
  const createTemplate = useCallback(
    async (
      templateData: Omit<GigTemplate, "id" | "status" | "createdAt" | "_id">
    ) => {
      // HARD CHECK - regardless of canCreateTemplate()
      const userTier = user?.tier || "free";
      const isFreeUser = userTier === "free";

      if (isFreeUser && isInGracePeriod && state.templates.length >= 3) {
        throw new Error(
          "Free users can only create up to 3 templates during trial. Please upgrade to create more."
        );
      }

      if (!canCreateTemplate()) {
        throw new Error(
          "Free users can only create up to 3 templates. Please upgrade to create more."
        );
      }

      const tempId = `temp_${Date.now()}`;
      if (pendingMutations.current.has(tempId)) {
        throw new Error("Template creation already in progress");
      }

      pendingMutations.current.add(tempId);

      const optimisticTemplate: GigTemplate = {
        ...templateData,
        id: tempId,
        createdAt: Date.now(),
      };

      const originalTemplates = [...state.templates];

      try {
        // 1. Immediate optimistic update
        const newTemplates = [...state.templates, optimisticTemplate];
        setState((prev) => ({ ...prev, templates: newTemplates }));
        setCachedTemplates(newTemplates);

        // 2. Save to Convex in background
        const realId = await saveTemplateMutation({
          title: templateData.title,
          description: templateData.description,
          date: templateData.date,
          venue: templateData.venue,
          budget: templateData.budget,
          gigType: templateData.gigType,
          duration: templateData.duration,
          fromTime: templateData.fromTime,
          setlist: templateData.setlist,
          icon: templateData.icon,
          clientId: userId,
          clientName: "",
        });

        // 3. Update with real ID
        const updatedTemplates = newTemplates.map((t) =>
          t.id === tempId ? { ...t, id: realId, _id: realId } : t
        );

        setState((prev) => ({ ...prev, templates: updatedTemplates }));
        setCachedTemplates(updatedTemplates);

        console.log("✅ [TEMPLATES] Template created successfully:", realId);
        return realId;
      } catch (error) {
        // Rollback on error
        console.error("❌ [TEMPLATES] Template creation failed:", error);
        setState((prev) => ({ ...prev, templates: originalTemplates }));
        setCachedTemplates(originalTemplates);
        throw error;
      } finally {
        pendingMutations.current.delete(tempId);
      }
    },
    [
      state.templates,
      saveTemplateMutation,
      userId,
      setCachedTemplates,
      canCreateTemplate,
      isInGracePeriod,
      user?.tier,
    ]
  );

  // Template update
  const updateTemplate = useCallback(
    async (templateId: string, updates: Partial<GigTemplate>) => {
      if (pendingMutations.current.has(templateId)) {
        throw new Error("Template update already in progress");
      }

      pendingMutations.current.add(templateId);

      const templateToUpdate = state.templates.find((t) => t.id === templateId);
      if (!templateToUpdate) {
        pendingMutations.current.delete(templateId);
        throw new Error("Template not found");
      }

      const originalTemplates = [...state.templates];

      try {
        // 1. Immediate optimistic update
        const updatedTemplates = state.templates.map((t) =>
          t.id === templateId ? { ...t, ...updates } : t
        );

        setState((prev) => ({ ...prev, templates: updatedTemplates }));
        setCachedTemplates(updatedTemplates);

        // 2. Update in Convex in background
        await saveTemplateMutation({
          templateId: templateId,
          title: updates.title || templateToUpdate.title,
          description: updates.description || templateToUpdate.description,
          date: updates.date || templateToUpdate.date,
          venue: updates.venue || templateToUpdate.venue,
          budget: updates.budget || templateToUpdate.budget,
          gigType: updates.gigType || templateToUpdate.gigType,
          duration: updates.duration || templateToUpdate.duration,
          fromTime: updates.fromTime || templateToUpdate.fromTime,
          setlist: updates.setlist || templateToUpdate.setlist,
          icon: updates.icon || templateToUpdate.icon,
          clientId: userId,
          clientName: "",
        });

        console.log(
          "✅ [TEMPLATES] Template updated successfully:",
          templateId
        );
      } catch (error) {
        // Rollback on error
        console.error("❌ [TEMPLATES] Template update failed:", error);
        setState((prev) => ({ ...prev, templates: originalTemplates }));
        setCachedTemplates(originalTemplates);
        throw error;
      } finally {
        pendingMutations.current.delete(templateId);
      }
    },
    [state.templates, saveTemplateMutation, userId, setCachedTemplates]
  );

  // Template deletion
  const deleteTemplate = useCallback(
    async (templateId: string) => {
      if (pendingMutations.current.has(templateId)) {
        throw new Error("Template deletion already in progress");
      }

      pendingMutations.current.add(templateId);

      const templateToDelete = state.templates.find((t) => t.id === templateId);
      if (!templateToDelete) {
        pendingMutations.current.delete(templateId);
        throw new Error("Template not found");
      }

      const originalTemplates = [...state.templates];

      try {
        // 1. Immediate optimistic update
        const updatedTemplates = state.templates.filter(
          (t) => t.id !== templateId
        );
        setState((prev) => ({ ...prev, templates: updatedTemplates }));
        setCachedTemplates(updatedTemplates);

        // 2. Delete from Convex in background
        await deleteTemplateMutation({
          templateId: templateId as Id<"instantGigsTemplate">,
          clientId: userId,
        });

        console.log(
          "✅ [TEMPLATES] Template deleted successfully:",
          templateId
        );
      } catch (error) {
        // Rollback on error
        console.error("❌ [TEMPLATES] Template deletion failed:", error);
        setState((prev) => ({ ...prev, templates: originalTemplates }));
        setCachedTemplates(originalTemplates);
        throw error;
      } finally {
        pendingMutations.current.delete(templateId);
      }
    },
    [state.templates, deleteTemplateMutation, userId, setCachedTemplates]
  );

  // Template limit info - FIXED VERSION
  const templateLimitInfo = useMemo(() => {
    const userTier = user?.tier || "free";
    const isFreeUser = userTier === "free";

    // Paid users have no limits
    if (!isFreeUser) {
      return { current: state.templates.length, max: null, reached: false };
    }

    // Free users in grace period have limits
    if (isInGracePeriod) {
      const maxFreeTemplates = 3;
      return {
        current: state.templates.length,
        max: maxFreeTemplates,
        reached: state.templates.length >= maxFreeTemplates,
      };
    }

    // Free users not in grace period have no limits (or adjust based on your business rules)
    return { current: state.templates.length, max: null, reached: false };
  }, [state.templates.length, isInGracePeriod, user?.tier]);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Debug effect to see what's happening
  useEffect(() => {
    console.log("🔍 [TEMPLATE LIMIT STATE]:", {
      templatesCount: state.templates.length,
      templates: state.templates.map((t) => ({ id: t.id, title: t.title })),
      isInGracePeriod,
      userTier: user?.tier,
      canCreate: canCreateTemplate(),
      templateLimitInfo,
    });
  }, [
    state.templates,
    isInGracePeriod,
    user?.tier,
    canCreateTemplate,
    templateLimitInfo,
  ]);

  return {
    // State
    templates: state.templates,
    isLoading: state.isLoading,
    isRefetching: state.isRefetching,
    lastRefetchTime: state.lastRefetchTime,
    error: state.error,

    // Actions
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refetchTemplates,
    clearError,

    // Info
    canCreateTemplate,
    templateLimitInfo,

    // Derived state
    hasTemplates: state.templates.length > 0,
    templateCount: state.templates.length,

    // Debug info (optional - remove in production)
    isInGracePeriod, // Export for debugging
  };
};
