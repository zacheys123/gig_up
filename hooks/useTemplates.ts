// hooks/useTemplates.ts - FIX TYPE ISSUES
import { useMutation, useQuery } from "convex/react";
import { useState, useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { GigTemplate } from "@/convex/instantGigsTypes";

export const useTemplates = (userId: Id<"users">) => {
  const [localCache, setLocalCache] = useState<GigTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from Convex (source of truth)
  const convexTemplates = useQuery(
    api.controllers.instantGigs.getClientTemplates,
    {
      clientId: userId,
    }
  );

  // Initialize and cache
  useEffect(() => {
    if (convexTemplates) {
      const transformedTemplates: GigTemplate[] = convexTemplates.map((t) => ({
        id: t._id, // Use _id as id for frontend
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
        _id: t._id, // Keep the Convex ID
      }));

      setLocalCache(transformedTemplates);
      localStorage.setItem(
        "instant_gig_templates_cache",
        JSON.stringify(transformedTemplates)
      );
      setIsLoading(false);
    }
  }, [convexTemplates]);

  // Mutations
  const saveTemplateMutation = useMutation(
    api.controllers.instantGigs.saveTemplate
  );
  const deleteTemplateMutation = useMutation(
    api.controllers.instantGigs.deleteTemplate
  );

  // Use Convex data with local cache fallback
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

  // Optimistic template creation
  const createTemplate = async (
    templateData: Omit<GigTemplate, "id" | "status" | "createdAt" | "_id">
  ) => {
    const tempId = `temp_${Date.now()}`;

    // Create optimistic template without _id
    const optimisticTemplate: GigTemplate = {
      ...templateData,
      id: tempId,

      createdAt: Date.now(),
      // No _id field for optimistic templates
    };

    // 1. Immediate optimistic update
    setLocalCache((prev) => [...prev, optimisticTemplate]);

    try {
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

      // QUICK FIX - Use type assertions
      // 3. Replace temp ID with real ID
      setLocalCache((prev) =>
        prev.map((t) =>
          t.id === tempId
            ? ({
                ...t,
                id: realId,
                _id: realId,
              } as GigTemplate) // Type assertion
            : t
        )
      );

      return realId;
    } catch (error) {
      // 4. Rollback on error
      setLocalCache((prev) => prev.filter((t) => t.id !== tempId));
      throw error;
    }
  };

  // Optimistic template update
  const updateTemplate = async (
    templateId: string,
    updates: Partial<GigTemplate>
  ) => {
    const templateToUpdate = templates.find((t) => t.id === templateId);
    if (!templateToUpdate) return;

    // 1. Immediate optimistic update
    setLocalCache((prev) =>
      prev.map((t) => (t.id === templateId ? { ...t, ...updates } : t))
    );

    try {
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
          clientName: "", // Backend will handle this
        });
      }
    } catch (error) {
      // 3. Rollback on error
      setLocalCache((prev) =>
        prev.map((t) => (t.id === templateId ? templateToUpdate : t))
      );
      throw error;
    }
  };

  // Optimistic template deletion
  const deleteTemplate = async (templateId: string) => {
    const templateToDelete = templates.find((t) => t.id === templateId);
    if (!templateToDelete) return;

    // 1. Immediate optimistic update
    setLocalCache((prev) => prev.filter((t) => t.id !== templateId));

    try {
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
    }
  };

  return {
    templates,
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
};
