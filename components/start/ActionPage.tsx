"use client";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";

import { motion, AnimatePresence } from "framer-motion";
import { MusicIcon, Settings, UsersIcon, Briefcase } from "lucide-react";
import { HiSwitchHorizontal } from "react-icons/hi";
import { IoArrowBack } from "react-icons/io5";
import { useUser } from "@clerk/nextjs";
import { experiences, instruments } from "@/data";

import { useUserMutations } from "@/hooks/useUserMutation";
import { Modal } from "../modals/Modal";

// Add the arrays at the top of the file
const djGenres = [
  "Hip Hop",
  "House",
  "Techno",
  "EDM",
  "R&B",
  "Afrobeats",
  "Reggae",
  "Dancehall",
  "Pop",
  "Electronic",
  "mix",
];

const mcTypes = [
  "Event Host",
  "Wedding MC",
  "Corporate MC",
  "Club MC",
  "Concert Host",
  "Radio Host",
  "mix",
];

const vocalistGenres = [
  "Pop",
  "R&B",
  "Jazz",
  "Soul",
  "Gospel",
  "Rock",
  "Classical",
  "Opera",
  "Afrobeats",
  "Reggae",
  "mix",
];

const bookerSkillsList = [
  "Band Management",
  "Event Coordination",
  "Talent Booking",
  "Artist Management",
  "Event Production",
  "Venue Management",
];

type Error = string[];
type RoleSteps = {
  instrumentalist: string[];
  dj: string[];
  mc: string[];
  vocalist: string[];
  booker: string[];
  client: string[];
  default: string[];
};

type RoleType = keyof Omit<RoleSteps, "default">;

