// hooks/useAISuggestions.ts
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "../../hooks/useCurrentUser";
interface AISuggestionsResponse {
  questions: string[];
  version: string;
  isLoading: boolean;
}

export function useAISuggestions(): AISuggestionsResponse {
  const { user } = useCurrentUser();

  const userRole = user?.isMusician
    ? "musician"
    : user?.isClient
      ? "client"
      : "guest";

  const suggestions = useQuery(api.controllers.subscription.getAiSuggestions, {
    userRole,
  });

  return {
    questions: suggestions?.questions || [],
    version: suggestions?.version || "default",
    isLoading: suggestions === undefined,
  };
}
