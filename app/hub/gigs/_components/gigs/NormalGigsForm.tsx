"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
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
  Palette,
  Tag,
  Globe,
  Shield,
  Star,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "sonner";

import { fileupload, MinimalUser } from "@/hooks/fileUpload";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

import {
  BusinessCategory,
  CategoryVisibility,
  CustomProps,
  TalentType,
  UserInfo,
} from "@/types/gig";
import { useNetworkStatus } from "@/hooks/useNetwork";
import {
  useGigData,
  useGigNotifications,
  useGigScheduler,
} from "@/app/stores/useGigStore";
import { OfflineNotification } from "./OfflineNotification";
import TalentModal from "./TalentModal";
import GigCustomization from "./GigCustomization";
import SchedulerComponent from "./SchedulerComponent";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { prepareGigDataForConvex } from "@/utils";
import { getGigDraftById, saveGigDraft } from "@/drafts";
import { MemoizedSwitch } from "./MemoizedSwitch";

// Update LocalGigInputs type to include duration fields
// Update LocalGigInputs type to include duration fields and negotiable
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
  // Add these with correct casing (lowercase)
  durationfrom: string;
  durationto: string;

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
  // Add negotiable field
  negotiable: boolean;
};

// Memoized Error Message Component
const ErrorMessage = React.memo(({ error }: { error: string | undefined }) => {
  if (!error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="text-sm text-red-500 mt-2 flex items-center gap-2 overflow-hidden"
    >
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{error}</span>
    </motion.div>
  );
});
ErrorMessage.displayName = "ErrorMessage";

// Memoized Input Component
const MemoizedInput = React.memo(
  ({
    value,
    onChange,
    onBlur,
    name,
    placeholder,
    type = "text",
    className = "",
    error,
    icon: Icon,
    ...props
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    name: string;
    placeholder: string;
    type?: string;
    className?: string;
    error?: string;
    icon?: any;
    [key: string]: any;
  }) => {
    return (
      <div>
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          )}
          <Input
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            name={name}
            type={type}
            placeholder={placeholder}
            className={cn(
              Icon ? "pl-10" : "",
              "py-3 rounded-xl border-2 transition-all",
              "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20",
              error ? "border-red-500" : "border-gray-200 dark:border-gray-800",
              className
            )}
            {...props}
          />
        </div>
        <ErrorMessage error={error} />
      </div>
    );
  }
);
MemoizedInput.displayName = "MemoizedInput";

// Memoized Textarea Component
const MemoizedTextarea = React.memo(
  ({
    value,
    onChange,
    onBlur,
    name,
    placeholder,
    className = "",
    error,
    rows = 4,
    ...props
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
    name: string;
    placeholder: string;
    className?: string;
    error?: string;
    rows?: number;
    [key: string]: any;
  }) => {
    return (
      <div>
        <Textarea
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          name={name}
          placeholder={placeholder}
          rows={rows}
          className={cn(
            "rounded-xl border-2 resize-none transition-all",
            "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20",
            error ? "border-red-500" : "border-gray-200 dark:border-gray-800",
            className
          )}
          {...props}
        />
        <ErrorMessage error={error} />
      </div>
    );
  }
);
MemoizedTextarea.displayName = "MemoizedTextarea";

