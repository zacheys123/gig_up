// hooks/useTemplates.ts - OPTIMIZED
import { useMutation, useQuery } from "convex/react";
import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { GigTemplate } from "@/convex/instantGigsTypes";

// Cache key for localStorage
const TEMPLATES_CACHE_KEY = "instant_gig_templates_cache";

export const useTemplates = (userId: Id<"users">) => {
  const [localCache, setLocalCache] = useState<GigTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Use ref to track pending mutations and prevent race conditions
  const pendingMutations = useRef<Set<string>>(new Set());

  // Load from Convex (source of truth) with error handling
  const convexTemplates = useQuery(
    api.controllers.instantGigs.getClientTemplates,
    userId ? { clientId: userId } : "skip"
  );

  // Initialize and cache with proper cleanup
  useEffect(() => {
    if (!convexTemplates) {
      // Try to load from cache while waiting for Convex
      try {
        const cached = localStorage.getItem(TEMPLATES_CACHE_KEY);
        if (cached) {
          setLocalCache(JSON.parse(cached));
        }
      } catch (error) {
        console.warn("Failed to load templates from cache:", error);
      }
      return;
    }

    // Transform Convex data efficiently
    const transformedTemplates: GigTemplate[] = convexTemplates.map((t) => ({
      id: t._id,
      title: t.title,
      description: t.description,
      date: t.date || "",
      venue: t.venue || "",
      budget: t.budget,
      gigType: t.gigType,
      duration: t.duration,
      setlist: t.setlist,
      icon: t.icon || "✨",
      createdAt: t.createdAt,
      _id: t._id,
    }));

    setLocalCache(transformedTemplates);

    // Cache to localStorage (non-blocking)
    requestAnimationFrame(() => {
      try {
        localStorage.setItem(
          TEMPLATES_CACHE_KEY,
          JSON.stringify(transformedTemplates)
        );
      } catch (error) {
        console.warn("Failed to cache templates:", error);
      }
    });

    setIsLoading(false);
  }, [convexTemplates]);

  // Mutations with proper cleanup
  const saveTemplateMutation = useMutation(
    api.controllers.instantGigs.saveTemplate
  );
  const deleteTemplateMutation = useMutation(
    api.controllers.instantGigs.deleteTemplate
  );

  // Use Convex data with local cache fallback - memoized
  const templates: GigTemplate[] = convexTemplates
    ? convexTemplates.map((t) => ({
        id: t._id,
        title: t.title,
        description: t.description,
        date: t.date || "",
        venue: t.venue || "",
        budget: t.budget,
        gigType: t.gigType,
        duration: t.duration,
        setlist: t.setlist,
        icon: t.icon || "✨",
        createdAt: t.createdAt,
        _id: t._id,
      }))
    : localCache;

  // Optimistic template creation with proper cleanup
  const createTemplate = useCallback(
    async (
      templateData: Omit<GigTemplate, "id" | "status" | "createdAt" | "_id">
    ) => {
      const tempId = `temp_${Date.now()}`;

      // Check if this mutation is already pending
      if (pendingMutations.current.has(tempId)) {
        return;
      }
      pendingMutations.current.add(tempId);

      // Create optimistic template without _id
      const optimisticTemplate: GigTemplate = {
        ...templateData,
        id: tempId,
        createdAt: Date.now(),
      };

      try {
        // 1. Immediate optimistic update
        setLocalCache((prev) => [...prev, optimisticTemplate]);

        // 2. Save to Convex in background
        const realId = await saveTemplateMutation({
          title: templateData.title,
          description: templateData.description,
          date: templateData.date,
          venue: templateData.venue,
          budget: templateData.budget,
          gigType: templateData.gigType,
          duration: templateData.duration,
          setlist: templateData.setlist,
          icon: templateData.icon,
          clientId: userId,
          clientName: "", // Will be filled by backend
        });

        // 3. Replace temp ID with real ID
        setLocalCache((prev) =>
          prev.map((t) =>
            t.id === tempId
              ? ({
                  ...t,
                  id: realId,
                  _id: realId,
                } as GigTemplate)
              : t
          )
        );

        return realId;
      } catch (error) {
        // 4. Rollback on error
        setLocalCache((prev) => prev.filter((t) => t.id !== tempId));
        throw error;
      } finally {
        // Clean up pending mutation
        pendingMutations.current.delete(tempId);
      }
    },
    [saveTemplateMutation, userId]
  );

  // Optimistic template update with proper cleanup
  const updateTemplate = useCallback(
    async (templateId: string, updates: Partial<GigTemplate>) => {
      if (pendingMutations.current.has(templateId)) {
        return;
      }
      pendingMutations.current.add(templateId);

      const templateToUpdate = templates.find((t) => t.id === templateId);
      if (!templateToUpdate) {
        pendingMutations.current.delete(templateId);
        return;
      }

      try {
        // 1. Immediate optimistic update
        setLocalCache((prev) =>
          prev.map((t) => (t.id === templateId ? { ...t, ...updates } : t))
        );

        // 2. Update in Convex in background (only if it's a real Convex template)
        if (templateId.startsWith("[")) {
          await saveTemplateMutation({
            templateId: templateId as Id<"instantGigsTemplate">,
            title: updates.title || templateToUpdate.title,
            description: updates.description || templateToUpdate.description,
            date: updates.date || templateToUpdate.date,
            venue: updates.venue || templateToUpdate.venue,
            budget: updates.budget || templateToUpdate.budget,
            gigType: updates.gigType || templateToUpdate.gigType,
            duration: updates.duration || templateToUpdate.duration,
            setlist: updates.setlist || templateToUpdate.setlist,
            icon: updates.icon || templateToUpdate.icon,
            clientId: userId,
            clientName: "",
          });
        }
      } catch (error) {
        // 3. Rollback on error
        setLocalCache((prev) =>
          prev.map((t) => (t.id === templateId ? templateToUpdate : t))
        );
        throw error;
      } finally {
        pendingMutations.current.delete(templateId);
      }
    },
    [templates, saveTemplateMutation, userId]
  );

  // Optimistic template deletion with proper cleanup
  const deleteTemplate = useCallback(
    async (templateId: string) => {
      if (pendingMutations.current.has(templateId)) {
        return;
      }
      pendingMutations.current.add(templateId);

      const templateToDelete = templates.find((t) => t.id === templateId);
      if (!templateToDelete) {
        pendingMutations.current.delete(templateId);
        return;
      }

      try {
        // 1. Immediate optimistic update
        setLocalCache((prev) => prev.filter((t) => t.id !== templateId));

        // 2. Delete from Convex in background (only if it's a real Convex template)
        if (templateId.startsWith("[")) {
          await deleteTemplateMutation({
            templateId: templateId as Id<"instantGigsTemplate">,
            clientId: userId,
          });
        }
      } catch (error) {
        // 3. Rollback on error
        if (templateToDelete) {
          setLocalCache((prev) => [...prev, templateToDelete]);
        }
        throw error;
      } finally {
        pendingMutations.current.delete(templateId);
      }
    },
    [templates, deleteTemplateMutation, userId]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      pendingMutations.current.clear();
    };
  }, []);

  return {
    templates,
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
};
