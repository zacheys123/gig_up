// In CurrentUserProfile component - replace the entire file with:

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
  Users,
  Star,
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

// Booker-specific constants
const bookerSkillsList = [
  "Band Management",
  "Event Coordination",
  "Talent Booking",
  "Artist Management",
  "Event Production",
  "Venue Management",
  "Tour Management",
  "Contract Negotiation",
];

const CurrentUserProfile = () => {
  // Authentication and user data
  const { user: userdata } = useUser();
  const { user, isLoading: userLoading } = useCurrentUser();
  const { colors } = useThemeColors();

  // Convex mutations and queries
  const updateUser = useMutation(api.controllers.user.updateUserProfile);

  // Video queries
  const userVideos = useQuery(
    api.controllers.videos.getUserProfileVideos,
    user ? { userId: user.clerkId } : "skip"
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

  // Account Type - NOW THREE SEPARATE ROLES
  const [isMusician, setIsMusician] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isBooker, setIsBooker] = useState(false);

  // Client Specific
  const [organization, setOrganization] = useState("");
  const [clienthandles, setClientHandles] = useState("");

  // UI State
  const [showRates, setShowRates] = useState(false);

  // Video Profile State
  const [videos, setVideos] = useState<VideoProfileProps[]>([]);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");

  // Role Type State (for musicians only)
  const [roleType, setRoleType] = useState("");
  const [djGenre, setDjGenre] = useState("");
  const [djEquipment, setDjEquipment] = useState("");
  const [mcType, setMcType] = useState("");
  const [mcLanguages, setMcLanguages] = useState("");
  const [vocalistGenre, setVocalistGenre] = useState("");

  // Booker Specific State
  const [bookerSkills, setBookerSkills] = useState<string[]>([]);
  const [bookerBio, setBookerBio] = useState("");
  const [showBookerSkillsModal, setShowBookerSkillsModal] = useState(false);

  const [newVideoPrivacy, setNewVideoPrivacy] = useState<boolean>(true);

  // Validation
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
      setIsBooker(user.isBooker || false);
      setClientHandles(user.handles || "");

      // Load role-specific data (musicians only)
      if (user.isMusician && !user.isBooker) {
        setRoleType(user.roleType || "");
        setDjGenre(user.djGenre || "");
        setDjEquipment(user.djEquipment || "");
        setMcType(user.mcType || "");
        setMcLanguages(user.mcLanguages || "");
        setVocalistGenre(user.vocalistGenre || "");
      }

      // Booker specific data
      if (user.isBooker) {
        setBookerSkills(user.bookerSkills || []);
        setBookerBio(user.bookerBio || "");
      }

      // Fix for rate object (musicians only)
      if (user.isMusician && !user.isBooker) {
        const userRate = user.rate || {};
        setRate({
          regular: userRate.regular || "",
          function: userRate.function || "",
          concert: userRate.concert || "",
          corporate: userRate.corporate || "",
        });
      }

      hasLoadedInitialData.current = true;
    }
  }, [user, userLoading]);

  // Role Type Constants (for musicians only)
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

  const BookerSection = () => (
    <>
      <TextInput
        label="Company/Organization"
        value={organization}
        onChange={setOrganization}
        Icon={<Building size={16} />}
        placeholder="Your booking agency or company name"
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

      <div className="md:col-span-2" data-field="bookerSkills">
        <Label className={cn("text-sm font-medium", colors.text)}>
          Booker Skills & Specialties *
        </Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {bookerSkills.map((skill) => (
            <Badge
              key={skill}
              variant="outline"
              className={cn(
                "flex items-center gap-1 bg-blue-500/10 text-blue-600 border-blue-200",
                colors.text
              )}
            >
              {skill}
              <button
                onClick={() => removeBookerSkill(skill)}
                className="text-red-500 hover:text-red-600"
              >
                <X size={12} />
              </button>
            </Badge>
          ))}
          <button
            onClick={() => setShowBookerSkillsModal(true)}
            className={cn(
              "text-blue-500 hover:text-blue-600 text-sm flex items-center",
              colors.text
            )}
          >
            <Plus size={14} className="mr-1" /> Add Skill
          </button>
        </div>
        <p className={cn("text-xs text-red-500 mt-1")}>
          {bookerSkills.length === 0 && "At least one skill is required"}
        </p>
      </div>
    </>
  );

  // Helper function to render role-specific content
  const renderRoleSpecificContent = () => {
    if (isBooker) {
      return <BookerSection />;
    }

    if (isMusician) {
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
    }

    return null;
  };

  // Booker skill handlers
  const toggleBookerSkill = (skill: string) => {
    setBookerSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const removeBookerSkill = (skill: string) => {
    setBookerSkills((prev) => prev.filter((s) => s !== skill));
  };

  // Scroll functions
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
      bookerSkills: '[data-field="bookerSkills"]',
      organization: '[data-field="organization"]',
    };

    const selector = fieldSelectors[field];
    if (selector) {
      const element = document.querySelector(selector);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      element?.classList.add("ring-2", "ring-amber-500");
      setTimeout(() => {
        element?.classList.remove("ring-2", "ring-amber-500");
      }, 2000);
    }
  };

  // Enhanced rate validation function
  const isValidRateValue = (value: string): boolean => {
    if (!value || value.trim() === "") return false;
    let numericValue = value.replace(/[$,£€¥\s]/g, "").toLowerCase();

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

    const num = Number(numericValue);
    return !isNaN(num) && num > 0;
  };

  // Enhanced validation function with proper role separation
  const validateProfile = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Phone validation
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

    // Make phone required for musicians and bookers
    if ((isMusician || isBooker) && (!phone || phone.trim() === "")) {
      errors.push({
        field: "phone",
        message: "Phone number is required for professional accounts",
        importance: "high",
      });
    }

    // MUSICIAN-SPECIFIC VALIDATIONS
    if (isMusician && !isBooker) {
      if (!roleType) {
        errors.push({
          field: "roleType",
          message: "Please select your role type",
          importance: "high",
        });
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

      // Rates validation (for musicians only)
      const hasValidRates = Object.values(rate).some(isValidRateValue);
      if (!hasValidRates) {
        errors.push({
          field: "rates",
          message: VALIDATION_MESSAGES.rates.required,
          importance: "high",
        });
      }

      // Videos validation (recommended for musicians)
      if (videos.length === 0) {
        errors.push({
          field: "videos",
          message: VALIDATION_MESSAGES.videos.recommended,
          importance: "medium",
        });
      }
    }

    // BOOKER-SPECIFIC VALIDATIONS
    if (isBooker) {
      if (!organization) {
        errors.push({
          field: "organization",
          message: "Company/Organization name is required for bookers",
          importance: "high",
        });
      }
      if (bookerSkills.length === 0) {
        errors.push({
          field: "bookerSkills",
          message: "At least one booker skill is required",
          importance: "high",
        });
      }
    }

    // Date of Birth validation (for musicians and bookers)
    if ((isMusician || isBooker) && (!age || !month || !year)) {
      errors.push({
        field: "dateOfBirth",
        message: VALIDATION_MESSAGES.dateOfBirth.required,
        importance: "high",
      });
    } else if (
      (isMusician || isBooker) &&
      (isNaN(Number(year)) ||
        Number(year) < 1900 ||
        Number(year) > new Date().getFullYear())
    ) {
      errors.push({
        field: "dateOfBirth",
        message: VALIDATION_MESSAGES.dateOfBirth.invalid,
        importance: "high",
      });
    }

    // Essential profile fields validation (all roles)
    const essentialFields = [
      { value: firstname, field: "firstname", name: "First Name" },
      { value: lastname, field: "lastname", name: "Last Name" },
      { value: city, field: "city", name: "City" },
      {
        value: isBooker ? bookerBio : talentbio,
        field: "talentbio",
        name: "Bio",
      },
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

    // Handle validation errors
    if (validationErrors.length > 0) {
      setValidationErrors(validationErrors);

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
        return;
      } else {
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
        scrollToValidationSummary();
      }
    }

    // Proceed with saving
    try {
      setLoading(true);

      // Base update data for all roles
      const baseUpdateData = {
        firstname,
        lastname,
        email,
        username,
        city,
        date: age,
        month,
        year,
        address,
        phone,
        organization,
        musicianhandles: handles,
        talentbio: isBooker ? bookerBio : talentbio,
        handles: clienthandles,
        isMusician,
        isClient,
        isBooker,
        firstTimeInProfile: false,
        experience,
      };

      // Role-specific data
      const roleSpecificData = isBooker
        ? {
            // Booker-specific fields
            bookerSkills,
            bookerBio,
            musiciangenres: [], // Bookers don't need genres
            instrument: "", // Bookers don't need instruments
            roleType: "", // Bookers don't need roleType
            djGenre: "",
            djEquipment: "",
            mcType: "",
            mcLanguages: "",
            vocalistGenre: "",
            rate: { regular: "", function: "", concert: "", corporate: "" }, // Bookers don't need rates
          }
        : isMusician
          ? {
              // Musician-specific fields
              musiciangenres: genre,
              instrument: roleType === "instrumentalist" ? instrument : "",
              roleType,
              djGenre: roleType === "dj" ? djGenre : "",
              djEquipment: roleType === "dj" ? djEquipment : "",
              mcType: roleType === "mc" ? mcType : "",
              mcLanguages: roleType === "mc" ? mcLanguages : "",
              vocalistGenre: roleType === "vocalist" ? vocalistGenre : "",
              rate,
              bookerSkills: [], // Musicians don't need booker skills
              bookerBio: "", // Musicians don't need booker bio
            }
          : {
              // Client-specific fields
              musiciangenres: [],
              instrument: "",
              roleType: "",
              djGenre: "",
              djEquipment: "",
              mcType: "",
              mcLanguages: "",
              vocalistGenre: "",
              rate: { regular: "", function: "", concert: "", corporate: "" },
              bookerSkills: [],
              bookerBio: "",
            };

      const updateData = {
        ...baseUpdateData,
        ...roleSpecificData,
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

  // Enhanced scroll function
  const scrollToValidationSummary = () => {
    const validationElement = document.getElementById("validation-summary");
    if (validationElement) {
      validationElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });

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

  // Account type toggle - NOW THREE SEPARATE ROLES
  const toggleAccountType = (type: "musician" | "client" | "booker") => {
    setIsMusician(type === "musician");
    setIsClient(type === "client");
    setIsBooker(type === "booker");

    // Reset role-specific state when switching roles
    if (type !== "musician") {
      setRoleType("");
    }
    if (type !== "booker") {
      setBookerSkills([]);
    }
  };

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

  const removeGenre = (genreToRemove: string) => {
    setGenre(genre.filter((g) => g !== genreToRemove));
  };

  // Loading state
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
                      isBooker
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                        : isMusician
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                          : "bg-gradient-to-r from-green-500 to-green-600 text-white"
                    )}
                  >
                    {isBooker
                      ? "Booker/Manager"
                      : isMusician
                        ? "Musician"
                        : isClient
                          ? "Client"
                          : "Member"}
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
              label: isBooker ? "Managed" : isMusician ? "Videos" : "Gigs",
              value: isBooker
                ? user.managedBands?.length || 0
                : isMusician
                  ? videos.length || 0
                  : user.monthlyGigsPosted || 0,
              icon: isBooker ? (
                <Users size={16} />
              ) : isMusician ? (
                <Music size={16} />
              ) : (
                <Briefcase size={16} />
              ),
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
            {/* Performance Videos Section (Musicians only) */}
            {isMusician && !isBooker && user && (
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
                value={isBooker ? bookerBio : talentbio}
                onChange={(e) =>
                  isBooker
                    ? setBookerBio(e.target.value)
                    : setTalentbio(e.target.value)
                }
                placeholder={
                  isBooker
                    ? "Describe your booking services, experience, and the types of events you specialize in..."
                    : "Tell us about yourself, your skills, and your experience..."
                }
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
              title={isBooker ? "Management Services" : "Experience & Skills"}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(isMusician || isBooker) && (
                  <>
                    {/* Role Type Selection (Musicians only) */}
                    {isMusician && !isBooker && (
                      <SelectInput
                        label="Role Type"
                        value={roleType}
                        onChange={setRoleType}
                        options={roleTypes}
                      />
                    )}

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

                {/* Date of Birth (Musicians and Bookers only) */}
                {(isMusician || isBooker) && (
                  <div data-field="dateOfBirth">
                    <Label className={cn("text-sm font-medium", colors.text)}>
                      Date of Birth *
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
                    <p className={cn("text-xs text-red-500 mt-1")}>
                      {(!age || !month || !year) && "Date of birth is required"}
                    </p>
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

                <KenyanPhoneInput
                  value={phone}
                  onChange={setPhone}
                  label="Phone Number"
                  required={isMusician || isBooker}
                />
              </div>
            </SectionContainer>

            {/* Rates Section (Musicians only, not bookers) */}
            {isMusician && !isBooker && (
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
              <div className="space-y-4">
                <ToggleSwitch
                  label="Musician Account"
                  checked={isMusician}
                  onChange={() => toggleAccountType("musician")}
                  description="Perform at gigs and events"
                />
                <ToggleSwitch
                  label="Client Account"
                  checked={isClient}
                  onChange={() => toggleAccountType("client")}
                  description="Hire talent for your events"
                />
                <ToggleSwitch
                  label="Booker/Manager Account"
                  checked={isBooker}
                  onChange={() => toggleAccountType("booker")}
                  description="Manage talent and coordinate events"
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

      {/* Booker Skills Modal */}
      <Modal
        isOpen={showBookerSkillsModal}
        onClose={() => setShowBookerSkillsModal(false)}
        title="Select Booker Skills"
      >
        <div className="space-y-3">
          <p className={cn("text-sm", colors.textMuted)}>
            Select the skills that best describe your booking and management
            services
          </p>
          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
            {bookerSkillsList.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleBookerSkill(skill)}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  bookerSkills.includes(skill)
                    ? "border-blue-500 bg-blue-500/10 text-blue-600"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{skill}</span>
                  {bookerSkills.includes(skill) && (
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
        <ModalActions
          onCancel={() => setShowBookerSkillsModal(false)}
          onConfirm={() => setShowBookerSkillsModal(false)}
          confirmText="Done"
        />
      </Modal>
    </div>
  );
};

export default CurrentUserProfile;
