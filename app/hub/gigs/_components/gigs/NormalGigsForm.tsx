"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Users,
  Music,
  Mic,
  Volume2,
  Save,
  X,
  Phone,
  Type,
  FileText,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Guitar,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { motion, AnimatePresence, easeOut } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "sonner";

import { fileupload, MinimalUser } from "@/hooks/fileUpload";

import DatePicker from "react-datepicker";

import {
  BusinessCategory,
  CategoryVisibility,
  CustomProps,
  GigInputs,
  TalentType,
  UserInfo,
} from "@/types/gig";
import { useNetworkStatus } from "@/hooks/useNetwork";
import {
  useGigData,
  useGigNotifications,
  useGigScheduler,
  useGigStore,
} from "@/app/stores/useGigStore";
import { OfflineNotification } from "./OfflineNotification";
import TalentModal from "./TalentModal";
import GigCustomization from "./GigCustomization";
import SchedulerComponent from "./SchedulerComponent";

// Recreate the types locally to avoid imports
type LocalGigInputs = {
  title: string;
  description: string;
  phoneNo: string;
  price: string;
  category: string;
  location: string;
  secret: string;
  end: string;
  start: string;
  durationto: string;
  durationfrom: string;
  bussinesscat: BusinessCategory;
  otherTimeline: string;
  gigtimeline: string;
  day: string;
  date: string;
  pricerange: string;
  currency: string;
  mcType?: string;
  mcLanguages?: string;
  djGenre?: string;
  djEquipment?: string;
  vocalistGenre?: string[];
};

