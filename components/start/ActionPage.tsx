"use client";

import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { motion, AnimatePresence } from "framer-motion";
import {
  Music,
  Users,
  Briefcase,
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  MapPin,
  Disc3,
  Radio,
  Guitar,
  Mic,
  Star,
  Zap,
  X,
  Award,
  Tag,
  PenTool,
  Briefcase as BriefcaseIcon,
  Headphones,
  Globe,
  BookOpen,
} from "lucide-react";
import { HiSwitchHorizontal } from "react-icons/hi";
import { useUser } from "@clerk/nextjs";
import { experiences, instruments } from "@/data";
import { useUserMutations } from "@/hooks/useUserMutation";
import { useFeatureFlags } from "@/hooks/useFeatureFlag";
import { cn } from "@/lib/utils";
import { ManualConfetti } from "./ManualConfetti";
import { SimpleSkillsInput } from "./SimpleSkills";

// ============ CONSTANTS ============
const djGenres = [
  "Hip Hop", "House", "Techno", "EDM", "R&B", "Afrobeats", 
  "Reggae", "Dancehall", "Pop", "Electronic", "Mix"
];

const mcTypes = [
  "Event Host", "Wedding MC", "Corporate MC", "Club MC", 
  "Concert Host", "Radio Host", "Mix"
];

const vocalistGenres = [
  "Pop", "R&B", "Jazz", "Soul", "Gospel", "Rock", 
  "Classical", "Opera", "Afrobeats", "Reggae", "Mix"
];

const teacherSpecializations = [
  "Beginner Lessons", "Advanced Techniques", "Music Theory", 
  "Ear Training", "Sight Reading", "Improvisation", 
  "Performance Skills", "Exam Preparation", "Online Lessons", 
  "Group Classes"
];

const teachingStyles = [
  "Structured Curriculum", "Student-Led", "Performance Focused",
  "Theory Intensive", "Casual/Recreational", "Exam Preparation",
  "Jazz/Improvisation", "Classical Training"
];

const lessonFormats = [
  "One-on-One Private", "Group Classes", "Online Lessons",
  "In-Person Only", "Hybrid", "Workshops", "Masterclasses"
];

const studentAgeGroups = [
  "Children (5-12)", "Teenagers (13-17)", "Adults (18+)",
  "All Ages", "Seniors (65+)"
];

const bookerSkillsList = [
  "Band Management", "Event Coordination", "Talent Booking",
  "Artist Management", "Event Production", "Venue Management",
  "Contract Negotiation", "Tour Management", "Public Relations"
];

const clientTypes = ["individual", "event_planner", "venue", "corporate"];
const bookerTypes = ["talent_agent", "booking_manager"];

type RoleType = "instrumentalist" | "dj" | "mc" | "vocalist" | "teacher";

// ============ ANIMATION VARIANTS ============
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.1 }
  }
};

// ============ STEP CONFIGURATION ============
const stepIcons: Record<string, any> = {
  city: MapPin,
  instrument: Guitar,
  skills: Tag,
  experience: Award,
  bio: PenTool,
  genre: Disc3,
  equipment: Headphones,
  type: Mic,
  languages: Globe,
  specialization: GraduationCap,
  teaching: BookOpen,
  studentAge: Users,
  organization: BriefcaseIcon,
  clientType: Users,
  bookerType: Briefcase,
  bookerSkills: Star,
  vocalistgenre: Mic,
};

const stepTitles: Record<string, string> = {
  city: "Location",
  instrument: "Primary Instrument",
  skills: "Your Skills",
  experience: "Experience Level",
  bio: "About You",
  genre: "DJ Genre",
  equipment: "DJ Equipment",
  type: "MC Type",
  languages: "Languages",
  specialization: "Teaching Specialization",
  teaching: "Teaching Style",
  studentAge: "Student Age Group",
  organization: "Organization",
  clientType: "Client Type",
  bookerType: "Booker Type",
  bookerSkills: "Booker Skills",
  vocalistgenre: "Vocal Genre",
};