export default function NormalGigsForm() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const { user } = useCurrentUser();
  const isOnline = useNetworkStatus();

  // Convex mutations
  const createGig = useMutation(api.controllers.gigs.createGig);

  // Refs for managing state without re-renders
  const fieldErrorsRef = useRef<Record<string, string>>({});

  const [formValues, setFormValues] = useState<LocalGigInputs>({
    title: "",
    description: "",
    phoneNo: "",
    price: "",
    category: "",
    location: "",
    secret: "",
    end: "",
    start: "",
    // Add these with initial values
    durationfrom: "am",
    durationto: "pm",

    bussinesscat: null,
    otherTimeline: "",
    gigtimeline: "",
    day: "",
    date: "",
    pricerange: "",
    currency: "KES",
    // Add negotiable with default value (true)
    negotiable: true,
  });

  // State that actually triggers re-renders
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [secretpass, setSecretPass] = useState<boolean>(false);
  const [showcustomization, setShowCustomization] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [imageUrl, setUrl] = useState<string>("");
  const [fileUrl, setFileUrl] = useState<string>("");
  const [editMessage, setEditMessage] = useState("");
  const [error, setError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Store state
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

  // Form display state (minimal re-renders)
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
  const [userinfo, setUserInfo] = useState<UserInfo>({
    prefferences: [],
  });
  const [schedulingProcedure, setSchedulingProcedure] = useState({
    type: "",
    date: new Date(),
  });

  // Field errors state - only for display
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [draftId, setDraftId] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const saveAsDraft = useCallback(async () => {
    try {
      setIsSavingDraft(true);

      const draftData = {
        ...formValues,

        mcType: formValues.mcType,
        mcLanguages: formValues.mcLanguages,
        djGenre: formValues.djGenre,
        djEquipment: formValues.djEquipment,
        vocalistGenre: formValues.vocalistGenre,
      };

      const savedDraft = saveGigDraft(draftData, draftId || undefined);
      setDraftId(savedDraft.id);

      toast.success("Draft saved successfully!", {
        description: "Your gig has been saved as a draft.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Failed to save draft", {
        description: "Please try again.",
        duration: 3000,
      });
    } finally {
      setIsSavingDraft(false);
    }
  }, [formValues, draftId]);
  // Update the auto-save notification
  useEffect(() => {
    // Auto-save after 30 seconds of inactivity
    const autoSaveTimer = setTimeout(() => {
      if (formValues.title || formValues.description) {
        saveAsDraft();
        toast.info("Auto-saved draft", {
          description: "Your progress has been automatically saved.",
          duration: 2000,
        });
      }
    }, 30000);

    return () => clearTimeout(autoSaveTimer);
  }, [formValues, saveAsDraft]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const draftIdParam = params.get("draft");

    if (draftIdParam) {
      const draft = getGigDraftById(draftIdParam);
      if (draft) {
        setDraftId(draft.id);

        // Cast draft data to include duration fields if they exist
        const draftData = draft.data as LocalGigInputs & {
          durationFrom?: string;
          durationTo?: string;
        };

        setFormValues(draftData);
        setBussinessCategory(draftData.bussinesscat);

        // Set talent-specific data
        if (draftData.bussinesscat === "mc") {
          setActiveTalentType("mc");
        } else if (draftData.bussinesscat === "dj") {
          setActiveTalentType("dj");
        } else if (draftData.bussinesscat === "vocalist") {
          setActiveTalentType("vocalist");
        }

        toast.success("Draft loaded", {
          description: "Your draft has been loaded successfully.",
          duration: 3000,
        });
      } else {
        toast.error("Draft not found", {
          description: "The requested draft could not be found.",
          duration: 3000,
        });
      }
    }
  }, []);

  // Business categories - memoized
  const businessCategories = useMemo(
    () => [
      { value: "full", label: "🎵 Full Band", icon: Users, color: "orange" },
      { value: "personal", label: "👤 Individual", icon: Music, color: "blue" },
      { value: "other", label: "🎭 Create Band", icon: Zap, color: "purple" },
      { value: "mc", label: "🎤 MC", icon: Mic, color: "red" },
      { value: "dj", label: "🎧 DJ", icon: Volume2, color: "pink" },
      { value: "vocalist", label: "🎤 Vocalist", icon: Music, color: "green" },
    ],
    []
  );

  const bandInstruments = useMemo(
    () => [
      { value: "vocalist", label: "Vocalist", icon: Mic },
      { value: "piano", label: "Piano", icon: Music },
      { value: "guitar", label: "Guitar", icon: Music },
      { value: "bass", label: "Bass Guitar", icon: Music },
      { value: "drums", label: "Drums", icon: Music },
      { value: "sax", label: "Saxophone", icon: Music },
      { value: "violin", label: "Violin", icon: Music },
      { value: "cello", label: "Cello", icon: Music },
      { value: "trumpet", label: "Trumpet", icon: Music },
      { value: "percussion", label: "Percussion", icon: Music },
    ],
    []
  );

  const individualInstruments = useMemo(
    () => [
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
    ],
    []
  );

  const days = useMemo(
    () => [
      { id: 1, val: "monday", name: "Monday" },
      { id: 2, val: "tuesday", name: "Tuesday" },
      { id: 3, val: "wednesday", name: "Wednesday" },
      { id: 4, val: "thursday", name: "Thursday" },
      { id: 5, val: "friday", name: "Friday" },
      { id: 6, val: "saturday", name: "Saturday" },
      { id: 7, val: "sunday", name: "Sunday" },
    ],
    []
  );

  const priceRanges = useMemo(
    () => [
      { value: "0", label: "Select range" },
      { value: "hundreds", label: "Hundreds (00)" },
      { value: "thousands", label: "Thousands (000)" },
      { value: "tensofthousands", label: "Tens of thousands (0000)" },
      { value: "hundredsofthousands", label: "Hundreds of thousands (00000)" },
      { value: "millions", label: "Millions (000000)" },
    ],
    []
  );

  // File upload handler
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
            toast.success("Logo uploaded successfully!");
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

  // Optimized input change handler
  const handleInputChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value } = e.target;

      // Update state for display
      setFormValues((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Clear error from ref
      if (fieldErrorsRef.current[name]) {
        delete fieldErrorsRef.current[name];
        // Only update display state if there was actually an error
        setFieldErrors((prev) => {
          if (prev[name]) {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
          }
          return prev;
        });
      }
    },
    []
  );

  // Handle input blur for validation
  const handleInputBlur = useCallback(
    (fieldName: string) => {
      // Validate on blur if needed
      const value = formValues[fieldName as keyof LocalGigInputs];
      if (!value && fieldName === "title") {
        fieldErrorsRef.current[fieldName] = "Title is required";
        setFieldErrors((prev) => ({
          ...prev,
          [fieldName]: "Title is required",
        }));
      }
    },
    [formValues]
  );

  // Handle business category change
  const handleBussinessChange = useCallback((value: BusinessCategory) => {
    setBussinessCategory(value);
    setFormValues((prev) => ({
      ...prev,
      bussinesscat: value,
      ...(value && !["mc", "dj", "vocalist"].includes(value)
        ? {
            mcType: undefined,
            mcLanguages: undefined,
            djGenre: undefined,
            djEquipment: undefined,
            vocalistGenre: undefined,
          }
        : {}),
    }));

    if (!["mc", "dj", "vocalist"].includes(value || "")) {
      setActiveTalentType(null);
      return;
    }

    const newTalentType = value as Exclude<TalentType, null>;
    setActiveTalentType(newTalentType);
    setShowTalentModal(true);
  }, []);

  // Handle Select changes (for Select components)
  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // Handle talent modal submit
  const handleTalentSubmit = useCallback(
    (data: Partial<LocalGigInputs>) => {
      setFormValues((prev) => ({
        ...prev,
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
      }));
      setShowTalentModal(false);
      toast.success("Talent details updated!");
    },
    [activeTalentType]
  );

  // Handle band instrument selection
  const handleInstrumentChange = useCallback((instrument: string) => {
    setUserInfo((prev) => ({
      prefferences: prev.prefferences.includes(instrument)
        ? prev.prefferences.filter((item) => item !== instrument)
        : [...prev.prefferences, instrument],
    }));
  }, []);

  // Handle date selection
  const handleDate = useCallback((date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      setFormValues((prev) => ({
        ...prev,
        date: date.toISOString(),
      }));
    }
  }, []);

  // Handle scheduling data
  const getSchedulingData = useCallback((type: string, date?: Date) => {
    setSchedulingProcedure({
      type,
      date: date ?? new Date(),
    });
  }, []);

  // Validation function
  const validateFields = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!formValues.title?.trim()) errors.title = "Title is required";
    if (!formValues.description?.trim())
      errors.description = "Description is required";
    if (!formValues.location?.trim()) errors.location = "Location is required";
    if (!bussinesscat) errors.bussinesscat = "Business category is required";

    if (bussinesscat === "mc") {
      if (!formValues.mcType) errors.mcType = "MC type is required";
      if (!formValues.mcLanguages)
        errors.mcLanguages = "Languages are required";
    } else if (bussinesscat === "dj") {
      if (!formValues.djGenre) errors.djGenre = "DJ genre is required";
      if (!formValues.djEquipment) errors.djEquipment = "Equipment is required";
    } else if (bussinesscat === "vocalist") {
      if (!formValues.vocalistGenre || formValues.vocalistGenre.length === 0) {
        errors.vocalistGenre = "At least one genre is required";
      }
    }

    fieldErrorsRef.current = errors;
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [bussinesscat, formValues]);

  // In your handleSubmit function
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateFields()) {
        setIsVisible(true);
        setError(true);
        setEditMessage("Please fill in all required fields");
        return;
      }

      if (!user?._id) {
        toast.error("You must be logged in to create a gig");
        return;
      }

      try {
        setIsLoading(true);

        const submissionData = prepareGigDataForConvex(
          formValues,
          user._id,
          gigcustom,
          imageUrl,
          schedulingProcedure
        );

        await createGig(submissionData);

        setEditMessage("Gig created successfully!");
        setError(false);
        setIsVisible(true);
        setRefetchData(true);

        setTimeout(() => {
          router.refresh();
        }, 2000);
      } catch (error) {
        console.error("Error creating gig:", error);
        setEditMessage("Failed to create gig. Please try again.");
        setError(true);
        setIsVisible(true);
      } finally {
        setIsLoading(false);
      }
    },
    [
      validateFields,
      user,
      gigcustom,
      imageUrl,
      schedulingProcedure,
      createGig,
      router,
      setRefetchData,
      formValues,
    ]
  );

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

  // Collapsible section component
  const CollapsibleSection = useCallback(
    ({
      title,
      icon: Icon,
      isOpen,
      onToggle,
      children,
      badge,
    }: {
      title: string;
      icon: any;
      isOpen: boolean;
      onToggle: () => void;
      children: React.ReactNode;
      badge?: string;
    }) => (
      <div className="mb-4">
        <div
          className={cn(
            "flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-300",
            colors.border,
            colors.backgroundMuted,
            isOpen
              ? "bg-gradient-to-r from-orange-500/5 to-red-500/5 border-orange-500/30"
              : "hover:bg-gradient-to-r hover:from-orange-500/5 hover:to-red-500/5 hover:border-orange-500/20"
          )}
          onClick={onToggle}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-lg",
                isOpen
                  ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-600"
                  : colors.hoverBg
              )}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <h3 className={cn("font-semibold", colors.text)}>{title}</h3>
              {badge && (
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    "bg-gradient-to-r from-orange-500/10 to-red-500/10",
                    "text-orange-700 dark:text-orange-300"
                  )}
                >
                  {badge}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOpen ? (
              <ChevronUp className={cn("w-5 h-5", colors.textMuted)} />
            ) : (
              <ChevronDown className={cn("w-5 h-5", colors.textMuted)} />
            )}
          </div>
        </div>

        <AnimatePresence initial={false}>
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
                  "p-4 border border-t-0 rounded-b-xl",
                  colors.border,
                  colors.backgroundMuted
                )}
              >
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    ),
    [colors]
  );

  // Talent preview component
  const TalentPreview = useCallback(() => {
    if (
      !formValues.mcType &&
      !formValues.djGenre &&
      !formValues.vocalistGenre?.length
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
          "relative overflow-hidden"
        )}
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full -translate-y-12 translate-x-12 blur-2xl" />

        <div className="flex justify-between items-center mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10">
              <Star className="w-5 h-5 text-orange-500" />
            </div>
            <h3 className={cn("font-semibold", colors.text)}>Talent Details</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={cn("text-sm", colors.hoverBg, "hover:text-orange-600")}
            onClick={() => {
              const type = formValues.mcType
                ? "mc"
                : formValues.djGenre
                  ? "dj"
                  : formValues.vocalistGenre?.length
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

        <div className="space-y-3 relative z-10">
          {formValues.mcType && (
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={cn(
                  "border-red-200 text-red-700 dark:border-red-800 dark:text-red-300",
                  "px-3 py-1 rounded-full font-medium"
                )}
              >
                MC: {formValues.mcType}
              </Badge>
              {formValues.mcLanguages && (
                <Badge
                  variant="outline"
                  className={cn(
                    "border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-300",
                    "px-3 py-1 rounded-full font-medium"
                  )}
                >
                  {formValues.mcLanguages}
                </Badge>
              )}
            </div>
          )}

          {formValues.djGenre && (
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={cn(
                  "border-pink-200 text-pink-700 dark:border-pink-800 dark:text-pink-300",
                  "px-3 py-1 rounded-full font-medium"
                )}
              >
                DJ: {formValues.djGenre}
              </Badge>
              {formValues.djEquipment && (
                <Badge
                  variant="outline"
                  className={cn(
                    "border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-300",
                    "px-3 py-1 rounded-full font-medium"
                  )}
                >
                  {formValues.djEquipment}
                </Badge>
              )}
            </div>
          )}

          {formValues.vocalistGenre?.length && (
            <div className="flex flex-wrap gap-2">
              {formValues.vocalistGenre.map((genre) => (
                <Badge
                  key={genre}
                  variant="outline"
                  className={cn(
                    "border-green-200 text-green-700 dark:border-green-800 dark:text-green-300",
                    "px-3 py-1 rounded-full font-medium"
                  )}
                >
                  {genre}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  }, [colors, formValues]);

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Success/Error Message */}
      <AnimatePresence initial={false}>
        {isVisible && editMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={cn(
              "fixed top-6 left-1/2 transform -translate-x-1/2 z-50 rounded-xl px-6 py-4 shadow-2xl backdrop-blur-sm",
              error
                ? "bg-gradient-to-r from-red-500/90 to-orange-500/90"
                : "bg-gradient-to-r from-emerald-500/90 to-green-500/90"
            )}
          >
            <div className="flex items-center gap-3">
              {error ? (
                <AlertCircle className="w-5 h-5 text-white" />
              ) : (
                <CheckCircle className="w-5 h-5 text-white" />
              )}
              <motion.span
                className="text-white font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {editMessage}
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Notification */}
      {showOfflineNotification && !isOnline && (
        <OfflineNotification
          onClose={() => setShowOfflineNotification(false)}
        />
      )}

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <h2 className={cn("text-2xl font-bold", colors.text)}>
              Create Your Gig
            </h2>
            <p className={cn("text-sm", colors.textMuted)}>
              Fill in the details to create an amazing gig opportunity
            </p>
          </div>
          <div
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium",
              "bg-gradient-to-r from-orange-500/10 to-red-500/10",
              "text-orange-700 dark:text-orange-300"
            )}
          >
            Step 1 of 3
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: "33%" }}
            animate={{ width: "66%" }}
            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Type Section */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className={cn("block text-lg font-semibold", colors.text)}>
                Who do you need for your gig?
              </label>
              <Tag className={cn("w-5 h-5", colors.textMuted)} />
            </div>
            <p className={cn("text-sm mb-6", colors.textMuted)}>
              Select the type of talent you're looking for
            </p>

            <Select
              value={bussinesscat || ""}
              onValueChange={(value) =>
                handleBussinessChange(value as BusinessCategory)
              }
            >
              <SelectTrigger
                className={cn(
                  "py-3 rounded-xl border-2",
                  colors.border,
                  colors.background,
                  colors.text,
                  "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20",
                  fieldErrors.bussinesscat && "border-red-500"
                )}
              >
                <SelectValue placeholder="Select business category" />
              </SelectTrigger>
              <SelectContent
                className={cn(
                  "rounded-xl border-2 shadow-lg",
                  colors.background,
                  colors.hoverBg
                )}
              >
                {businessCategories.map((category) => {
                  const Icon = category.icon;
                  const colorClass = {
                    orange: "bg-gradient-to-r from-orange-500 to-amber-500",
                    blue: "bg-gradient-to-r from-blue-500 to-cyan-500",
                    purple: "bg-gradient-to-r from-purple-500 to-pink-500",
                    red: "bg-gradient-to-r from-red-500 to-orange-500",
                    pink: "bg-gradient-to-r from-pink-500 to-rose-500",
                    green: "bg-gradient-to-r from-green-500 to-emerald-500",
                  }[category.color];

                  return (
                    <SelectItem
                      key={category.value}
                      value={category.value}
                      className={cn(
                        "py-3 rounded-lg my-1 mx-1 transition-all duration-200",
                        bussinesscat === category.value &&
                          colorClass + " text-white"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-lg",
                            bussinesscat === category.value
                              ? "bg-white/20"
                              : "bg-gradient-to-br from-orange-500/10 to-red-500/10"
                          )}
                        >
                          <Icon
                            className={cn(
                              "w-5 h-5",
                              bussinesscat === category.value
                                ? "text-white"
                                : colors.primary
                            )}
                          />
                        </div>
                        <span className="font-medium">{category.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <ErrorMessage error={fieldErrors.bussinesscat} />
          </div>

          <TalentPreview />
        </div>

        {/* Customize Button */}
        <div className="flex justify-between items-center">
          <Button
            onClick={() => setShowCustomization(true)}
            type="button"
            variant="outline"
            className={cn(
              "flex items-center gap-3 border-2 group px-6 py-6 rounded-xl",
              colors.border,
              colors.hoverBg,
              "hover:border-orange-500 hover:shadow-lg"
            )}
          >
            <Palette
              className={cn(
                "w-5 h-5 transition-transform group-hover:scale-110",
                colors.primary
              )}
            />
            <div className="text-left">
              <span className="block font-semibold">Customize Gig Card</span>
              <span className={cn("text-xs block", colors.textMuted)}>
                Add your logo, colors, and branding
              </span>
            </div>
          </Button>
        </div>

        {/* Title Section */}
        <CollapsibleSection
          title="Gig Information"
          icon={Type}
          isOpen={showCategories.title}
          onToggle={() =>
            setshowCategories((prev) => ({ ...prev, title: !prev.title }))
          }
          badge="Required"
        >
          <div className="space-y-6">
            {/* Secret Passphrase */}
            <div>
              <label
                className={cn("block text-sm font-medium mb-3", colors.text)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4" />
                  Secret Passphrase (Optional)
                </div>
                <span className={cn("text-xs", colors.textMuted)}>
                  Add a secret word for exclusive access
                </span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  {secretpass ? (
                    <EyeOff className={cn("w-5 h-5", colors.textMuted)} />
                  ) : (
                    <Eye className={cn("w-5 h-5", colors.textMuted)} />
                  )}
                </div>
                <MemoizedInput
                  type={secretpass ? "text" : "password"}
                  value={formValues.secret}
                  onChange={handleInputChange}
                  onBlur={() => handleInputBlur("secret")}
                  name="secret"
                  placeholder="Enter secret passphrase"
                  error={fieldErrors.secret}
                  className="pl-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setSecretPass(!secretpass)}
                  className={cn(
                    "absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg",
                    colors.hoverBg
                  )}
                >
                  {secretpass ? (
                    <EyeOff className={cn("w-4 h-4", colors.textMuted)} />
                  ) : (
                    <Eye className={cn("w-4 h-4", colors.textMuted)} />
                  )}
                </button>
              </div>
            </div>

            {/* Gig Title */}
            <div>
              <label
                className={cn("block text-sm font-medium mb-3", colors.text)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Tag className="w-4 h-4" />
                  Gig Title *
                </div>
                <span className={cn("text-xs", colors.textMuted)}>
                  Make it catchy and descriptive
                </span>
              </label>
              <MemoizedInput
                value={formValues.title}
                onChange={handleInputChange}
                onBlur={() => handleInputBlur("title")}
                name="title"
                placeholder="e.g., 'Live Jazz Band Needed for Wedding Reception'"
                error={fieldErrors.title}
              />
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
          badge="Required"
        >
          <div>
            <label
              className={cn("block text-sm font-medium mb-3", colors.text)}
            >
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4" />
                Gig Description *
              </div>
              <span className={cn("text-xs", colors.textMuted)}>
                Describe the event, vibe, and specific requirements
              </span>
            </label>
            <MemoizedTextarea
              value={formValues.description}
              onChange={handleInputChange}
              onBlur={() => handleInputBlur("description")}
              name="description"
              placeholder="We're looking for a professional jazz band for our wedding reception. The event will have 150 guests and we'd love a mix of classic jazz standards and modern arrangements. Please include details about your equipment needs..."
              rows={6}
              error={fieldErrors.description}
            />
            <div className="flex justify-between items-center mt-2">
              <div />
              <span className={cn("text-xs", colors.textMuted)}>
                {formValues.description.length}/500 characters
              </span>
            </div>
          </div>
        </CollapsibleSection>

        {/* Business Information Section */}
        <CollapsibleSection
          title="Business Information"
          icon={Briefcase}
          isOpen={showCategories.business}
          onToggle={() =>
            setshowCategories((prev) => ({ ...prev, business: !prev.business }))
          }
          badge="Required"
        >
          <div className="space-y-6">
            {/* Contact Information */}
            <div>
              <label
                className={cn("block text-sm font-medium mb-3", colors.text)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="w-4 h-4" />
                  Contact Information
                </div>
                <span className={cn("text-xs", colors.textMuted)}>
                  Your phone number for inquiries
                </span>
              </label>
              <MemoizedInput
                type="tel"
                value={formValues.phoneNo}
                onChange={handleInputChange}
                onBlur={() => handleInputBlur("phoneNo")}
                name="phoneNo"
                placeholder="+254 7XX XXX XXX"
                icon={Phone}
              />
            </div>

            {/* Price Information */}
            <div>
              <label
                className={cn("block text-sm font-medium mb-4", colors.text)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4" />
                  Budget Information
                </div>
                <span className={cn("text-xs", colors.textMuted)}>
                  Set your budget range and currency
                </span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Currency */}
                <div>
                  <label
                    className={cn(
                      "block text-xs font-medium mb-2",
                      colors.textMuted
                    )}
                  >
                    Currency
                  </label>
                  <Select
                    value={formValues.currency}
                    onValueChange={(value) =>
                      handleSelectChange("currency", value)
                    }
                  >
                    <SelectTrigger className="rounded-xl py-3">
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

                {/* Price */}
                <div>
                  <label
                    className={cn(
                      "block text-xs font-medium mb-2",
                      colors.textMuted
                    )}
                  >
                    Amount
                  </label>
                  <MemoizedInput
                    type="number"
                    value={formValues.price}
                    onChange={handleInputChange}
                    onBlur={() => handleInputBlur("price")}
                    name="price"
                    placeholder="15000"
                    icon={DollarSign}
                    min="0"
                  />
                </div>

                {/* Price Range */}
                <div>
                  <label
                    className={cn(
                      "block text-xs font-medium mb-2",
                      colors.textMuted
                    )}
                  >
                    Price Range
                  </label>
                  <Select
                    value={formValues.pricerange}
                    onValueChange={(value) =>
                      handleSelectChange("pricerange", value)
                    }
                  >
                    <SelectTrigger className="rounded-xl py-3">
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

              {/* Price Summary */}
              {(formValues.price || formValues.pricerange !== "0") && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "rounded-xl p-4 border mt-4",
                    colors.border,
                    colors.backgroundMuted
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10">
                      <TrendingUp className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <span className={cn("text-sm font-medium", colors.text)}>
                        Budget Estimate:
                      </span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className={cn("text-xl font-bold", colors.text)}>
                          {formValues.currency === "USD" && "$"}
                          {formValues.currency === "EUR" && "€"}
                          {formValues.currency === "GBP" && "£"}
                          {formValues.currency === "KES" && "KSh"}
                          {formValues.currency === "NGN" && "₦"}
                          {formValues.price || "---"}
                        </span>
                        {formValues.pricerange !== "0" &&
                          formValues.pricerange && (
                            <span className={cn("text-sm", colors.textMuted)}>
                              ({formValues.pricerange})
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </CollapsibleSection>
        <MemoizedSwitch
          checked={formValues.negotiable}
          onChange={(checked) =>
            setFormValues((prev) => ({ ...prev, negotiable: checked }))
          }
          label="Price Negotiable"
          description="Allow applicants to negotiate the price"
          icon={DollarSign}
          colors={colors}
        />
        {/* Gig Timeline Section */}
        <CollapsibleSection
          title="Event Details"
          icon={Calendar}
          isOpen={showCategories.gtimeline}
          onToggle={() =>
            setshowCategories((prev) => ({
              ...prev,
              gtimeline: !prev.gtimeline,
            }))
          }
          badge="Required"
        >
          <div className="space-y-6">
            {/* Location */}
            <div>
              <label
                className={cn("block text-sm font-medium mb-3", colors.text)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4" />
                  Location *
                </div>
                <span className={cn("text-xs", colors.textMuted)}>
                  Venue address or city
                </span>
              </label>
              <MemoizedInput
                type="text"
                value={formValues.location}
                onChange={handleInputChange}
                onBlur={() => handleInputBlur("location")}
                name="location"
                placeholder="e.g., 'Nairobi City Center' or 'Sarova Stanley Hotel'"
                error={fieldErrors.location}
                icon={MapPin}
              />
            </div>

            {/* Timeline Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gig Type */}
              <div>
                <label
                  className={cn("block text-sm font-medium mb-3", colors.text)}
                >
                  Gig Type
                </label>
                <Select
                  value={formValues.gigtimeline}
                  onValueChange={(value) =>
                    handleSelectChange("gigtimeline", value)
                  }
                >
                  <SelectTrigger className="rounded-xl py-3">
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent className={cn(colors.background)}>
                    <SelectItem value="once">🎯 One-time event</SelectItem>
                    <SelectItem value="weekly">🔄 Weekly recurring</SelectItem>
                    <SelectItem value="monthly">
                      📅 Monthly recurring
                    </SelectItem>
                    <SelectItem value="other">✨ Custom schedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Day of Week */}
              <div>
                <label
                  className={cn("block text-sm font-medium mb-3", colors.text)}
                >
                  Day of Week
                </label>
                <Select
                  value={formValues.day}
                  onValueChange={(value) => handleSelectChange("day", value)}
                >
                  <SelectTrigger className="rounded-xl py-3">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((day) => (
                      <SelectItem key={day.id} value={day.val}>
                        {day.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Custom Timeline */}
            {formValues.gigtimeline === "other" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <label
                  className={cn("block text-sm font-medium mb-3", colors.text)}
                >
                  Custom Timeline Details
                </label>
                <MemoizedInput
                  type="text"
                  value={formValues.otherTimeline}
                  onChange={handleInputChange}
                  onBlur={() => handleInputBlur("otherTimeline")}
                  name="otherTimeline"
                  placeholder="Describe your custom schedule..."
                />
              </motion.div>
            )}

            {/* Event Date for one-time events */}
            {formValues.gigtimeline === "once" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <label
                  className={cn("block text-sm font-medium mb-3", colors.text)}
                >
                  Event Date
                </label>
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDate}
                  className={cn(
                    "w-full px-4 py-3 border rounded-xl",
                    colors.border,
                    colors.background,
                    colors.text
                  )}
                  placeholderText="Select a date"
                  isClearable
                  minDate={new Date()}
                  dateFormat="MMMM d, yyyy"
                />
              </motion.div>
            )}
          </div>
        </CollapsibleSection>

        {/* Duration Section */}

        <div>
          {showduration ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className={cn(
                "rounded-xl border overflow-hidden",
                colors.border,
                colors.backgroundMuted
              )}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10">
                      <Clock className={cn("w-5 h-5", colors.primary)} />
                    </div>
                    <div>
                      <h3 className={cn("font-semibold", colors.text)}>
                        Set Duration
                      </h3>
                      <p className={cn("text-sm", colors.textMuted)}>
                        Specify when the gig starts and ends
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setshowduration(false)}
                    className={cn(
                      "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800",
                      colors.textMuted
                    )}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      className={cn(
                        "block text-sm font-medium mb-3",
                        colors.text
                      )}
                    >
                      Start Time
                    </label>
                    <div className="flex gap-3">
                      <MemoizedInput
                        type="text"
                        value={formValues.start}
                        onChange={handleInputChange}
                        onBlur={() => handleInputBlur("start")}
                        name="start"
                        placeholder="10"
                      />
                      <Select
                        value={formValues.durationfrom}
                        onValueChange={(value) =>
                          handleSelectChange("durationfrom", value)
                        }
                      >
                        <SelectTrigger className="w-24 rounded-xl py-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="am">AM</SelectItem>
                          <SelectItem value="pm">PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label
                      className={cn(
                        "block text-sm font-medium mb-3",
                        colors.text
                      )}
                    >
                      End Time
                    </label>
                    <div className="flex gap-3">
                      <MemoizedInput
                        type="text"
                        value={formValues.end}
                        onChange={handleInputChange}
                        onBlur={() => handleInputBlur("end")}
                        name="end"
                        placeholder="12"
                      />
                      <Select
                        value={formValues.durationto}
                        onValueChange={(value) =>
                          handleSelectChange("durationto", value)
                        }
                      >
                        <SelectTrigger className="w-24 rounded-xl py-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="am">AM</SelectItem>
                          <SelectItem value="pm">PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <p className={cn("text-sm text-center", colors.textMuted)}>
                    Duration: {formValues.start} - {formValues.end}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div
              onClick={() => setshowduration(true)}
              className={cn(
                "flex justify-between items-center p-6 rounded-xl border cursor-pointer transition-all group",
                colors.border,
                colors.backgroundMuted,
                "hover:shadow-lg hover:border-orange-500/50"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-3 rounded-lg transition-transform group-hover:scale-110",
                    "bg-gradient-to-r from-orange-500/10 to-red-500/10"
                  )}
                >
                  <Clock className={cn("w-5 h-5", colors.primary)} />
                </div>
                <div>
                  <h3 className={cn("font-semibold", colors.text)}>
                    Add Duration
                  </h3>
                  <p className={cn("text-sm", colors.textMuted)}>
                    Specify when the gig starts and ends
                  </p>
                </div>
              </div>
              <div
                className={cn(
                  "p-2 rounded-lg transition-all group-hover:bg-orange-500/10",
                  colors.hoverBg
                )}
              >
                <ChevronDown className={cn("w-5 h-5", colors.textMuted)} />
              </div>
            </div>
          )}
        </div>

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
            <div>
              <p className={cn("text-sm mb-4", colors.textMuted)}>
                Select the instruments needed for your band
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {bandInstruments.map((instrument) => (
                  <div
                    key={instrument.value}
                    className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all hover:scale-105"
                    onClick={() => handleInstrumentChange(instrument.value)}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center transition-all",
                        userinfo.prefferences.includes(instrument.value)
                          ? "bg-gradient-to-r from-orange-500 to-red-500 border-transparent"
                          : colors.border
                      )}
                    >
                      {userinfo.prefferences.includes(instrument.value) && (
                        <CheckCircle className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <label
                      className={cn(
                        "text-sm cursor-pointer flex-1",
                        colors.text,
                        userinfo.prefferences.includes(instrument.value) &&
                          "font-semibold"
                      )}
                    >
                      {instrument.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleSection>
        )}

        {/* Individual Instrument Selection */}
        {bussinesscat === "personal" && (
          <div>
            <div className="relative">
              <Guitar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Select
                value={formValues.category}
                onValueChange={(value) => handleSelectChange("category", value)}
              >
                <SelectTrigger className="pl-12 py-3 rounded-xl">
                  <SelectValue placeholder="Select your instrument" />
                </SelectTrigger>
                <SelectContent className={cn(colors.backgroundMuted)}>
                  {individualInstruments.map((instrument) => (
                    <SelectItem key={instrument} value={instrument}>
                      {instrument.charAt(0).toUpperCase() + instrument.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-8 border-t">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="button"
              onClick={() => setisSchedulerOpen(true)}
              className={cn(
                "flex-1 py-6 rounded-xl font-semibold text-lg transition-all duration-300",
                "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600",
                "text-white shadow-xl hover:shadow-2xl hover:scale-105"
              )}
            >
              <span className="flex items-center justify-center gap-3">
                <Calendar className="w-5 h-5" />
                Finalize & Schedule Gig
              </span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={saveAsDraft}
              disabled={isSavingDraft}
              className={cn(
                "py-6 rounded-xl font-medium transition-all",
                colors.border,
                colors.hoverBg,
                "hover:border-orange-500",
                isSavingDraft && "opacity-50 cursor-not-allowed"
              )}
            >
              {isSavingDraft ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save as Draft
                </>
              )}
            </Button>
          </div>

          <p className={cn("text-center text-sm mt-4", colors.textMuted)}>
            By creating this gig, you agree to our terms and conditions
          </p>
        </div>
      </form>

      {/* Modals */}
      <AnimatePresence initial={false}>
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

      <AnimatePresence initial={false}>
        {activeTalentType && (
          <TalentModal
            isOpen={showTalentModal}
            onClose={() => setShowTalentModal(false)}
            talentType={activeTalentType}
            onSubmit={handleTalentSubmit}
            initialData={{
              ...(activeTalentType === "mc" && {
                mcType: formValues.mcType,
                mcLanguages: formValues.mcLanguages,
              }),
              ...(activeTalentType === "dj" && {
                djGenre: formValues.djGenre,
                djEquipment: formValues.djEquipment,
              }),
              ...(activeTalentType === "vocalist" && {
                vocalistGenre: formValues.vocalistGenre,
              }),
            }}
            errors={fieldErrors}
            validateField={(field: string, value: string) => {
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

      <AnimatePresence initial={false}>
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
