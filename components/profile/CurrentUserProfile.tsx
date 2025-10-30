"use client";

import { CircularProgress } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useThemeColors } from "@/hooks/useTheme";
import { experiences, instruments } from "@/data";
import {
  Plus,
  Globe,
  User,
  Lock,
  Music,
  Briefcase,
  Mail,
  X,
  Piano,
  DollarSign,
  Calendar,
  ChevronUp,
  ChevronDown,
  Camera,
  MapPin,
  Phone,
  Building,
  Play,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { SectionContainer } from "./SectionContainer";
import { TextInput } from "./TextInput";
import { SelectInput } from "./SelectInput";
import { ToggleSwitch } from "./ToggleSwitch";
import { ModalActions } from "./ModalActions";
import { Modal } from "./Modal";
import { VideoProfileProps } from "@/types/userTypes";
import VideoProfileComponent from "./VideoProfileComponent";
import {
  getFieldDisplayName,
  validateKenyanPhone,
  ValidationSummary,
} from "./ValidationSummary";
import { VALIDATION_MESSAGES, ValidationError } from "@/types/validation";
import { KenyanPhoneInput } from "./kenyanPhoneInput";
import CurrentUserProfileSkeleton from "../skeletons/ProfileSkeletons";
import { CurrentUserProfileMobileSkeleton } from "../skeletons/ProfileMobileSkeleton";

interface RateProps {
  regular: string;
  function: string;
  concert: string;
  corporate: string;
}

interface SocialHandle {
  platform: string;
  handle: string;
}

const CurrentUserProfile = () => {
  // Authentication and user data
  const { user: userdata } = useUser();
  const { user, isLoading: userLoading } = useCurrentUser();
  const { colors } = useThemeColors();

  // Convex mutations and queries
  const updateUser = useMutation(api.controllers.user.updateUserProfile);

  // Video queries - using the new video database
  const userVideos = useQuery(
    api.controllers.videos.getUserProfileVideos,
    user ? { userId: user.clerkId, currentUserId: user?._id } : "skip"
  );

  const [loading, setLoading] = useState(false);

  // Personal Information
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [rate, setRate] = useState<RateProps>({
    regular: "",
    function: "",
    concert: "",
    corporate: "",
  });

  // Location Information
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  // Talent Information
  const [instrument, setInstrument] = useState("Piano");
  const [experience, setExperience] = useState("noexp");
  const [talentbio, setTalentbio] = useState("");
  const [genre, setGenre] = useState<string[]>([]);
  const [newGenre, setNewGenre] = useState("");
  const [showGenreModal, setShowGenreModal] = useState(false);

  // Date of Birth
  const [age, setAge] = useState("1");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  // Social Media
  const [handles, setHandles] = useState<SocialHandle[]>([]);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [newSocialPlatform, setNewSocialPlatform] = useState("");
  const [newSocialHandle, setNewSocialHandle] = useState("");

  // Account Type
  const [isMusician, setIsMusician] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Client Specific
  const [organization, setOrganization] = useState("");
  const [clienthandles, setClientHandles] = useState("");

  // UI State
  const [showRates, setShowRates] = useState(false);

  // Video Profile State - Now using data from the video database
  const [videos, setVideos] = useState<VideoProfileProps[]>([]);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");

  // Role Type State
  const [roleType, setRoleType] = useState("");
  const [djGenre, setDjGenre] = useState("");
  const [djEquipment, setDjEquipment] = useState("");
  const [mcType, setMcType] = useState("");
  const [mcLanguages, setMcLanguages] = useState("");
  const [vocalistGenre, setVocalistGenre] = useState("");

  const [newVideoPrivacy, setNewVideoPrivacy] = useState<boolean>(true); // Default to public

  // Add this to your state declarations
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );

  // Constants
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const daysOfMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const hasLoadedInitialData = React.useRef(false);

  // Sync videos from database
  useEffect(() => {
    if (userVideos) {
      setVideos(userVideos);
    }
  }, [userVideos]);

  useEffect(() => {
    // Only load data once when user is available and we haven't loaded it yet
    if (user && !userLoading && !hasLoadedInitialData.current) {
      console.log("🔄 Loading initial user data into form");

      setFirstname(user.firstname || "");
      setLastname(user.lastname || "");
      setUsername(user.username || "");
      setEmail(user.email || "");
      setCity(user.city || "");
      setExperience(user.experience || "");
      setInstrument(user.instrument || "");
      setYear(user.year || "");
      setMonth(user.month || "");
      setAge(user.date || "");
      setAddress(user.address || "");
      setPhone(user.phone || "");
      setOrganization(user.organization || "");
      setHandles(user.musicianhandles || []);
      setGenre(user.musiciangenres || []);
      setTalentbio(user.talentbio || "");
      setIsMusician(user.isMusician || false);
      setIsClient(user.isClient || false);
      setClientHandles(user.handles || "");

      // Load role-specific data
      setRoleType(user.roleType || "");
      setDjGenre(user.djGenre || "");
      setDjEquipment(user.djEquipment || "");
      setMcType(user.mcType || "");
      setMcLanguages(user.mcLanguages || "");
      setVocalistGenre(user.vocalistGenre || "");

      // Videos are now handled by the separate video database query above
      // No need to load videos from user.videosProfile anymore

      // Fix for rate object
      const userRate = user.rate || {};
      setRate({
        regular: userRate.regular || "",
        function: userRate.function || "",
        concert: userRate.concert || "",
        corporate: userRate.corporate || "",
      });

      // Mark that we've loaded the initial data
      hasLoadedInitialData.current = true;
    }
  }, [user, userLoading]); // Only depend on user and loading state

  // Role Type Constants
  const roleTypes = [
    { value: "instrumentalist", label: "Instrumentalist" },
    { value: "dj", label: "DJ" },
    { value: "mc", label: "MC" },
    { value: "vocalist", label: "Vocalist" },
  ];

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

  const instrumentsList = instruments().map((ins) => ({
    value: ins.name,
    label: ins.val,
  }));

  // Role-specific form sections
  const InstrumentalistSection = () => (
    <>
      <SelectInput
        label="Primary Instrument"
        value={instrument}
        onChange={setInstrument}
        options={instrumentsList}
      />

      <SelectInput
        label="Experience Level"
        value={experience}
        onChange={setExperience}
        options={experiences().map((ex) => ({
          value: ex.name,
          label: ex.val,
        }))}
      />

      <div className="md:col-span-2">
        <Label className={cn("text-sm font-medium", colors.text)}>
          Music Genres
        </Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {genre.map((g) => (
            <Badge
              key={g}
              variant="outline"
              className={cn(
                "flex items-center gap-1",
                colors.border,
                colors.text
              )}
            >
              {g}
              <button
                onClick={() => removeGenre(g)}
                className="text-red-500 hover:text-red-600"
              >
                <X size={12} />
              </button>
            </Badge>
          ))}
          <button
            onClick={() => setShowGenreModal(true)}
            className={cn(
              "text-amber-500 hover:text-amber-600 text-sm flex items-center",
              colors.text
            )}
          >
            <Plus size={14} className="mr-1" /> Add Genre
          </button>
        </div>
      </div>
    </>
  );

  const DJSection = () => (
    <>
      <SelectInput
        label="DJ Genre"
        value={djGenre}
        onChange={setDjGenre}
        options={djGenres.map((genre) => ({ value: genre, label: genre }))}
      />

      <TextInput
        label="DJ Equipment"
        value={djEquipment}
        onChange={setDjEquipment}
        placeholder="Turntables, Controller, Mixer, etc."
        Icon={<Music size={16} />}
      />

      <div className="md:col-span-2">
        <Label className={cn("text-sm font-medium", colors.text)}>
          Music Genres
        </Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {genre.map((g) => (
            <Badge
              key={g}
              variant="outline"
              className={cn(
                "flex items-center gap-1",
                colors.border,
                colors.text
              )}
            >
              {g}
              <button
                onClick={() => removeGenre(g)}
                className="text-red-500 hover:text-red-600"
              >
                <X size={12} />
              </button>
            </Badge>
          ))}
          <button
            onClick={() => setShowGenreModal(true)}
            className={cn(
              "text-amber-500 hover:text-amber-600 text-sm flex items-center",
              colors.text
            )}
          >
            <Plus size={14} className="mr-1" /> Add Genre
          </button>
        </div>
      </div>
    </>
  );

  const MCSection = () => (
    <>
      <SelectInput
        label="MC Type"
        value={mcType}
        onChange={setMcType}
        options={mcTypes.map((type) => ({ value: type, label: type }))}
      />

      <TextInput
        label="Languages Spoken"
        value={mcLanguages}
        onChange={setMcLanguages}
        placeholder="English, Swahili, French, etc."
        Icon={<Globe size={16} />}
      />

      <div className="md:col-span-2">
        <Label className={cn("text-sm font-medium", colors.text)}>
          Specialties
        </Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {genre.map((g) => (
            <Badge
              key={g}
              variant="outline"
              className={cn(
                "flex items-center gap-1",
                colors.border,
                colors.text
              )}
            >
              {g}
              <button
                onClick={() => removeGenre(g)}
                className="text-red-500 hover:text-red-600"
              >
                <X size={12} />
              </button>
            </Badge>
          ))}
          <button
            onClick={() => setShowGenreModal(true)}
            className={cn(
              "text-amber-500 hover:text-amber-600 text-sm flex items-center",
              colors.text
            )}
          >
            <Plus size={14} className="mr-1" /> Add Specialty
          </button>
        </div>
      </div>
    </>
  );

  const VocalistSection = () => (
    <>
      <SelectInput
        label="Vocal Genre"
        value={vocalistGenre}
        onChange={setVocalistGenre}
        options={vocalistGenres.map((genre) => ({
          value: genre,
          label: genre,
        }))}
      />

      <SelectInput
        label="Experience Level"
        value={experience}
        onChange={setExperience}
        options={experiences().map((ex) => ({
          value: ex.name,
          label: ex.val,
        }))}
      />

      <div className="md:col-span-2">
        <Label className={cn("text-sm font-medium", colors.text)}>
          Music Genres
        </Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {genre.map((g) => (
            <Badge
              key={g}
              variant="outline"
              className={cn(
                "flex items-center gap-1",
                colors.border,
                colors.text
              )}
            >
              {g}
              <button
                onClick={() => removeGenre(g)}
                className="text-red-500 hover:text-red-600"
              >
                <X size={12} />
              </button>
            </Badge>
          ))}
          <button
            onClick={() => setShowGenreModal(true)}
            className={cn(
              "text-amber-500 hover:text-amber-600 text-sm flex items-center",
              colors.text
            )}
          >
            <Plus size={14} className="mr-1" /> Add Genre
          </button>
        </div>
      </div>
    </>
  );

  // Helper function to render role-specific content
  const renderRoleSpecificContent = () => {
    switch (roleType) {
      case "instrumentalist":
        return <InstrumentalistSection />;
      case "dj":
        return <DJSection />;
      case "mc":
        return <MCSection />;
      case "vocalist":
        return <VocalistSection />;
      default:
        return null;
    }
  };

  // Add this helper function
  const scrollToField = (field: string) => {
    const fieldSelectors: Record<string, string> = {
      dateOfBirth: '[data-field="dateOfBirth"]',
      rates: '[data-field="rates"]',
      videos: '[data-field="videos"]',
      firstname: '[data-field="personalInfo"]',
      lastname: '[data-field="personalInfo"]',
      city: '[data-field="location"]',
      talentbio: '[data-field="about"]',
      profile: '[data-field="personalInfo"]',
    };

    const selector = fieldSelectors[field];
    if (selector) {
      const element = document.querySelector(selector);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });

      // Add highlight effect
      element?.classList.add("ring-2", "ring-amber-500");
      setTimeout(() => {
        element?.classList.remove("ring-2", "ring-amber-500");
      }, 2000);
    }
  };

  // FIXED: Enhanced rate validation function
  const isValidRateValue = (value: string): boolean => {
    if (!value || value.trim() === "") return false;

    // Remove any currency symbols, commas, spaces
    let numericValue = value.replace(/[$,£€¥\s]/g, "").toLowerCase();

    // Handle k/K for thousands and m/M for millions
    if (numericValue.includes("k")) {
      numericValue = numericValue.replace("k", "");
      const num = Number(numericValue);
      return !isNaN(num) && num > 0 && num * 1000 > 0;
    }

    if (numericValue.includes("m")) {
      numericValue = numericValue.replace("m", "");
      const num = Number(numericValue);
      return !isNaN(num) && num > 0 && num * 1000000 > 0;
    }

    // Regular number validation
    const num = Number(numericValue);
    return !isNaN(num) && num > 0;
  };

  // Add this function inside your component
  const validateProfile = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (phone && phone.trim() !== "") {
      const phoneValidation = validateKenyanPhone(phone);
      if (!phoneValidation.isValid) {
        errors.push({
          field: "phone",
          message:
            phoneValidation.error || "Please enter a valid Kenyan phone number",
          importance: "medium",
        });
      }
    }

    // Make phone required for musicians
    if (isMusician && (!phone || phone.trim() === "")) {
      errors.push({
        field: "phone",
        message: "Phone number is required for musicians",
        importance: "high",
      });
    }
    if (isMusician) {
      if (!roleType) {
        errors.push({
          field: "roleType",
          message: "Please select your role type",
          importance: "high",
        });
      }
    }

    // Instrument validation only for instrumentalists
    if (roleType === "instrumentalist" && !instrument) {
      errors.push({
        field: "instrument",
        message: "Instrument is required for instrumentalists",
        importance: "high",
      });
    }

    // DJ-specific validations
    if (roleType === "dj" && !djGenre) {
      errors.push({
        field: "djGenre",
        message: "DJ genre is required",
        importance: "high",
      });
    }

    // MC-specific validations
    if (roleType === "mc" && !mcType) {
      errors.push({
        field: "mcType",
        message: "MC type is required",
        importance: "high",
      });
    }

    // Vocalist-specific validations
    if (roleType === "vocalist" && !vocalistGenre) {
      errors.push({
        field: "vocalistGenre",
        message: "Vocal genre is required",
        importance: "high",
      });
    }
    // Validate Date of Birth (for musicians)
    if (isMusician) {
      if (!age || !month || !year) {
        errors.push({
          field: "dateOfBirth",
          message: VALIDATION_MESSAGES.dateOfBirth.required,
          importance: "high",
        });
      } else if (
        isNaN(Number(year)) ||
        Number(year) < 1900 ||
        Number(year) > new Date().getFullYear()
      ) {
        errors.push({
          field: "dateOfBirth",
          message: VALIDATION_MESSAGES.dateOfBirth.invalid,
          importance: "high",
        });
      }
    }

    if (isMusician) {
      const hasValidRates = Object.values(rate).some(isValidRateValue);

      if (!hasValidRates) {
        errors.push({
          field: "rates",
          message: VALIDATION_MESSAGES.rates.required,
          importance: "high",
        });
      }
    }

    // Validate Videos (recommended but not required)
    if (isMusician && videos.length === 0) {
      errors.push({
        field: "videos",
        message: VALIDATION_MESSAGES.videos.recommended,
        importance: "medium",
      });
    }

    // Validate essential profile fields
    const essentialFields = [
      { value: firstname, field: "firstname", name: "First Name" },
      { value: lastname, field: "lastname", name: "Last Name" },
      { value: city, field: "city", name: "City" },
      { value: talentbio, field: "talentbio", name: "Bio" },
    ];

    const missingEssential = essentialFields.filter(
      (field) => !field.value?.trim()
    );
    if (missingEssential.length > 0) {
      errors.push({
        field: "profile",
        message: `Complete your ${missingEssential.map((f) => f.name).join(", ")} to make your profile stand out. ${VALIDATION_MESSAGES.profile.incomplete}`,
        importance: "high",
      });
    }

    return errors;
  };

  const handleUpdate = async () => {
    if (!user) return;

    // Run validation
    const validationErrors = validateProfile();
    const blockingErrors = validationErrors.filter(
      (error) => error.importance === "high"
    );

    // If there are errors, handle them WITHOUT preventing form submission
    if (validationErrors.length > 0) {
      setValidationErrors(validationErrors);

      // Show toast but don't block submission for medium/low importance errors
      if (blockingErrors.length > 0) {
        toast.error(
          `Complete ${blockingErrors.length} required field(s) to save`,
          {
            description: "Scroll up to see what's missing",
            action: {
              label: "View Issues",
              onClick: () => scrollToValidationSummary(),
            },
          }
        );
        scrollToValidationSummary();
        return; // Only return for blocking errors
      } else {
        // For non-blocking errors, show warning but allow save
        toast.warning(
          `Profile can be saved, but ${validationErrors.length} recommendation(s) found`,
          {
            description: "Consider completing these for better results",
            action: {
              label: "View Tips",
              onClick: () => scrollToValidationSummary(),
            },
          }
        );

        // Don't return here - allow the save to proceed
        // Just scroll to show the recommendations
        scrollToValidationSummary();
      }
    }

    // Proceed with saving if no blocking errors
    try {
      setLoading(true);
      const updateData = {
        firstname,
        lastname,
        email,
        username,
        city,
        instrument: roleType === "instrumentalist" ? instrument : "",
        experience,
        date: age,
        month,
        year,
        address,
        phone,
        organization,
        musicianhandles: handles,
        musiciangenres: genre,
        talentbio,
        handles: clienthandles,
        isMusician,
        isClient,
        rate,
        // REMOVED: videosProfile: videos, - Videos are now in separate database
        firstTimeInProfile: false,

        // Role-specific fields
        roleType,
        djGenre: roleType === "dj" ? djGenre : "",
        djEquipment: roleType === "dj" ? djEquipment : "",
        mcType: roleType === "mc" ? mcType : "",
        mcLanguages: roleType === "mc" ? mcLanguages : "",
        vocalistGenre: roleType === "vocalist" ? vocalistGenre : "",
      };

      await updateUser({
        userId: user._id as Id<"users">,
        clerkId: user.clerkId,
        onboardingComplete: true,
        updates: updateData,
      });

      setValidationErrors([]);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Enhanced scroll function with highlight animation
  const scrollToValidationSummary = () => {
    const validationElement = document.getElementById("validation-summary");
    if (validationElement) {
      validationElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });

      // Add highlight animation
      validationElement.animate(
        [
          { backgroundColor: "transparent" },
          {
            backgroundColor: colors.warningBg?.replace("bg-", "") || "#fef3c7",
          },
          { backgroundColor: "transparent" },
        ],
        {
          duration: 2000,
          easing: "ease-in-out",
        }
      );
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Custom confirmation dialog (optional)
  const showConfirmationDialog = (
    errors: ValidationError[]
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      // You can use a custom modal here instead of window.confirm
      const shouldContinue = window.confirm(
        `💡 Profile Recommendations\n\n` +
          `Your profile can be saved, but we recommend:\n\n` +
          `${errors.map((error) => `• ${getFieldDisplayName(error.field)}`).join("\n")}\n\n` +
          `These improvements can help you get more bookings.\n` +
          `Save anyway?`
      );
      resolve(shouldContinue);
    });
  };

  // Add this scroll function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Video handlers - Now these are handled by the VideoProfileComponent
  // which directly interacts with the video database

  // Social media handlers
  const addSocialHandle = () => {
    if (newSocialPlatform && newSocialHandle) {
      setHandles([
        ...handles,
        { platform: newSocialPlatform, handle: newSocialHandle },
      ]);
      setNewSocialPlatform("");
      setNewSocialHandle("");
      setShowSocialModal(false);
    }
  };

  const removeSocialHandle = (index: number) => {
    const updatedHandles = [...handles];
    updatedHandles.splice(index, 1);
    setHandles(updatedHandles);
  };

  // Genre handlers
  const addGenre = () => {
    if (newGenre && !genre.includes(newGenre)) {
      setGenre([...genre, newGenre]);
      setNewGenre("");
      setShowGenreModal(false);
    }
  };

  // ADD THIS FUNCTION - IT WAS MISSING:
  const removeGenre = (genreToRemove: string) => {
    setGenre(genre.filter((g) => g !== genreToRemove));
  };

  // Account type toggle
  const toggleAccountType = (type: "musician" | "client") => {
    if (type === "musician") {
      setIsMusician(true);
      setIsClient(false);
    } else {
      setIsMusician(false);
      setIsClient(true);
    }
  };

  // In your component:
  if (userLoading || !user) {
    return (
      <>
        <div className="lg:hidden">
          <CurrentUserProfileMobileSkeleton colors={colors} />
        </div>
        <div className="hidden lg:block">
          <CurrentUserProfileSkeleton colors={colors} />
        </div>
      </>
    );
  }

  return (
    <div className={cn("min-h-screen w-full py-8", colors.background)}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "rounded-2xl border p-8 mb-8 bg-gradient-to-br from-amber-500/5 to-purple-500/5",
            colors.card,
            colors.border
          )}
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-6 mb-6 md:mb-0">
              <div className="relative">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-amber-400/30"
                  />
                ) : (
                  <div
                    className={cn(
                      "w-24 h-24 rounded-full flex items-center justify-center border-4 border-amber-400/30",
                      colors.secondaryBackground
                    )}
                  >
                    <User size={32} className={colors.textMuted} />
                  </div>
                )}
                <button className="absolute -bottom-2 -right-2 bg-amber-500 p-2 rounded-full hover:bg-amber-600 transition-colors">
                  <Camera size={16} className="text-white" />
                </button>
              </div>
              <div>
                <h1 className={cn("text-3xl font-bold mb-2", colors.text)}>
                  {firstname} {lastname}
                </h1>
                <p
                  className={cn(
                    "flex items-center gap-2 mb-3",
                    colors.textMuted
                  )}
                >
                  <Globe size={16} /> @{username}
                </p>
                <div className="flex gap-2">
                  <Badge
                    className={cn(
                      "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                    )}
                  >
                    {isMusician ? "Musician" : isClient ? "Client" : "Member"}
                  </Badge>
                  {user.tier === "pro" && (
                    <Badge
                      variant="secondary"
                      className="bg-purple-500 text-white"
                    >
                      PRO
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Link href={`/profile/${username}`}>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                View Public Profile
              </Button>
            </Link>
          </div>
        </motion.div>
        <ValidationSummary
          errors={validationErrors}
          onFieldClick={scrollToField}
        />
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            {
              label: "Followers",
              value: user.followers?.length || 0,
              icon: <User size={16} />,
            },
            {
              label: "Following",
              value: user.followings?.length || 0,
              icon: <User size={16} />,
            },
            {
              label: "Reviews",
              value: user.allreviews?.length || 0,
              icon: <Briefcase size={16} />,
            },
            {
              label: isMusician ? "Videos" : "Gigs",
              value: isMusician
                ? videos.length || 0 // Now using the videos state which syncs with database
                : user.monthlyGigsPosted || 0,
              icon: isMusician ? <Music size={16} /> : <Briefcase size={16} />,
            },
          ].map((stat, index) => (
            <div
              key={index}
              className={cn(
                "rounded-xl p-4 text-center border transition-all hover:scale-105",
                colors.card,
                colors.border
              )}
            >
              <div
                className={cn(
                  "p-2 rounded-lg bg-gradient-to-br from-amber-500/10 to-purple-500/10 mx-auto w-12 mb-2"
                )}
              >
                {stat.icon}
              </div>
              <p className={cn("text-2xl font-bold mb-1", colors.text)}>
                {stat.value}
              </p>
              <p className={cn("text-sm", colors.textMuted)}>{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Videos Section */}
            {isMusician && user && (
              <SectionContainer
                icon={<Music size={18} />}
                title="Video Profile"
                data-field="videos"
              >
                <VideoProfileComponent
                  videos={videos}
                  onAddVideo={(newVideo: VideoProfileProps) => {
                    setVideos((prev) => [...prev, newVideo]);
                  }}
                  onRemoveVideo={(videoId: string) => {
                    setVideos((prev) =>
                      prev.filter((video) => video._id !== videoId)
                    );
                  }}
                  onUpdateVideo={(
                    videoId: string,
                    updates: Partial<VideoProfileProps>
                  ) => {
                    setVideos((prev) =>
                      prev.map((video) =>
                        video._id === videoId ? { ...video, ...updates } : video
                      )
                    );
                  }}
                  loading={loading}
                  user={user}
                />
              </SectionContainer>
            )}

            {/* About Section */}
            <SectionContainer
              icon={<User size={18} />}
              title="About"
              data-field="about"
            >
              <Textarea
                value={talentbio}
                onChange={(e) => setTalentbio(e.target.value)}
                placeholder="Tell us about yourself, your skills, and your experience..."
                className={cn(
                  "min-h-[120px] resize-none",
                  colors.background,
                  colors.border,
                  colors.text,
                  "focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                )}
              />
            </SectionContainer>

            {/* Experience Section */}
            <SectionContainer
              icon={<Briefcase size={18} />}
              title="Experience & Skills"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isMusician && (
                  <>
                    {/* Role Type Selection */}
                    <SelectInput
                      label="Role Type"
                      value={roleType}
                      onChange={setRoleType}
                      options={roleTypes}
                    />

                    {/* Role-Specific Content */}
                    {renderRoleSpecificContent()}
                  </>
                )}

                {isClient && (
                  <div className="md:col-span-2">
                    <TextInput
                      label="Organization"
                      value={organization}
                      onChange={setOrganization}
                      Icon={<Building size={16} />}
                      placeholder="Your company or organization name"
                    />
                  </div>
                )}
              </div>
            </SectionContainer>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Personal Information */}
            <SectionContainer
              icon={<User size={18} />}
              title="Personal Information"
              data-field="personalInfo"
            >
              <div className="space-y-4">
                <TextInput
                  label="First Name"
                  value={firstname}
                  onChange={setFirstname}
                  disabled
                />
                <TextInput
                  label="Last Name"
                  value={lastname}
                  onChange={setLastname}
                  disabled
                />
                <TextInput
                  label="Username"
                  value={username}
                  onChange={setUsername}
                  disabled
                />

                {isMusician && (
                  <div data-field="dateOfBirth">
                    <Label className={cn("text-sm font-medium", colors.text)}>
                      Date of Birth
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <SelectInput
                        value={age}
                        onChange={setAge}
                        options={daysOfMonth.map((day) => ({
                          value: day.toString(),
                          label: day.toString(),
                        }))}
                        className="w-1/3"
                      />
                      <SelectInput
                        value={month}
                        onChange={setMonth}
                        options={months.map((m) => ({
                          value: m.toLowerCase(),
                          label: m.slice(0, 3),
                        }))}
                        className="w-1/3"
                      />
                      <Input
                        type="text"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        placeholder="Year"
                        className={cn(
                          "w-1/3",
                          colors.background,
                          colors.border,
                          colors.text
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>
            </SectionContainer>

            {/* Contact Information */}
            <SectionContainer
              icon={<Mail size={18} />}
              title="Contact Information"
            >
              <div className="space-y-4">
                <TextInput
                  label="Email"
                  value={email}
                  onChange={setEmail}
                  disabled
                  Icon={<Mail size={16} />}
                />

                {/* Replace the existing phone input with Kenyan phone input */}
                <KenyanPhoneInput
                  value={phone}
                  onChange={setPhone}
                  label="Phone Number"
                  required={isMusician} // Required for musicians, optional for clients
                />
              </div>
            </SectionContainer>

            {/* Rates Section (Musicians only) */}
            {isMusician && (
              <SectionContainer
                icon={<DollarSign size={18} />}
                title="Performance Rates"
                data-field="rates"
                action={
                  <button onClick={() => setShowRates(!showRates)}>
                    {showRates ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </button>
                }
                onClickHeader={() => setShowRates(!showRates)}
              >
                {showRates && (
                  <div className="space-y-4">
                    <TextInput
                      label="Regular Gigs"
                      value={rate.regular}
                      onChange={(value) =>
                        setRate((prev) => ({
                          ...prev,
                          regular: value ?? "",
                        }))
                      }
                      Icon={<Music size={16} />}
                      placeholder="Rate for regular performances"
                    />
                    <TextInput
                      label="Corporate Events"
                      value={rate.corporate}
                      onChange={(value) =>
                        setRate((prev) => ({
                          ...prev,
                          corporate: value ?? "",
                        }))
                      }
                      Icon={<Building size={16} />}
                      placeholder="Rate for corporate events"
                    />
                    <TextInput
                      label="Concerts"
                      value={rate.concert}
                      onChange={(value) =>
                        setRate((prev) => ({
                          ...prev,
                          concert: value ?? "",
                        }))
                      }
                      Icon={<Calendar size={16} />}
                      placeholder="Rate for concerts"
                    />
                    <TextInput
                      label="Special Functions"
                      value={rate.function}
                      onChange={(value) =>
                        setRate((prev) => ({
                          ...prev,
                          function: value ?? "",
                        }))
                      }
                      Icon={<Briefcase size={16} />}
                      placeholder="Rate for special functions"
                    />
                  </div>
                )}
              </SectionContainer>
            )}

            {/* Location Information */}
            <SectionContainer
              icon={<MapPin size={18} />}
              title="Location"
              data-field="location"
            >
              <div className="space-y-4">
                <TextInput
                  label="City"
                  value={city}
                  onChange={setCity}
                  Icon={<MapPin size={16} />}
                />
                <TextInput
                  label="Address"
                  value={address}
                  onChange={setAddress}
                  placeholder="Your full address"
                />
              </div>
            </SectionContainer>

            {/* Social Media */}
            <SectionContainer icon={<Globe size={18} />} title="Social Media">
              <div className="space-y-3">
                {handles.map((handle, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-sm font-medium capitalize",
                          colors.text
                        )}
                      >
                        {handle.platform}:
                      </span>
                      <span className={cn("text-sm", colors.text)}>
                        {handle.handle}
                      </span>
                    </div>
                    <button
                      onClick={() => removeSocialHandle(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setShowSocialModal(true)}
                  className={cn(
                    "text-amber-500 hover:text-amber-600 text-sm flex items-center",
                    colors.text
                  )}
                >
                  <Plus size={14} className="mr-1" /> Add Social Media
                </button>
              </div>
            </SectionContainer>

            {/* Account Type */}
            <SectionContainer
              icon={<Lock size={18} />}
              title="Account Type"
              className={"pt-6 pb-[52px]"}
            >
              <div className="space-y-4 ">
                <ToggleSwitch
                  label="Musician Account"
                  checked={isMusician}
                  onChange={() => toggleAccountType("musician")}
                />
                <ToggleSwitch
                  label="Client Account"
                  checked={isClient}
                  onChange={() => toggleAccountType("client")}
                />
              </div>
              {/* Save Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-end mt-8"
              >
                <Button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 font-semibold"
                >
                  {loading ? (
                    <CircularProgress size={20} style={{ color: "white" }} />
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </motion.div>
            </SectionContainer>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showSocialModal}
        onClose={() => setShowSocialModal(false)}
        title="Add Social Media"
      >
        <div className="space-y-4">
          <TextInput
            label="Platform"
            value={newSocialPlatform}
            onChange={setNewSocialPlatform}
            placeholder="Instagram, Twitter, YouTube, etc."
          />
          <TextInput
            label="Username/Handle"
            value={newSocialHandle}
            onChange={setNewSocialHandle}
            placeholder="Your username on this platform"
          />
        </div>
        <ModalActions
          onCancel={() => setShowSocialModal(false)}
          onConfirm={addSocialHandle}
          confirmText="Add Platform"
        />
      </Modal>

      <Modal
        isOpen={showGenreModal}
        onClose={() => setShowGenreModal(false)}
        title="Add Music Genre"
      >
        <TextInput
          label="Genre"
          value={newGenre}
          onChange={setNewGenre}
          placeholder="Rock, Jazz, Hip-Hop, Classical, etc."
        />
        <ModalActions
          onCancel={() => setShowGenreModal(false)}
          onConfirm={addGenre}
          confirmText="Add Genre"
        />
      </Modal>

      {/* Remove the old video modal since it's now handled by VideoProfileComponent */}
    </div>
  );
};

export default CurrentUserProfile;
