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
      isMusician: true,
      isClient: false,
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
      tier: "free",
      nextBillingDate: Date.now(),
      monthlyGigsPosted: 0,
      monthlyMessages: 0,
      monthlyGigsBooked: 0,
      gigsBookedThisWeek: { count: 0, weekStart: Date.now() },
      lastBookingDate: Date.now(),
      earnings: 0,
      totalSpent: 0,
      firstLogin: true,
      onboardingComplete: false,
      lastActive: Date.now(),
      isBanned: false,
      banReason: "",
      bannedAt: undefined,
      lastAdminAction: Date.now(),
      theme: "lightMode",
    };

    return await updateUserAsMusician({ clerkId: userId, updates });
  };

  const registerAsClient = async (clientData: {
    city: string;
    organization: string;
    talentbio: string;
  }) => {
    if (!userId) throw new Error("No user ID available");

    const updates = {
      isMusician: false,
      isClient: true,
      city: clientData.city,
      organization: clientData.organization,
      talentbio: clientData.talentbio,
      tier: "free",
      nextBillingDate: Date.now(),
      monthlyGigsPosted: 0,
      monthlyMessages: 0,
      monthlyGigsBooked: 0,
      gigsBookedThisWeek: { count: 0, weekStart: Date.now() },
      lastBookingDate: Date.now(),
      earnings: 0,
      totalSpent: 0,
      firstLogin: true,
      onboardingComplete: false,
      lastActive: Date.now(),
      isBanned: false,
      banReason: "",
      bannedAt: undefined,
      lastAdminAction: Date.now(),
      theme: "lightMode",
    };

    return await updateUserAsClient({ clerkId: userId, updates });
  };

  const registerAsAdmin = async (adminData: {
    adminCity: string;
    adminRole: string;
  }) => {
    if (!userId) throw new Error("No user ID available");

    const updates = {
      isAdmin: true,
      adminCity: adminData.adminCity,
      adminRole: adminData.adminRole,
      tier: "pro",
    };

    return await updateUserAsAdmin({ clerkId: userId, updates });
  };

  return {
    registerAsMusician,
    registerAsClient,
    registerAsAdmin,
  };
}
