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
  const updateUserAsBooker = useMutation(
    api.controllers.user.updateUserAsBooker
  );

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
    // Teacher specific fields (when roleType === 'teacher')
    teacherSpecialization?: string;
    teachingStyle?: string;
    lessonFormat?: string;
    studentAgeGroup?: string;
  }) => {
    if (!userId) throw new Error("No user ID available");

    const updates = {
      isMusician: true as const,
      isClient: false as const,
      isBooker: false as const,
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
      // Teacher fields - only store if roleType is teacher
      teacherSpecialization:
        musicianData.roleType === "teacher"
          ? musicianData.teacherSpecialization
          : undefined,
      teachingStyle:
        musicianData.roleType === "teacher"
          ? musicianData.teachingStyle
          : undefined,
      lessonFormat:
        musicianData.roleType === "teacher"
          ? musicianData.lessonFormat
          : undefined,
      studentAgeGroup:
        musicianData.roleType === "teacher"
          ? musicianData.studentAgeGroup
          : undefined,
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
      theme: "light" as const,
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
      isMusician: false as const,
      isClient: true as const,
      isBooker: false as const,
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
      theme: "light" as const,
    };

    return await updateUserAsClient({ clerkId: userId, updates });
  };

  const registerAsBooker = async (bookerData: {
    city: string;
    organization: string;
    experience: string;
    bookerSkills: string[];
    talentbio: string;
  }) => {
    if (!userId) throw new Error("No user ID available");

    const updates = {
      isMusician: false as const,
      isClient: false as const,
      isBooker: true as const,
      city: bookerData.city,
      organization: bookerData.organization,
      experience: bookerData.experience,
      bookerSkills: bookerData.bookerSkills,
      talentbio: bookerData.talentbio,
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
      theme: "light" as const,
    };

    return await updateUserAsBooker({ clerkId: userId, updates });
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
    registerAsBooker,
    registerAsAdmin,
  };
}
