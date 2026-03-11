// hooks/useUserMutations.ts
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";

type ClientType = "individual" | "event_planner" | "venue" | "corporate";
type BookerType = "talent_agent" | "booking_manager";

export function useUserMutations() {
  const { userId } = useAuth();

  const updateUserAsMusician = useMutation(
    api.controllers.user.updateUserAsMusician
  );
  const updateUserAsClient = useMutation(
    api.controllers.user.updateUserAsClient
  );

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
    teacherSpecialization?: string;
    teachingStyle?: string;
    lessonFormat?: string;
    studentAgeGroup?: string;
    skills: string[];
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
      skills: musicianData.skills,
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
      firstLogin: true,
      onboardingComplete: false,
      lastActive: Date.now(),
      isBanned: false,
      banReason: "",
      lastAdminAction: Date.now(),
      theme: "light" as const,
    };

    return await updateUserAsMusician({ clerkId: userId, updates });
  };

  const registerAsClient = async (clientData: {
    city: string;
    organization: string;
    talentbio: string;
    clientType: string;
    skills?: string[]; // Make skills optional
  }) => {
    if (!userId) throw new Error("No user ID available");
    const validClientType = clientData.clientType as ClientType;

    const updates = {
      isMusician: false,
      isClient: true,
      city: clientData.city,
      organization: clientData.organization,
      talentbio: clientData.talentbio,
      clientType: validClientType,
      // Only include skills if they exist
      ...(clientData.skills && clientData.skills.length > 0 ? { skills: clientData.skills } : {}),
      tier: "free" as const,
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
    bookerType: string;
    skills: string[];
  }) => {
    if (!userId) throw new Error("No user ID available");
    const validBookerType = bookerData.bookerType as BookerType;

    const updates = {
      isMusician: false,
      isClient: false,
      isBooker: true,
      city: bookerData.city,
      organization: bookerData.organization,
      experience: bookerData.experience,
      bookerSkills: bookerData.bookerSkills,
      talentbio: bookerData.talentbio,
      bookerType: validBookerType,
      skills: bookerData.skills,
      tier: "free" as const,      nextBillingDate: Date.now(),
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
      lastAdminAction: Date.now(),
      theme: "light" as const,
    };

    return await updateUserAsBooker({ clerkId: userId, updates });
  };

  return {
    registerAsMusician,
    registerAsClient,
    registerAsBooker,
  };
}