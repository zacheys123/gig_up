// hooks/useTrendingMusicians.ts
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { UserProps } from "@/types/userTypes";

export const useTrendingMusicians = () => {
  const musicians = useQuery(api.controllers.user.getTrendingMusicians) as
    | UserProps[]
    | undefined;
  return musicians || [];
};