// ============ MAIN COMPONENT ============
const ActionPage = () => {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const { user: myuser } = useCurrentUser();
  const { registerAsMusician, registerAsClient, registerAsBooker } = useUserMutations();
  const { isTeacherEnabled, isBookerEnabled, isBothEnabled } = useFeatureFlags();

  const teacherEnabled = isTeacherEnabled();
  const bookerEnabled = isBookerEnabled();
  const bothEnabled = isBothEnabled();

  // ============ STATE ============
  const [loading, setLoading] = useState({ musician: false, client: false, booker: false });
  const [showMoreInfo, setMoreInfo] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [formData, setFormData] = useState({
    city: "",
    instrument: "",
    experience: "",
    organization: "",
    talentbio: "",
    djGenre: "",
    djEquipment: "",
    mcType: "",
    mcLanguages: "",
    vocalistGenre: "",
    teacherSpecialization: "",
    teachingStyle: "",
    lessonFormat: "",
    studentAgeGroup: "",
    clientType: "",
    bookerType: "",
    skills: [] as string[],
  });

  const [selectedBookerSkills, setSelectedBookerSkills] = useState<string[]>([]);
  const [error, setError] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<"musician" | "client" | "booker" | "both" | null>(null);
  const [roleType, setRoleType] = useState<RoleType>("instrumentalist");
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  // ============ HELPERS ============
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error.length) setError([]);
  };

  const handleSkillsChange = (skills: string[]) => {
    setFormData(prev => ({ ...prev, skills }));
    if (error.length) setError([]);
  };

  const toggleBookerSkill = (skill: string) => {
    setSelectedBookerSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
    if (error.length) setError([]);
  };

  // ============ STEP MANAGEMENT ============
  const getSteps = () => {
    const steps: Record<string, string[]> = {
      instrumentalist: ["city", "instrument", "skills", "experience", "bio"],
      dj: ["city", "genre", "equipment", "skills", "experience", "bio"],
      mc: ["city", "type", "languages", "skills", "experience", "bio"],
      vocalist: ["city", "vocalistgenre", "skills", "experience", "bio"],
      teacher: ["city", "instrument", "specialization", "teaching", "studentAge", "skills", "experience", "bio"],
      booker: ["city", "organization", "bookerType", "bookerSkills", "skills", "experience", "bio"],
      client: ["city", "organization", "clientType", "bio"],
    };

    if (!selectedRole) return [];
    if (selectedRole === "musician") return steps[roleType] || ["city", "skills", "bio"];
    if (selectedRole === "client") return steps.client;
    return steps.booker;
  };

  // ============ PROGRESS CALCULATION ============
  useEffect(() => {
    if (!selectedRole) return;
    
    let requiredFields: number;
    let total: number;

    if (selectedRole === "musician") {
      requiredFields = [
        formData.city,
        roleType === "instrumentalist" ? formData.instrument : true,
        roleType === "dj" ? formData.djGenre && formData.djEquipment : true,
        roleType === "vocalist" ? formData.vocalistGenre : true,
        roleType === "mc" ? formData.mcType && formData.mcLanguages : true,
        roleType === "teacher" ? formData.teacherSpecialization && formData.teachingStyle && formData.lessonFormat && formData.studentAgeGroup : true,
        formData.experience,
        formData.talentbio,
        formData.skills.length > 0
      ].filter(Boolean).length;
      total = 7;
    } else if (selectedRole === "client") {
      requiredFields = [
        formData.city,
        formData.organization,
        formData.clientType,
        formData.talentbio
      ].filter(Boolean).length;
      total = 4;
    } else {
      requiredFields = [
        formData.city,
        formData.organization,
        formData.bookerType,
        formData.experience,
        selectedBookerSkills.length > 0,
        formData.talentbio,
        formData.skills.length > 0
      ].filter(Boolean).length;
      total = 7;
    }

    setProgress(Math.min((requiredFields / total) * 100, 100));
  }, [formData, selectedRole, roleType, selectedBookerSkills]);

  // ============ VALIDATION ============
  const validateMusicianFields = useCallback(() => {
    const errors: string[] = [];
    if (!formData.city) errors.push("City is required");
    if (roleType === "instrumentalist" && !formData.instrument) errors.push("Instrument is required");
    if (roleType === "teacher" && !formData.instrument) errors.push("Instrument you teach is required");
    if (!formData.experience) errors.push("Experience is required");
    if (roleType === "dj" && (!formData.djGenre || !formData.djEquipment)) errors.push("DJ Genre and Equipment are required");
    if (roleType === "vocalist" && !formData.vocalistGenre) errors.push("Vocal genre is required");
    if (roleType === "mc" && (!formData.mcType || !formData.mcLanguages)) errors.push("MC type and languages are required");
    if (roleType === "teacher" && (!formData.teacherSpecialization || !formData.teachingStyle || !formData.lessonFormat || !formData.studentAgeGroup))
      errors.push("All teacher fields are required");
    if (!formData.talentbio) errors.push("Bio is required");
    if (formData.skills.length === 0) errors.push("Add at least one skill");
    if (formData.talentbio.length > 500) errors.push("Bio is too long (max 500 characters)");
    return errors;
  }, [formData, roleType]);

  const validateClientFields = useCallback(() => {
    const errors: string[] = [];
    if (!formData.city) errors.push("City is required");
    if (!formData.organization) errors.push("Organization is required");
    if (!formData.clientType) errors.push("Client type is required");
    if (!formData.talentbio) errors.push("Bio is required");
    return errors;
  }, [formData]);

  const validateBookerFields = useCallback(() => {
    const errors: string[] = [];
    if (!formData.city) errors.push("City is required");
    if (!formData.organization) errors.push("Company/Organization is required");
    if (!formData.bookerType) errors.push("Booker type is required");
    if (!formData.experience) errors.push("Experience level is required");
    if (selectedBookerSkills.length === 0) errors.push("At least one booker skill is required");
    if (!formData.talentbio) errors.push("Bio is required");
    if (formData.skills.length === 0) errors.push("Add at least one skill");
    if (formData.talentbio.length > 500) errors.push("Bio is too long (max 500 characters)");
    return errors;
  }, [formData, selectedBookerSkills]);

  // ============ REGISTRATION ============
  const registerUser = useCallback(async (role: "musician" | "client" | "booker") => {
    if (!isSignedIn) {
      toast.error("Please sign in to continue");
      return false;
    }

    const errors = role === "musician" ? validateMusicianFields() :
                   role === "client" ? validateClientFields() :
                   validateBookerFields();

    if (errors.length > 0) {
      setError(errors);
      return false;
    }

    setLoading(prev => ({ ...prev, [role]: true }));

    try {
      if (role === "musician") {
        await registerAsMusician({
          city: formData.city,
          instrument: formData.instrument,
          experience: formData.experience,
          roleType,
          djGenre: formData.djGenre,
          djEquipment: formData.djEquipment,
          mcType: formData.mcType,
          mcLanguages: formData.mcLanguages,
          talentbio: formData.talentbio,
          vocalistGenre: formData.vocalistGenre,
          organization: formData.organization || "",
          teacherSpecialization: formData.teacherSpecialization,
          teachingStyle: formData.teachingStyle,
          lessonFormat: formData.lessonFormat,
          studentAgeGroup: formData.studentAgeGroup,
          skills: formData.skills,
        });
      } else if (role === "client") {
        await registerAsClient({
          city: formData.city,
          organization: formData.organization,
          talentbio: formData.talentbio,
          clientType: formData.clientType,
        });
      } else if (role === "booker") {
        await registerAsBooker({
          city: formData.city,
          organization: formData.organization,
          experience: formData.experience,
          bookerSkills: selectedBookerSkills,
          talentbio: formData.talentbio,
          bookerType: formData.bookerType,
          skills: formData.skills,
        });
      }

      setShowConfetti(true);
      toast.success("Registration completed successfully!");
      
      setTimeout(() => {
        setShowConfetti(false);
        router.push("/dashboard");
      }, 3000);
      
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Registration failed. Please try again.");
      return false;
    } finally {
      setLoading(prev => ({ ...prev, [role]: false }));
    }
  }, [isSignedIn, validateMusicianFields, validateClientFields, validateBookerFields, formData, roleType, selectedBookerSkills, registerAsMusician, registerAsClient, registerAsBooker, router]);

  // ============ ROLE CARD CONFIG ============
  const roleCards = [
    {
      role: "client",
      title: "Hire Talent",
      icon: Users,
      gradient: "from-orange-500 to-amber-500",
      description: "Create gigs and book top-tier performers",
      stats: "500+ active",
      enabled: true,
      isUser: myuser?.isClient,
    },
    {
      role: "musician",
      title: "Find Gigs",
      icon: Music,
      gradient: "from-blue-500 to-cyan-500",
      description: "Showcase your talent and connect with opportunities",
      stats: "2,000+ musicians",
      enabled: true,
      isUser: myuser?.isMusician,
    },
    {
      role: "booker",
      title: "Manage Talent",
      icon: Briefcase,
      gradient: "from-emerald-500 to-teal-500",
      description: "Book and manage bands, build your roster",
      stats: "100+ bookers",
      enabled: bookerEnabled,
      isUser: myuser?.isBooker,
    },
    {
      role: "both",
      title: "Dual Role",
      icon: HiSwitchHorizontal,
      gradient: "from-purple-500 to-pink-500",
      description: "Switch between hiring and being hired",
      stats: "Coming Soon",
      enabled: bothEnabled,
      isUser: myuser?.isBoth,
      comingSoon: true,
    },
  ].filter(card => card.enabled);

  // ============ RENDER ============
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1120] to-[#0A0F1C]">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-transparent" />
      <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Confetti */}
      <ManualConfetti active={showConfetti} duration={3000} pieceCount={150} />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 md:mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4 md:mb-6 shadow-2xl shadow-blue-500/20"
            >
              <Zap className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </motion.div>
            
            <motion.h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                gigUp
              </span>
            </motion.h1>
            
            <motion.p className="text-base md:text-xl text-gray-400 max-w-2xl mx-auto px-4">
              Join the future of music collaboration and event booking
            </motion.p>
          </motion.div>

          {/* Role Cards */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 px-2 md:px-0"
          >
            {roleCards.map((card) => (
              <motion.div
                key={card.role}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                onClick={() => {
                  if (card.comingSoon) {
                    toast.info("Dual role coming soon!");
                  } else if (card.isUser) {
                    setMoreInfo(true);
                  } else {
                    setSelectedRole(card.role as any);
                    setCurrentStep(0);
                    setMoreInfo(true);
                  }
                }}
                className={cn(
                  "group relative cursor-pointer",
                  card.isUser && "opacity-50 cursor-not-allowed",
                  card.comingSoon && "opacity-60"
                )}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl`} />
                <div className={`relative bg-[#151F2E] border border-gray-800 rounded-2xl p-4 md:p-6 hover:border-${card.gradient.split(' ')[1]}/50 transition-all`}>
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-r ${card.gradient} flex items-center justify-center mb-3 md:mb-4`}>
                    <card.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2">{card.title}</h3>
                  <p className="text-xs md:text-sm text-gray-400 mb-3 md:mb-4">{card.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="flex -space-x-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-[#151F2E]" />
                      ))}
                    </div>
                    <span>{card.stats}</span>
                  </div>
                  {card.isUser && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                  )}
                  {card.comingSoon && (
                    <span className="absolute top-3 right-3 px-2 py-1 text-xs bg-gray-800 text-gray-400 rounded-full">
                      Soon
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Registration Modal */}
          <AnimatePresence>
            {showMoreInfo && selectedRole && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                onClick={() => setMoreInfo(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-2xl bg-[#0F172A] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden"
                >
                  {/* Modal Header */}
                  <div className={cn(
                    "p-4 md:p-6 relative overflow-hidden",
                    selectedRole === "client" && "bg-gradient-to-r from-orange-500/20 via-orange-500/5 to-transparent",
                    selectedRole === "musician" && "bg-gradient-to-r from-blue-500/20 via-blue-500/5 to-transparent",
                    selectedRole === "booker" && "bg-gradient-to-r from-emerald-500/20 via-emerald-500/5 to-transparent",
                  )}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold text-white">Complete Your Profile</h2>
                        <p className="text-sm text-gray-400 mt-1">
                          {selectedRole === "musician" && "Showcase your musical talent"}
                          {selectedRole === "client" && "Tell us about your organization"}
                          {selectedRole === "booker" && "Set up your booking services"}
                        </p>
                      </div>
                      <button onClick={() => setMoreInfo(false)} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700">
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Profile Completion</span>
                        <span className="text-white font-medium">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          className={cn(
                            "h-full rounded-full",
                            selectedRole === "client" && "bg-gradient-to-r from-orange-500 to-amber-500",
                            selectedRole === "musician" && "bg-gradient-to-r from-blue-500 to-cyan-500",
                            selectedRole === "booker" && "bg-gradient-to-r from-emerald-500 to-teal-500"
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>

                    {/* Step Indicator */}
                    <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
                      {getSteps().map((step, index) => {
                        const Icon = stepIcons[step] || ChevronRight;
                        return (
                          <div key={index} className="flex items-center flex-shrink-0">
                            <div className={cn(
                              "flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs",
                              index < currentStep ? "bg-blue-500/20 text-blue-400" :
                              index === currentStep ? "bg-gray-800 text-white" : "text-gray-600"
                            )}>
                              <Icon className="w-3 h-3" />
                              <span className="hidden sm:inline">{stepTitles[step] || step}</span>
                            </div>
                            {index < getSteps().length - 1 && (
                              <ChevronRight className="w-3 h-3 text-gray-700 mx-1" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Modal Content - All your input fields remain the same */}
                  <div className="p-4 md:p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        {/* All your step content remains exactly the same */}
                        {/* ... (keep all the input fields from your original) */}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-4 md:p-6 border-t border-gray-800 bg-gray-900/50">
                    {error.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                      >
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            {error.map((err, index) => (
                              <p key={index} className="text-xs text-red-400">• {err}</p>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => currentStep > 0 ? setCurrentStep(prev => prev - 1) : setMoreInfo(false)}
                        className="flex-1 py-3 px-4 rounded-xl font-medium bg-gray-800 text-white hover:bg-gray-700 flex items-center justify-center gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        {currentStep === 0 ? "Cancel" : "Back"}
                      </button>

                      <button
                        onClick={() => {
                          if (currentStep === getSteps().length - 1) {
                            registerUser(selectedRole as any);
                          } else {
                            setCurrentStep(prev => prev + 1);
                          }
                        }}
                        disabled={loading.musician || loading.client || loading.booker}
                        className={cn(
                          "flex-1 py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2",
                          selectedRole === "client" && "bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:opacity-90",
                          selectedRole === "musician" && "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90",
                          selectedRole === "booker" && "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        {loading.musician || loading.client || loading.booker ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Processing...
                          </>
                        ) : currentStep === getSteps().length - 1 ? (
                          <>
                            Complete
                            <CheckCircle className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            Next
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 md:mt-20 text-center"
          >
            <p className="text-xs md:text-sm text-gray-700 font-mono">
              © 2024 gigUp • v2.0 • The Future of Music Collaboration
            </p>
          </motion.div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1F2937; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4B5563; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6B7280; }
      `}</style>
    </div>
  );
};

export default ActionPage;