const ActionPage = () => {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const [musicianload, setMusicianLoad] = useState(false);
  const [clientload, setClientLoad] = useState(false);
  const [bookerload, setBookerLoad] = useState(false); // NEW: Booker loading state
  const [userload, setUserload] = useState(false);
  const { user: myuser } = useCurrentUser();
  const {
    registerAsMusician,
    registerAsClient,
    registerAsBooker,
    registerAsAdmin,
  } = useUserMutations(); // UPDATED: Added registerAsBooker

  const [showMoreInfo, setMoreInfo] = useState(false);
  const [city, setCity] = useState("");
  const [instrument, setInstrument] = useState("");
  const [experience, setExperience] = useState("");
  const [error, setError] = useState<Error>([]);

  // UPDATED: Three separate roles
  const [selectedRole, setSelectedRole] = useState<
    "musician" | "client" | "booker" | "both" | null
  >(null);

  const [roleType, setRoleType] = useState<RoleType>("instrumentalist");
  const [djGenre, setDjGenre] = useState("");
  const [vocalistGenre, setVocalistGenre] = useState("");
  const [djEquipment, setDjEquipment] = useState("");
  const [mcType, setMcType] = useState("");
  const [mcLanguages, setMcLanguages] = useState("");
  const [talentbio, setTalentbio] = useState("");
  const [organization, setOrganization] = useState("");
  const [selectedBookerSkills, setSelectedBookerSkills] = useState<string[]>(
    []
  );

  // UPDATED: Separate validation for each role
  const validateMusicianFields = useCallback(() => {
    const errors: string[] = [];
    if (!city) errors.push("City is required");
    if (roleType === "instrumentalist" && !instrument)
      errors.push("Instrument is required");
    if (!experience) errors.push("Experience is required");
    if (roleType === "dj" && (!djGenre || !djEquipment))
      errors.push("DJ Genre and Equipment are required");
    if (roleType === "vocalist" && !vocalistGenre)
      errors.push("Vocal genre is required");
    if (roleType === "mc" && (!mcType || !mcLanguages))
      errors.push("MC type and languages are required");
    if (!talentbio) errors.push("Bio is required");
    if (talentbio.length > 200)
      errors.push("Bio is too long (max 200 characters)");
    return errors;
  }, [
    city,
    instrument,
    experience,
    roleType,
    djGenre,
    djEquipment,
    mcType,
    mcLanguages,
    talentbio,
    vocalistGenre,
  ]);

  const validateClientFields = useCallback(() => {
    const errors: string[] = [];
    if (!city) errors.push("City is required");
    if (!organization) errors.push("Organization is required");
    if (!talentbio) errors.push("Bio is required");
    return errors;
  }, [city, organization, talentbio]);

  // NEW: Booker validation
  const validateBookerFields = useCallback(() => {
    const errors: string[] = [];
    if (!city) errors.push("City is required");
    if (!organization) errors.push("Company/Organization is required");
    if (!experience) errors.push("Experience level is required");
    if (selectedBookerSkills.length === 0)
      errors.push("At least one booker skill is required");
    if (!talentbio) errors.push("Bio is required");
    if (talentbio.length > 200)
      errors.push("Bio is too long (max 200 characters)");
    return errors;
  }, [city, organization, experience, selectedBookerSkills, talentbio]);

  // UPDATED: Registration function for all three roles
  const registerUser = useCallback(
    async (role: "musician" | "client" | "booker") => {
      if (!isSignedIn) {
        console.error("Not signed in");
        return false;
      }

      const errors =
        role === "musician"
          ? validateMusicianFields()
          : role === "client"
            ? validateClientFields()
            : validateBookerFields();

      if (errors.length > 0) {
        setError(errors);
        return false;
      }

      try {
        if (role === "musician") {
          await registerAsMusician({
            city,
            instrument,
            experience,
            roleType,
            djGenre,
            djEquipment,
            mcType,
            mcLanguages,
            talentbio,
            vocalistGenre,
            organization: organization || "",
          });
        } else if (role === "client") {
          await registerAsClient({
            city,
            organization,
            talentbio,
          });
        } else if (role === "booker") {
          // NEW: Booker registration
          await registerAsBooker({
            city,
            organization,
            experience,
            bookerSkills: selectedBookerSkills,
            talentbio,
          });
        }

        return true;
      } catch (err) {
        console.error(err);
        toast.error("Registration failed");
        return false;
      }
    },
    [
      isSignedIn,
      validateMusicianFields,
      validateClientFields,
      validateBookerFields,
      city,
      instrument,
      experience,
      roleType,
      djGenre,
      djEquipment,
      mcType,
      mcLanguages,
      talentbio,
      vocalistGenre,
      organization,
      selectedBookerSkills,
      registerAsMusician,
      registerAsClient,
      registerAsBooker, // NEW
    ]
  );

  const [modal, setModal] = useState(false);
  type AdminRole = "super" | "content" | "support" | "analytics";
  const [adminRole, setAdminRoles] = useState<AdminRole | null>(null);
  const [adminCity, setAdminCity] = useState("");
  const [adminLoad, setAdminLoad] = useState(false);

  const connectAsAdmin = useCallback(async () => {
    setAdminLoad(true);
    const errors: string[] = [];
    if (!adminCity) errors.push("Your City is required");
    if (!adminRole) errors.push("Admin Role is required");

    if (errors.length > 0) {
      setError(errors);
      setAdminLoad(false);
      return;
    }

    try {
      await registerAsAdmin({
        adminCity,
        adminRole: adminRole!,
      });

      setModal(false);
      toast.success("Successfully Registered you as Admin");
      router.push("/admin/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Registration failed");
    } finally {
      setAdminLoad(false);
    }
  }, [router, adminCity, adminRole, registerAsAdmin]);

  // UPDATED: Separate connection functions for each role
  const connectAsMusician = useCallback(async () => {
    setMusicianLoad(true);
    try {
      const success = await registerUser("musician");
      if (success) {
        setMoreInfo(false);
        toast.success(
          `${
            roleType === "instrumentalist"
              ? "Successfully Registered as an Instrumentalist"
              : roleType === "dj"
                ? "Successfully Registered as a DJ"
                : roleType === "mc"
                  ? "Successfully Registered as an MC"
                  : roleType === "vocalist"
                    ? "Successfully Registered as a Vocalist"
                    : ""
          }`
        );
        router.push("/dashboard");
      }
    } finally {
      setMusicianLoad(false);
    }
  }, [registerUser, router, roleType]);

  const connectAsClient = useCallback(async () => {
    setClientLoad(true);
    try {
      const success = await registerUser("client");
      if (success) {
        toast.success("Successfully Registered as Client!");
        router.push("/dashboard");
      }
    } finally {
      setClientLoad(false);
    }
  }, [registerUser, router]);

  // NEW: Booker connection function
  const connectAsBooker = useCallback(async () => {
    setBookerLoad(true);
    try {
      const success = await registerUser("booker");
      if (success) {
        toast.success("Successfully Registered as Booker/Manager!");
        router.push("/dashboard");
      }
    } finally {
      setBookerLoad(false);
    }
  }, [registerUser, router]);

  useEffect(() => {
    const timer = setTimeout(() => setUserload(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (error.length > 0) {
      const timer = setTimeout(() => setError([]), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // UPDATED: Role selection handler for three roles
  const handleRoleSelection = useCallback(
    (role: "musician" | "client" | "booker" | "both") => {
      if (
        myuser?.isMusician ||
        myuser?.isClient ||
        myuser?.isBooker ||
        myuser?.isBoth
      ) {
        setMoreInfo(true);
        return;
      }
      setSelectedRole(role);
      setMoreInfo(true);
    },
    [myuser]
  );

  const handleModal = () => {
    setModal(true);
  };
  const handleOnClose = () => {
    setModal(false);
  };

  const [currentStep, setCurrentStep] = useState(0);

  const baseStyles = `
  relative overflow-hidden rounded-xl border border-transparent
  transition-all duration-300 hover:shadow-xl
`;

  const accentStyles = {
    orange: "hover:border-orange-500/30 hover:shadow-orange-500/10",
    cyan: "hover:border-blue-500/30 hover:shadow-blue-500/10",
    emerald: "hover:border-emerald-500/30 hover:shadow-emerald-500/10",
    default: "hover:border-gray-500/30",
  };

  const toggleBookerSkill = (skill: string) => {
    setSelectedBookerSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const renderAdminModal = () => {
    return (
      <Modal
        isOpen={modal}
        onClose={handleOnClose}
        title="Welcome to Admin Portal"
        description="Register as Admin"
        dep="admin"
      >
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Your City"
            value={adminCity}
            onChange={(e) => setAdminCity(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-[12px] text-white"
          />
          <select
            value={adminRole || ""}
            onChange={(e) => {
              const value = e.target.value;
              if (
                value === "super" ||
                value === "content" ||
                value === "support" ||
                value === "analytics"
              ) {
                setAdminRoles(value);
              } else {
                setAdminRoles(null);
              }
            }}
            className="w-full p-2 rounded bg-gray-700 text-[12px] text-white"
          >
            <option value="" className="text-neutral-300" disabled>
              Select Admin Role
            </option>
            <option value="super">Super</option>
            <option value="content">Content</option>
            <option value="support">Support</option>
            <option value="analytics">Analytics</option>
          </select>
          {error.length > 0 && (
            <div className="mt-4 text-red-400 text-sm">
              {error.map((err, index) => (
                <div key={index}>{err}</div>
              ))}
            </div>
          )}
          <button
            onClick={connectAsAdmin}
            className="w-[80%] mx-auto py-2 bg-amber-700 rounded hover:bg-orange-600 text-white text-[13px]"
            disabled={adminLoad || !adminRole || !adminCity}
          >
            {adminLoad ? "Processing..." : "Complete Registration"}
          </button>
        </div>
      </Modal>
    );
  };

  // UPDATED: More Information Modal with three role flows
  const renderMoreInfoModal = () => {
    const roleSteps: RoleSteps = {
      instrumentalist: ["city", "instrument", "experience", "talentbio"],
      dj: ["city", "genre", "equipment", "experience", "talentbio"],
      mc: ["city", "type", "languages", "experience", "talentbio"],
      vocalist: ["city", "vocalistgenre", "experience", "talentbio"],
      booker: [
        "city",
        "organization",
        "bookerSkills",
        "experience",
        "talentbio",
      ],
      client: ["city", "organization", "talentbio"],
      default: ["city", "talentbio"],
    };

    // Determine steps based on selected role
    const steps =
      selectedRole === "musician"
        ? roleSteps[roleType] || roleSteps.default
        : selectedRole === "client"
          ? roleSteps.client
          : roleSteps.booker;

    const handleNext = () => setCurrentStep((prev) => prev + 1);
    const handleBack = () => setCurrentStep((prev) => prev - 1);

    if (!myuser) {
      return (
        <div className="h-full w-full bg-black">
          <span className="flex flex-col items-center justify-center">
            Loading...
          </span>
        </div>
      );
    }

    const getFinalAction = () => {
      if (selectedRole === "musician") return connectAsMusician;
      if (selectedRole === "client") return connectAsClient;
      if (selectedRole === "booker") return connectAsBooker;
      return () => {};
    };

    const getButtonText = () => {
      if (musicianload || clientload || bookerload) return "Processing...";
      if (currentStep === steps.length - 1) return "Complete Registration";
      return "Next";
    };

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            {currentStep > 0 && (
              <button onClick={handleBack} className="text-orange-400">
                <IoArrowBack />
              </button>
            )}
            <h3 className="text-orange-400 font-bold">
              Step {currentStep + 1}/{steps.length}
            </h3>
            <div className="w-8"></div> {/* Spacer */}
          </div>

          {/* Current Step Content */}
          <div className="mb-6 space-y-4">
            {steps[currentStep] === "city" && (
              <input
                type="text"
                placeholder="Your City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-[12px] text-white"
              />
            )}

            {steps[currentStep] === "organization" &&
              (selectedRole === "client" || selectedRole === "booker") && (
                <input
                  type="text"
                  placeholder={
                    selectedRole === "booker"
                      ? "Your Company/Organization Name"
                      : "Enter Your Organization/Company Name"
                  }
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full p-2 rounded bg-gray-700 text-[12px] text-white"
                />
              )}

            {/* Role Type Selection (Musicians only) */}
            {selectedRole === "musician" && steps[currentStep] === "city" && (
              <div className="mt-4">
                <label className="block text-sm text-neutral-300 mb-2">
                  What do you do?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    ["instrumentalist", "dj", "mc", "vocalist"] as RoleType[]
                  ).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setRoleType(role)}
                      className={`p-2 rounded border text-white text-[11px] ${
                        roleType === role
                          ? "border-orange-500 bg-orange-500/20"
                          : "border-gray-600 hover:bg-gray-700"
                      }`}
                    >
                      {role === "instrumentalist" && "Instrumentalist"}
                      {role === "dj" && "DJ"}
                      {role === "mc" && "MC/Host"}
                      {role === "vocalist" && "Vocalist"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {steps[currentStep] === "instrument" && (
              <select
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-[12px] text-white"
              >
                <option value="">Select Instrument</option>
                {instruments().map((inst) => (
                  <option key={inst.id} value={inst.name}>
                    {inst.val}
                  </option>
                ))}
              </select>
            )}

            {steps[currentStep] === "genre" && (
              <select
                value={djGenre}
                onChange={(e) => setDjGenre(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-[12px] text-white"
              >
                <option value="">Select DJ Genre</option>
                {djGenres.map((genre) => (
                  <option key={genre} value={genre.toLowerCase()}>
                    {genre}
                  </option>
                ))}
              </select>
            )}

            {steps[currentStep] === "vocalistgenre" && (
              <select
                value={vocalistGenre}
                onChange={(e) => setVocalistGenre(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-[12px] text-white"
              >
                <option value="">Select Genre</option>
                {vocalistGenres.map((genre) => (
                  <option key={genre} value={genre.toLowerCase()}>
                    {genre}
                  </option>
                ))}
              </select>
            )}

            {steps[currentStep] === "equipment" && (
              <input
                type="text"
                placeholder="DJ Equipment (e.g. Pioneer CDJs)"
                value={djEquipment}
                onChange={(e) => setDjEquipment(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-[12px] text-white"
              />
            )}

            {steps[currentStep] === "type" && (
              <select
                value={mcType}
                onChange={(e) => setMcType(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-[12px] text-white"
              >
                <option value="">Select MC Type</option>
                {mcTypes.map((type) => (
                  <option
                    key={type}
                    value={type.toLowerCase().replace(/\s+/g, "")}
                  >
                    {type}
                  </option>
                ))}
              </select>
            )}

            {steps[currentStep] === "languages" && (
              <input
                type="text"
                placeholder="Languages spoken (comma separated)"
                value={mcLanguages}
                onChange={(e) => setMcLanguages(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-[12px] text-white"
              />
            )}

            {steps[currentStep] === "bookerSkills" && (
              <div className="space-y-3">
                <label className="block text-sm text-neutral-300 mb-2">
                  Select your booker skills
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                  {bookerSkillsList.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleBookerSkill(skill)}
                      className={`p-2 rounded border text-left text-[12px] transition-colors ${
                        selectedBookerSkills.includes(skill)
                          ? "border-blue-500 bg-blue-500/20 text-white"
                          : "border-gray-600 text-neutral-300 hover:bg-gray-700"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
                {selectedBookerSkills.length > 0 && (
                  <div className="text-xs text-neutral-400 mt-2">
                    Selected: {selectedBookerSkills.join(", ")}
                  </div>
                )}
              </div>
            )}

            {steps[currentStep] === "experience" && (
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-[12px] text-white"
              >
                <option value="">Select Experience Level</option>
                {experiences().map((exp) => (
                  <option key={exp.id} value={exp.name}>
                    {exp.val}
                  </option>
                ))}
              </select>
            )}

            {steps[currentStep] === "talentbio" && (
              <div className="space-y-2">
                <textarea
                  placeholder={
                    selectedRole === "booker"
                      ? "Describe your booking services and experience..."
                      : selectedRole === "client"
                        ? "Tell us about your organization and what you're looking for..."
                        : "Brief description of your style/skills"
                  }
                  value={talentbio}
                  onChange={(e) => setTalentbio(e.target.value)}
                  rows={3}
                  className="w-full p-2 rounded bg-gray-700 text-[12px] text-white"
                  name="talentbio"
                />
                <div className="text-xs text-neutral-400 text-right">
                  {talentbio.length}/200
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <button
            onClick={
              currentStep === steps.length - 1 ? getFinalAction() : handleNext
            }
            className="w-full py-2 bg-orange-500 rounded hover:bg-orange-600 text-white text-[13px] transition-colors"
            disabled={musicianload || clientload || bookerload}
          >
            {getButtonText()}
          </button>

          {error.length > 0 && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded">
              <div className="text-red-400 text-sm space-y-1">
                {error.map((err, index) => (
                  <div key={index}>• {err}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-[#050505] px-4 py-16 overflow-hidden">
      {/* Holographic grid background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')]"></div>
      </div>

      {/* Animated border elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-orange-400/30 to-transparent"></div>
        <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-blue-400/30 to-transparent"></div>
      </div>

      <AnimatePresence>
        {showMoreInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            {renderMoreInfoModal()}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            {renderAdminModal()}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        {/* Header with animated underline */}
        <div className="mb-16 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-6xl font-medium tracking-tight text-white"
          >
            <span className="relative inline-block">
              Welcome to
              <span className="absolute -bottom-2 left-0 h-0.5 w-full bg-gradient-to-r from-orange-400 to-amber-500"></span>
            </span>
            <br />
            <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
              gigUp
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-6 text-sm uppercase tracking-[0.3em] text-neutral-400"
          >
            The Future of Creative Collaboration
          </motion.p>
        </div>

        {/* UPDATED: Role cards with three distinct roles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {[
            {
              role: "client",
              title: "Hire Talent",
              accent: "orange",
              description:
                "Create gigs and book top-tier musicians, DJs, and performers",
              buttonText: "Join as Client",
              disabled: !!myuser?.isClient,
              onClick: () => handleRoleSelection("client"),
            },
            {
              role: "musician",
              title: "Find Gigs",
              accent: "blue",
              description:
                "Showcase your talent and connect with premium opportunities",
              buttonText: "Join as Talent",
              disabled: !!myuser?.isMusician,
              onClick: () => handleRoleSelection("musician"),
            },
            {
              role: "booker", // NEW: Separate booker card
              title: "Manage Talent",
              accent: "emerald",
              description:
                "Book and manage bands, coordinate events, build your roster",
              buttonText: "Join as Booker",
              disabled: !!myuser?.isBooker,
              onClick: () => handleRoleSelection("booker"),
            },
            {
              role: "both", // NEW: Separate booker card
              title: "Be a Client and Talent(Coming Soon)",
              accent: "emerald",
              description:
                "Book and manage bands, coordinate events, build your roster",
              buttonText: "Join as Dual User",
              disabled: true,
              onClick: () => handleRoleSelection("both"),
            },
            ...(isAdminEmail(user?.emailAddresses[0]?.emailAddress)
              ? [
                  {
                    role: "admin",
                    title: "Admin Role",
                    accent: "emerald",
                    description: "Register as Admin",
                    buttonText: "Admin Registration",
                    onClick: () => handleModal(),
                    disabled: false,
                  },
                ]
              : []),
          ].map((card) => (
            <div
              key={card.role}
              className={`
              ${baseStyles} 
              ${card.disabled ? "opacity-80" : "hover:-translate-y-1"} 
              ${
                accentStyles[card.accent as keyof typeof accentStyles] ||
                accentStyles.default
              }
            `}
              onClick={!card.disabled ? card.onClick : undefined}
            >
              {/* Gradient border effect */}
              <div
                className={`
        absolute inset-0 bg-gradient-to-br rounded-xl
        ${
          card.accent === "orange"
            ? "from-orange-500/20 to-amber-600/10"
            : card.accent === "blue"
              ? "from-blue-500/20 to-cyan-600/10"
              : card.accent === "emerald"
                ? "from-emerald-500/20 to-emerald-600/10"
                : "from-gray-700/20 to-gray-800/10"
        }
      `}
              ></div>

              {/* Card content */}
              <div className="relative flex h-full flex-col bg-neutral-900/80 backdrop-blur-sm p-6">
                {/* Accent indicator */}
                <div
                  className={`
          absolute -left-1 top-6 h-8 w-1 rounded-full
          ${
            card.accent === "orange"
              ? "bg-orange-500"
              : card.accent === "blue"
                ? "bg-blue-500"
                : card.accent === "emerald"
                  ? "bg-emerald-500"
                  : "bg-gray-600"
          }
        `}
                ></div>

                {/* Card header */}
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-medium text-white">
                    {card.title}
                  </h3>
                  <div
                    className={`
            rounded-full p-2
            ${
              card.accent === "orange"
                ? "bg-orange-500/10 text-orange-400"
                : card.accent === "blue"
                  ? "bg-blue-500/10 text-blue-400"
                  : card.accent === "emerald"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-gray-600/10 text-gray-400"
            }
          `}
                  >
                    {card.accent === "orange" ? (
                      <UsersIcon className="h-5 w-5" />
                    ) : card.accent === "blue" ? (
                      <MusicIcon className="h-5 w-5" />
                    ) : card.accent === "emerald" ? (
                      <Briefcase className="h-5 w-5" />
                    ) : (
                      <HiSwitchHorizontal className="h-5 w-5" />
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="mt-3 text-sm text-neutral-400">
                  {card.description}
                </p>

                {/* Spacer */}
                <div className="flex-grow"></div>

                {/* Button */}
                {userload && (
                  <button
                    onClick={card.onClick}
                    disabled={card.disabled}
                    className={`
            mt-6 w-full rounded-lg py-2.5 text-sm font-medium transition-all
            ${
              card.disabled
                ? "cursor-not-allowed bg-neutral-800 text-neutral-500"
                : card.accent === "orange"
                  ? "bg-orange-600 text-white hover:bg-orange-700"
                  : card.accent === "blue"
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : card.accent === "emerald"
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-neutral-800 text-neutral-400"
            }
          `}
                  >
                    {card.buttonText}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Futuristic footer */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-2">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-orange-400"></div>
            <p className="text-xs font-mono tracking-widest text-neutral-500">
              GIGUP v2.0 • {new Date().getFullYear()}
            </p>
            <div className="h-px w-8 bg-gradient-to-r from-blue-400 to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionPage;

function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;

  // Get the whitelist from environment variables
  const whitelist = process.env.ADMIN_EMAILS?.split(",") || [];

  // In development, you might want to allow all emails or have a different behavior
  if (process.env.NODE_ENV === "development") {
    // Option 1: Allow any email in development
    // return true;

    // Option 2: Use a development-specific whitelist
    const devWhitelist = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",") || [];
    return devWhitelist.includes(email.trim().toLowerCase());

    // Option 3: Fall back to production whitelist if no dev whitelist
    // const effectiveWhitelist = devWhitelist.length > 0 ? devWhitelist : whitelist;
    // return effectiveWhitelist.includes(email.trim().toLowerCase());
  }

  // In production, use the strict whitelist
  return whitelist.includes(email.trim().toLowerCase());
}
