// hooks/useUserMutations.ts
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";

export function useUserMutations() {
  const { userId } = useAuth();

  const updateUserAsMusician = useMutation(
    api.controllers.user.updateUserAsMusician
  );
  const updateUserAsClient = useMutation(
    api.controllers.user.updateUserAsClient
  );
  const updateUserAsAdmin = useMutation(api.controllers.user.updateUserAsAdmin);
  // hooks/useUserMutations.ts
  // hooks/useUserMutations.ts
  const registerAsMusician = async (musicianData: {
    city: string;
    instrument?: string;
    experience: string;
    roleType: string;
    djGenre?: string;
    djEquipment?: string;
    mcType?: string;
    mcLanguages?: string;
    talentbio: string;
    vocalistGenre?: string;
    organization?: string;
  }) => {
    if (!userId) throw new Error("No user ID available");

    const updates = {
      isMusician: true as const,
      isClient: false as const,
      city: musicianData.city,
      instrument: musicianData.instrument,
      experience: musicianData.experience,
      roleType: musicianData.roleType,
      djGenre: musicianData.djGenre,
      djEquipment: musicianData.djEquipment,
      mcType: musicianData.mcType,
      mcLanguages: musicianData.mcLanguages,
      talentbio: musicianData.talentbio,
      vocalistGenre: musicianData.vocalistGenre,
      organization: musicianData.organization,
      tier: "free" as const,
      nextBillingDate: Date.now(),
      monthlyGigsPosted: 0,
      monthlyMessages: 0,
      monthlyGigsBooked: 0,
      gigsBookedThisWeek: { count: 0, weekStart: Date.now() },
      lastBookingDate: Date.now(),
      earnings: 0,
      totalSpent: 0,
      firstLogin: true as const,
      onboardingComplete: false as const,
      lastActive: Date.now(),
      isBanned: false as const,
      banReason: "",
      bannedAt: undefined,
      lastAdminAction: Date.now(),
      theme: "lightMode" as const,
      // REMOVE THESE - they're not in the mutation schema and have default values anyway
      // allreviews: [],
      // myreviews: [],
      // videosProfile: [],
    };

    return await updateUserAsMusician({ clerkId: userId, updates });
  };

  // hooks/useUserMutations.ts
  const registerAsClient = async (clientData: {
    city: string;
    organization: string;
    talentbio: string;
  }) => {
    if (!userId) throw new Error("No user ID available");

    const updates = {
      isMusician: false as const,
      isClient: true as const,
      city: clientData.city,
      organization: clientData.organization,
      talentbio: clientData.talentbio,
      tier: "free" as const,
      nextBillingDate: Date.now(),
      monthlyGigsPosted: 0,
      monthlyMessages: 0,
      monthlyGigsBooked: 0,
      gigsBookedThisWeek: { count: 0, weekStart: Date.now() },
      lastBookingDate: Date.now(),
      earnings: 0,
      totalSpent: 0,
      firstLogin: true as const,
      onboardingComplete: false as const,
      lastActive: Date.now(),
      isBanned: false as const,
      banReason: "",
      bannedAt: undefined,
      lastAdminAction: Date.now(),
      theme: "lightMode" as const,
      // REMOVE array fields here too
    };

    return await updateUserAsClient({ clerkId: userId, updates });
  };

  const registerAsAdmin = async (adminData: {
    adminCity: string;
    adminRole: "super" | "content" | "support" | "analytics";
  }) => {
    if (!userId) throw new Error("No user ID available");

    const updates = {
      isAdmin: true as const,
      adminCity: adminData.adminCity,
      adminRole: adminData.adminRole,
      tier: "pro" as const,
    };

    return await updateUserAsAdmin({ clerkId: userId, updates });
  };

  return {
    registerAsMusician,
    registerAsClient,
    registerAsAdmin,
  };
}