export default function NormalGigsForm() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const { user } = useCurrentUser();
  const isOnline = useNetworkStatus();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [secretpass, setSecretPass] = useState<boolean>(false);
  const [showcustomization, setShowCustomization] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [imageUrl, setUrl] = useState<string>("");
  const [fileUrl, setFileUrl] = useState<string>("");

  const { isSchedulerOpen, setisSchedulerOpen } = useGigScheduler();
  const { showOfflineNotification, setShowOfflineNotification } =
    useGigNotifications();
  const { setRefetchData } = useGigData();
  const [activeTalentType, setActiveTalentType] = useState<TalentType>(null);
  const [showTalentModal, setShowTalentModal] = useState(false);
  const [gigcustom, setGigCustom] = useState<CustomProps>({
    fontColor: "",
    font: "",
    backgroundColor: "",
  });

  // Form state - simplified for integration
  const [gigInputs, setGigs] = useState<LocalGigInputs>({
    title: "",
    description: "",
    phoneNo: "",
    price: "",
    category: "",
    location: "",
    secret: "",
    end: "",
    start: "",
    durationto: "pm",
    durationfrom: "am",
    bussinesscat: null,
    otherTimeline: "",
    gigtimeline: "",
    day: "",
    date: "",
    pricerange: "",
    currency: "KES",
  });

  const [userinfo, setUserInfo] = useState<UserInfo>({
    prefferences: [],
  });

  const [bussinesscat, setBussinessCategory] = useState<BusinessCategory>(null);
  const [showduration, setshowduration] = useState<boolean>(false);
  const [showCategories, setshowCategories] = useState<CategoryVisibility>({
    title: false,
    description: false,
    business: false,
    gtimeline: false,
    othergig: true,
    gduration: false,
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editMessage, setEditMessage] = useState("");
  const [error, setError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [show, setShow] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [schedulingProcedure, setSchedulingProcedure] = useState({
    type: "",
    date: new Date(),
  });

  // Animation variants
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!isOnline) {
      setShowOfflineNotification(true);
    }
  }, [isOnline]);

  // Section animation variants
  const sectionVariants = isMobile
    ? {
        hidden: { opacity: 0, y: 10 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.3,
            ease: easeOut, // Use imported easing function
          },
        },
      }
    : {
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: easeOut, // Use imported easing function
          },
        },
      };

  const inputVariants = {
    focus: {
      scale: 1.02,
      boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.5)",
    },
  };

  // Business categories
  const businessCategories = [
    { value: "full", label: "🎵 Full Band", icon: Users },
    { value: "personal", label: "👤 Individual", icon: Music },
    { value: "other", label: "🎭 Create Your Own Band", icon: Zap },
    { value: "mc", label: "🎤 MC", icon: Mic },
    { value: "dj", label: "🎧 DJ", icon: Volume2 },
    { value: "vocalist", label: "🎤 Vocalist", icon: Music },
  ];

  // Band instruments
  const bandInstruments = [
    { value: "vocalist", label: "Vocalist" },
    { value: "piano", label: "Piano" },
    { value: "guitar", label: "Guitar" },
    { value: "bass", label: "Bass Guitar" },
    { value: "drums", label: "Drums" },
    { value: "sax", label: "Saxophone" },
    { value: "violin", label: "Violin" },
    { value: "cello", label: "Cello" },
    { value: "trumpet", label: "Trumpet" },
    { value: "percussion", label: "Percussion" },
  ];

  // Individual instruments
  const individualInstruments = [
    "piano",
    "guitar",
    "bass",
    "drums",
    "saxophone",
    "violin",
    "trumpet",
    "flute",
    "cello",
    "ukulele",
    "harp",
    "xylophone",
    "percussion",
  ];

  // Days of week
  const days = () => [
    { id: 1, val: "monday", name: "Monday" },
    { id: 2, val: "tuesday", name: "Tuesday" },
    { id: 3, val: "wednesday", name: "Wednesday" },
    { id: 4, val: "thursday", name: "Thursday" },
    { id: 5, val: "friday", name: "Friday" },
    { id: 6, val: "saturday", name: "Saturday" },
    { id: 7, val: "sunday", name: "Sunday" },
  ];

  // Price ranges
  const priceRanges = [
    { value: "0", label: "Select range" },
    { value: "hundreds", label: "Hundreds (00)" },
    { value: "thousands", label: "Thousands (000)" },
    { value: "tensofthousands", label: "Tens of thousands (0000)" },
    { value: "hundredsofthousands", label: "Hundreds of thousands (00000)" },
    { value: "millions", label: "Millions (000000)" },
  ];

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const dep = "image";
      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/gif",
        "image/webp",
      ];

      if (!user) {
        toast.error("Please log in to upload files");
        return;
      }

      // Create minimal user object
      const minimalUser: MinimalUser = {
        _id: user._id,
        clerkId: user.clerkId,
        ...(user.email && { email: user.email }),
        ...(user.username && { username: user.username }),
      };

      fileupload(
        event,
        (file: string) => {
          if (file) {
            setUrl(file);
          }
        },
        toast,
        allowedTypes,
        fileUrl,
        (file: string | undefined) => {
          if (file) {
            setFileUrl(file);
          }
        },
        setIsUploading,
        dep,
        minimalUser
      );
    },
    [fileUrl, user]
  );

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setGigs((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle business category change
  const handleBussinessChange = (value: BusinessCategory) => {
    setBussinessCategory(value);

    // Clear all talent data when switching to non-talent categories
    if (!["mc", "dj", "vocalist"].includes(value || "")) {
      setGigs((prev) => ({
        ...prev,
        mcType: undefined,
        mcLanguages: undefined,
        djGenre: undefined,
        djEquipment: undefined,
        vocalistGenre: undefined,
      }));
      setActiveTalentType(null);
      return;
    }

    // For talent types, clear other talent data and set current type
    const newTalentType = value as Exclude<TalentType, null>;
    setActiveTalentType(newTalentType);

    // Clear other talent data while preserving current type's data
    setGigs((prev) => ({
      ...prev,
      mcType: newTalentType === "mc" ? prev.mcType : undefined,
      mcLanguages: newTalentType === "mc" ? prev.mcLanguages : undefined,
      djGenre: newTalentType === "dj" ? prev.djGenre : undefined,
      djEquipment: newTalentType === "dj" ? prev.djEquipment : undefined,
      vocalistGenre:
        newTalentType === "vocalist" ? prev.vocalistGenre : undefined,
    }));

    setShowTalentModal(true);
  };

  // Handle band instrument selection
  const handleInstrumentChange = (instrument: string) => {
    setUserInfo((prev) => ({
      prefferences: prev.prefferences.includes(instrument)
        ? prev.prefferences.filter((item) => item !== instrument)
        : [...prev.prefferences, instrument],
    }));
  };

  // Handle talent modal submit
  const handleTalentSubmit = (data: Partial<LocalGigInputs>) => {
    // Only keep data for the current active talent type
    const filteredData = {
      ...(activeTalentType === "mc" && {
        mcType: data.mcType,
        mcLanguages: data.mcLanguages,
      }),
      ...(activeTalentType === "dj" && {
        djGenre: data.djGenre,
        djEquipment: data.djEquipment,
      }),
      ...(activeTalentType === "vocalist" && {
        vocalistGenre: data.vocalistGenre,
      }),
    };

    setGigs((prev) => ({
      ...prev,
      ...filteredData,
    }));
    setShowTalentModal(false);
  };

  // Handle date selection
  const handleDate = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      setGigs((prev) => ({
        ...prev,
        date: date.toISOString(),
      }));
    }
  };

  // Handle scheduling data
  const getSchedulingData = (type: string, date?: Date) => {
    setSchedulingProcedure({
      type,
      date: date ?? new Date(),
    });
  };

  // Validation function
  const validateFields = () => {
    const errors: Record<string, string> = {};

    if (!gigInputs.title.trim()) errors.title = "Title is required";
    if (!gigInputs.description.trim())
      errors.description = "Description is required";
    if (!gigInputs.location.trim()) errors.location = "Location is required";
    if (!bussinesscat) errors.bussinesscat = "Business category is required";

    // Validate talent-specific fields
    if (bussinesscat === "mc") {
      if (!gigInputs.mcType) errors.mcType = "MC type is required";
      if (!gigInputs.mcLanguages) errors.mcLanguages = "Languages are required";
    } else if (bussinesscat === "dj") {
      if (!gigInputs.djGenre) errors.djGenre = "DJ genre is required";
      if (!gigInputs.djEquipment) errors.djEquipment = "Equipment is required";
    } else if (bussinesscat === "vocalist") {
      if (!gigInputs.vocalistGenre || gigInputs.vocalistGenre.length === 0) {
        errors.vocalistGenre = "At least one genre is required";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateFields()) {
      setIsVisible(true);
      setError(true);
      setEditMessage("Please fill in all required fields");
      return;
    }

    try {
      setIsLoading(true);

      // Prepare submission data
      const submissionData = {
        ...gigInputs,
        bandCategory: userinfo.prefferences,
        postedBy: user?._id,
        font: gigcustom.font,
        fontColor: gigcustom.fontColor,
        backgroundColor: gigcustom.backgroundColor,
        logo: imageUrl,
        schedulingProcedure: schedulingProcedure,
        scheduleDate: schedulingProcedure.date,
      };

      console.log("Submitting gig:", submissionData);

      // TODO: Implement API call
      // const res = await fetch("/api/gigs/create", { ... });

      // Simulate success
      setTimeout(() => {
        setEditMessage("🎉 Gig created successfully!");
        setError(false);
        setIsVisible(true);

        // Reset form
        setGigs({
          title: "",
          description: "",
          phoneNo: "",
          price: "",
          category: "",
          location: "",
          secret: "",
          end: "",
          start: "",
          durationto: "pm",
          durationfrom: "am",
          bussinesscat: null,
          otherTimeline: "",
          gigtimeline: "",
          day: "",
          date: "",
          pricerange: "",
          currency: "KES",
        });
        setUserInfo({ prefferences: [] });
        setBussinessCategory(null);
        setFieldErrors({});
      }, 1500);
    } catch (error) {
      console.error("Error:", error);
      setEditMessage("Failed to create gig");
      setError(true);
      setIsVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle success message timeout
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVisible && editMessage) {
      timer = setTimeout(() => {
        setIsVisible(false);
        setEditMessage("");
      }, 4500);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isVisible, editMessage]);

  // Talent preview component
  const TalentPreview = () => {
    if (
      !gigInputs.mcType &&
      !gigInputs.djGenre &&
      !gigInputs.vocalistGenre?.length
    ) {
      return null;
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "rounded-xl p-4 border",
          colors.border,
          colors.backgroundMuted,
          "relative"
        )}
      >
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Music className={cn("w-5 h-5", colors.primary)} />
            <h3 className={cn("font-medium", colors.text)}>Talent Details</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={cn("text-sm", colors.hoverBg)}
            onClick={() => {
              const type = gigInputs.mcType
                ? "mc"
                : gigInputs.djGenre
                  ? "dj"
                  : gigInputs.vocalistGenre?.length
                    ? "vocalist"
                    : null;
              if (type) {
                setActiveTalentType(type);
                setShowTalentModal(true);
              }
            }}
          >
            Edit
          </Button>
        </div>

        <div className="space-y-2">
          {gigInputs.mcType && (
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn("border-blue-200 text-blue-700")}
              >
                MC: {gigInputs.mcType}
              </Badge>
              {gigInputs.mcLanguages && (
                <Badge
                  variant="outline"
                  className={cn("border-purple-200 text-purple-700")}
                >
                  {gigInputs.mcLanguages}
                </Badge>
              )}
            </div>
          )}

          {gigInputs.djGenre && (
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn("border-green-200 text-green-700")}
              >
                DJ: {gigInputs.djGenre}
              </Badge>
              {gigInputs.djEquipment && (
                <Badge
                  variant="outline"
                  className={cn("border-amber-200 text-amber-700")}
                >
                  {gigInputs.djEquipment}
                </Badge>
              )}
            </div>
          )}

          {gigInputs.vocalistGenre?.length && (
            <div className="flex flex-wrap gap-1">
              {gigInputs.vocalistGenre.map((genre) => (
                <Badge
                  key={genre}
                  variant="outline"
                  className={cn("border-pink-200 text-pink-700")}
                >
                  {genre}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // Collapsible section component
  const CollapsibleSection = ({
    title,
    icon: Icon,
    isOpen,
    onToggle,
    children,
  }: {
    title: string;
    icon: any;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
  }) => (
    <motion.div variants={sectionVariants}>
      <div
        className={cn(
          "flex items-center justify-between p-4 rounded-t-lg border cursor-pointer",
          colors.border,
          colors.backgroundMuted,
          "hover:opacity-90 transition-all"
        )}
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <Icon className={cn("w-5 h-5", colors.primary)} />
          <h3 className={cn("font-medium", colors.text)}>{title}</h3>
        </div>
        {isOpen ? (
          <ChevronUp className={cn("w-4 h-4", colors.textMuted)} />
        ) : (
          <ChevronDown className={cn("w-4 h-4", colors.textMuted)} />
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                "p-4 border border-t-0 rounded-b-lg",
                colors.border,
                colors.backgroundMuted
              )}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <div className="relative">
      {/* Success/Error Message */}
      <AnimatePresence>
        {isVisible && editMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={cn(
              "fixed top-6 left-1/2 transform -translate-x-1/2 z-50 rounded-lg px-6 py-3 shadow-lg",
              error ? "bg-red-500/90" : "bg-emerald-500/90"
            )}
          >
            <motion.span
              className="text-white font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {editMessage}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Notification */}
      {showOfflineNotification && !isOnline && (
        <OfflineNotification
          onClose={() => setShowOfflineNotification(false)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Type Section */}
        <motion.div variants={sectionVariants} className="space-y-4">
          <div>
            <label
              className={cn("block text-sm font-medium mb-2", colors.text)}
            >
              Who do you want for your gig?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {businessCategories.map((category) => {
                const Icon = category.icon;
                const isActive = bussinesscat === category.value;

                return (
                  <motion.button
                    key={category.value}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      handleBussinessChange(category.value as BusinessCategory)
                    }
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-xl border transition-all",
                      colors.border,
                      isActive
                        ? cn(
                            "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent"
                          )
                        : cn(colors.hoverBg, colors.text)
                    )}
                  >
                    <Icon className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">
                      {category.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
            {fieldErrors.bussinesscat && (
              <p className="text-sm text-red-500 mt-1">
                {fieldErrors.bussinesscat}
              </p>
            )}
          </div>

          {/* Talent Preview */}
          <TalentPreview />
        </motion.div>

        {/* Customize Button */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="flex justify-between items-center"
        >
          <Button
            onClick={() => setShowCustomization(true)}
            type="button"
            variant="outline"
            className={cn(
              "flex items-center gap-2 border-2",
              colors.border,
              colors.hoverBg
            )}
          >
            <span className="text-sm">Customize Gig Card</span>
          </Button>
        </motion.div>

        {/* Title Section */}
        <CollapsibleSection
          title="Title Information"
          icon={Type}
          isOpen={showCategories.title}
          onToggle={() =>
            setshowCategories((prev) => ({ ...prev, title: !prev.title }))
          }
        >
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                {secretpass ? (
                  <EyeOff className={cn("w-4 h-4", colors.textMuted)} />
                ) : (
                  <Eye className={cn("w-4 h-4", colors.textMuted)} />
                )}
              </div>
              <Input
                type={secretpass ? "text" : "password"}
                value={gigInputs.secret}
                onChange={(e) => handleInputChange(e)}
                name="secret"
                placeholder="Enter secret passphrase (optional)"
                className={cn(
                  "pl-10 pr-10",
                  fieldErrors.secret && "border-red-500"
                )}
              />
              <button
                type="button"
                onClick={() => setSecretPass(!secretpass)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {secretpass ? (
                  <EyeOff className={cn("w-4 h-4", colors.textMuted)} />
                ) : (
                  <Eye className={cn("w-4 h-4", colors.textMuted)} />
                )}
              </button>
            </div>

            <div>
              <Input
                value={gigInputs.title}
                onChange={(e) => handleInputChange(e)}
                name="title"
                placeholder="Enter a captivating title for your gig"
                className={cn(fieldErrors.title && "border-red-500")}
              />
              {fieldErrors.title && (
                <p className="text-sm text-red-500 mt-1">{fieldErrors.title}</p>
              )}
            </div>
          </div>
        </CollapsibleSection>

        {/* Description Section */}
        <CollapsibleSection
          title="Description"
          icon={FileText}
          isOpen={showCategories.description}
          onToggle={() =>
            setshowCategories((prev) => ({
              ...prev,
              description: !prev.description,
            }))
          }
        >
          <Textarea
            value={gigInputs.description}
            onChange={(e) => handleInputChange(e)}
            name="description"
            placeholder="Describe your gig in detail (e.g., type of music, event vibe, special requirements)"
            rows={4}
            className={cn(fieldErrors.description && "border-red-500")}
          />
          {fieldErrors.description && (
            <p className="text-sm text-red-500 mt-1">
              {fieldErrors.description}
            </p>
          )}
        </CollapsibleSection>

        {/* Business Information Section */}
        <CollapsibleSection
          title="Business Information"
          icon={Briefcase}
          isOpen={showCategories.business}
          onToggle={() =>
            setshowCategories((prev) => ({ ...prev, business: !prev.business }))
          }
        >
          <div className="space-y-4">
            <div>
              <label
                className={cn("block text-sm font-medium mb-1", colors.text)}
              >
                Contact Information
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="tel"
                  value={gigInputs.phoneNo}
                  onChange={(e) => handleInputChange(e)}
                  name="phoneNo"
                  placeholder="Your phone number"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  className={cn("block text-sm font-medium mb-1", colors.text)}
                >
                  Currency
                </label>
                <Select
                  value={gigInputs.currency}
                  onValueChange={(value) =>
                    setGigs((prev) => ({ ...prev, currency: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="KES">KES (KSh)</SelectItem>
                    <SelectItem value="NGN">NGN (₦)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label
                  className={cn("block text-sm font-medium mb-1", colors.text)}
                >
                  Price
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="number"
                    value={gigInputs.price}
                    onChange={(e) => handleInputChange(e)}
                    name="price"
                    placeholder="Amount"
                    className="pl-10"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label
                  className={cn("block text-sm font-medium mb-1", colors.text)}
                >
                  Price Range
                </label>
                <Select
                  value={gigInputs.pricerange}
                  onValueChange={(value) =>
                    setGigs((prev) => ({ ...prev, pricerange: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    {priceRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(gigInputs.price || gigInputs.pricerange !== "0") && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  "rounded-lg p-3 border",
                  colors.border,
                  colors.backgroundMuted
                )}
              >
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Estimated Price:</span>
                  <span>
                    {gigInputs.price && gigInputs.pricerange !== "0" ? (
                      <>
                        {gigInputs.currency === "USD" && "$"}
                        {gigInputs.currency === "EUR" && "€"}
                        {gigInputs.currency === "GBP" && "£"}
                        {gigInputs.currency === "KES" && "KSh"}
                        {gigInputs.currency === "NGN" && "₦"}
                        {gigInputs.price} - {gigInputs.pricerange}
                      </>
                    ) : gigInputs.price ? (
                      <>
                        Fixed price:
                        {gigInputs.currency === "USD" && "$"}
                        {gigInputs.currency === "EUR" && "€"}
                        {gigInputs.currency === "GBP" && "£"}
                        {gigInputs.currency === "KES" && "KSh"}
                        {gigInputs.currency === "NGN" && "₦"}
                        {gigInputs.price}
                      </>
                    ) : (
                      <span>Price magnitude: {gigInputs.pricerange}</span>
                    )}
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </CollapsibleSection>

        {/* Gig Timeline Section */}
        <CollapsibleSection
          title="Gig Timeline"
          icon={Calendar}
          isOpen={showCategories.gtimeline}
          onToggle={() =>
            setshowCategories((prev) => ({
              ...prev,
              gtimeline: !prev.gtimeline,
            }))
          }
        >
          <div className="space-y-4">
            <div>
              <label
                className={cn("block text-sm font-medium mb-1", colors.text)}
              >
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  value={gigInputs.location}
                  onChange={(e) => handleInputChange(e)}
                  name="location"
                  placeholder="Venue address or city"
                  className="pl-10"
                />
              </div>
              {fieldErrors.location && (
                <p className="text-sm text-red-500 mt-1">
                  {fieldErrors.location}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className={cn("block text-sm font-medium mb-1", colors.text)}
                >
                  Gig Type
                </label>
                <Select
                  value={gigInputs.gigtimeline}
                  onValueChange={(value) =>
                    setGigs((prev) => ({ ...prev, gigtimeline: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">One-time event</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="other">Other...</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label
                  className={cn("block text-sm font-medium mb-1", colors.text)}
                >
                  Day of Week
                </label>
                <Select
                  value={gigInputs.day}
                  onValueChange={(value) =>
                    setGigs((prev) => ({ ...prev, day: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {days().map((day) => (
                      <SelectItem key={day.id} value={day.val}>
                        {day.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {gigInputs.gigtimeline === "other" && (
              <div>
                <Input
                  type="text"
                  value={gigInputs.otherTimeline}
                  onChange={(e) => handleInputChange(e)}
                  name="otherTimeline"
                  placeholder="Describe your custom timeline info"
                />
              </div>
            )}

            {gigInputs.gigtimeline === "once" && (
              <div>
                <label
                  className={cn("block text-sm font-medium mb-1", colors.text)}
                >
                  Event Date
                </label>
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDate}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg",
                    colors.border
                  )}
                  placeholderText="Select date"
                  isClearable
                />
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* Duration Section */}
        <motion.div variants={sectionVariants}>
          {showduration ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className={cn(
                "rounded-lg border overflow-hidden",
                colors.border,
                colors.backgroundMuted
              )}
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3
                    className={cn(
                      "font-medium flex items-center gap-2",
                      colors.text
                    )}
                  >
                    <Clock className={cn("w-5 h-5", colors.primary)} />
                    Set Duration
                  </h3>
                  <button
                    onClick={() => setshowduration(false)}
                    className={cn("text-sm", colors.textMuted)}
                  >
                    &times;
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className={cn(
                        "block text-sm font-medium mb-1",
                        colors.text
                      )}
                    >
                      Start Time
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={gigInputs.start}
                        onChange={(e) => handleInputChange(e)}
                        name="start"
                        placeholder="Time (e.g., 10)"
                      />
                      <Select
                        value={gigInputs.durationfrom}
                        onValueChange={(value) =>
                          setGigs((prev) => ({ ...prev, durationfrom: value }))
                        }
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pm">PM</SelectItem>
                          <SelectItem value="am">AM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label
                      className={cn(
                        "block text-sm font-medium mb-1",
                        colors.text
                      )}
                    >
                      End Time
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={gigInputs.end}
                        onChange={(e) => handleInputChange(e)}
                        name="end"
                        placeholder="Time (e.g., 10)"
                      />
                      <Select
                        value={gigInputs.durationto}
                        onValueChange={(value) =>
                          setGigs((prev) => ({ ...prev, durationto: value }))
                        }
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pm">PM</SelectItem>
                          <SelectItem value="am">AM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div
              onClick={() => setshowduration(true)}
              className={cn(
                "flex justify-between items-center p-4 rounded-lg border cursor-pointer",
                colors.border,
                colors.backgroundMuted,
                "hover:opacity-90 transition-all"
              )}
            >
              <h3
                className={cn(
                  "font-medium flex items-center gap-2",
                  colors.text
                )}
              >
                <Clock className={cn("w-5 h-5", colors.primary)} />
                Add Duration
              </h3>
              <ChevronDown className={cn("w-4 h-4", colors.textMuted)} />
            </div>
          )}
        </motion.div>

        {/* Band Setup Section */}
        {bussinesscat === "other" && (
          <CollapsibleSection
            title="Band Setup"
            icon={Users}
            isOpen={!showCategories.othergig}
            onToggle={() =>
              setshowCategories((prev) => ({
                ...prev,
                othergig: !prev.othergig,
              }))
            }
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {bandInstruments.map((instrument) => (
                <motion.div
                  key={instrument.value}
                  whileHover={{ scale: 1.03 }}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    id={instrument.value}
                    checked={userinfo.prefferences.includes(instrument.value)}
                    onChange={() => handleInstrumentChange(instrument.value)}
                    className="accent-blue-500"
                  />
                  <label
                    htmlFor={instrument.value}
                    className={cn("text-sm cursor-pointer", colors.text)}
                  >
                    {instrument.label}
                  </label>
                </motion.div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Individual Instrument Selection */}
        {bussinesscat === "personal" && (
          <motion.div variants={sectionVariants}>
            <div className="relative">
              <Guitar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Select
                value={gigInputs.category}
                onValueChange={(value) =>
                  setGigs((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Select your instrument" />
                </SelectTrigger>
                <SelectContent>
                  {individualInstruments.map((instrument) => (
                    <SelectItem key={instrument} value={instrument}>
                      {instrument.charAt(0).toUpperCase() + instrument.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.div variants={sectionVariants} className="pt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setisSchedulerOpen(true)}
            className={cn(
              "w-full py-3 px-6 rounded-lg font-medium shadow-lg transition-all",
              "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-xl"
            )}
          >
            Finalize & Schedule Gig
          </motion.button>
        </motion.div>
      </form>

      {/* Modals */}
      <AnimatePresence>
        {showcustomization && (
          <GigCustomization
            customization={gigcustom}
            setCustomization={setGigCustom}
            closeModal={() => setShowCustomization(false)}
            logo={imageUrl}
            handleFileChange={handleFileChange}
            isUploading={isUploading}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeTalentType && (
          <TalentModal
            isOpen={showTalentModal}
            onClose={() => setShowTalentModal(false)}
            talentType={activeTalentType}
            onSubmit={handleTalentSubmit}
            initialData={{
              ...(activeTalentType === "mc" && {
                mcType: gigInputs.mcType,
                mcLanguages: gigInputs.mcLanguages,
              }),
              ...(activeTalentType === "dj" && {
                djGenre: gigInputs.djGenre,
                djEquipment: gigInputs.djEquipment,
              }),
              ...(activeTalentType === "vocalist" && {
                vocalistGenre: gigInputs.vocalistGenre,
              }),
            }}
            errors={fieldErrors}
            validateField={(field, value) => {
              switch (field) {
                case "mcType":
                case "mcLanguages":
                  return !value ? `${field} is required` : "";
                case "djGenre":
                case "djEquipment":
                  return !value ? `${field} is required` : "";
                case "vocalistGenre":
                  return !value || (Array.isArray(value) && value.length === 0)
                    ? "At least one genre is required"
                    : "";
                default:
                  return "";
              }
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        <SchedulerComponent
          getScheduleData={getSchedulingData}
          isLoading={isLoading}
          isSchedulerOpen={isSchedulerOpen}
          setisSchedulerOpen={setisSchedulerOpen}
          onSubmit={handleSubmit}
        />
      </AnimatePresence>
    </div>
  );
}
