"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  Suspense,
} from "react";
import { useRouter, useParams } from "next/navigation";
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
  Shield,
  Star,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Music as MusicIcon,
  Drum,
  Piano,
  Search,
  Check,
  Info,
  Edit,
  Loader2,
  History,
  RefreshCw,
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

// Types
import {
  BandRoleInput,
  BusinessCategory,
  CategoryVisibility,
  CustomProps,
  TalentType,
  UserInfo,
} from "@/types/gig";

// Convex
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Custom hooks and components
import { useNetworkStatus } from "@/hooks/useNetwork";

import { GiTrumpet, GiViolin } from "react-icons/gi";
import { prepareGigDataForConvex } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// Memoized components
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
    required = false,
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
    required?: boolean;
    icon?: any;
    [key: string]: any;
  }) => {
    return (
      <div>
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          )}
          {required && (
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 text-xs">
              *
            </span>
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
              required ? "pr-10" : "",
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

const HistoryView = React.memo(({ gig }: { gig: any }) => {
  if (!gig.bookingHistory || gig.bookingHistory.length === 0) {
    return (
      <div className="text-center py-8">
        <History className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">
          No booking history yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Booking History</h3>
      <div className="space-y-3">
        {gig.bookingHistory
          .sort((a: any, b: any) => b.timestamp - a.timestamp)
          .map((entry: any, index: number) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        entry.status === "booked"
                          ? "default"
                          : entry.status === "cancelled"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {entry.status}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {entry.userRole && (
                    <Badge variant="secondary">{entry.userRole}</Badge>
                  )}
                </div>
                <p className="text-sm">{entry.notes}</p>
                {entry.agreedPrice && (
                  <p className="text-sm font-medium mt-2">
                    Price: {entry.currency || "$"}
                    {entry.agreedPrice}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
});
HistoryView.displayName = "HistoryView";

export default function EditGigForm() {
  const router = useRouter();
  const params = useParams();
  const gigId = params.id as Id<"gigs">;

  const { colors } = useThemeColors();
  const { user } = useCurrentUser();
  const isOnline = useNetworkStatus();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formValues, setFormValues] = useState<any>(null);
  const [originalValues, setOriginalValues] = useState<any>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showTalentModal, setShowTalentModal] = useState(false);
  const [activeTalentType, setActiveTalentType] = useState<TalentType>(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const [showBandSetupModal, setShowBandSetupModal] = useState(false);
  const [gigcustom, setGigCustom] = useState<CustomProps>({
    fontColor: "",
    font: "",
    backgroundColor: "",
  });
  const [imageUrl, setUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [bandRoles, setBandRoles] = useState<BandRoleInput[]>([]);
  const [bussinesscat, setBussinessCategory] = useState<BusinessCategory>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [schedulingProcedure, setSchedulingProcedure] = useState({
    type: "",
    date: new Date(),
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [secretpass, setSecretPass] = useState<boolean>(false);

  // Convex queries and mutations
  const gig = useQuery(api.controllers.gigs.getGigById, {
    gigId,
  });

  const updateGig = useMutation(api.controllers.gigs.updateGig);
  const deleteGig = useMutation(api.controllers.gigs.deleteGig);

  // Check if user is the owner
  const isOwner = useMemo(() => {
    return user?._id === gig?.postedBy;
  }, [user, gig]);

  // Initialize form from gig data
  useEffect(() => {
    if (gig && !formValues) {
      const formattedValues = {
        title: gig.title || "",
        description: gig.description || "",
        phoneNo: gig.phone || "",
        price: gig.price?.toString() || "",
        category: gig.category || "",
        location: gig.location || "",
        secret: gig.secret || "",
        end: gig.time?.end || "",
        start: gig.time?.start || "",
        durationfrom: gig.time?.durationFrom || "am",
        durationto: gig.time?.durationTo || "pm",
        bussinesscat: gig.bussinesscat as BusinessCategory,
        otherTimeline: gig.otherTimeline || "",
        gigtimeline: gig.gigtimeline || "",
        day: gig.day || "",
        date: gig.date ? new Date(gig.date).toISOString().split("T")[0] : "",
        pricerange: gig.pricerange || "",
        currency: gig.currency || "KES",
        negotiable: gig.negotiable ?? true,
        mcType: gig.mcType || "",
        mcLanguages: gig.mcLanguages || "",
        djGenre: gig.djGenre || "",
        djEquipment: gig.djEquipment || "",
        vocalistGenre: gig.vocalistGenre || [],
        acceptInterestEndTime: gig.acceptInterestEndTime
          ? new Date(gig.acceptInterestEndTime).toISOString().slice(0, 16)
          : "",
        acceptInterestStartTime: gig.acceptInterestStartTime
          ? new Date(gig.acceptInterestStartTime).toISOString().slice(0, 16)
          : "",
        interestWindowDays:
          gig.acceptInterestStartTime && gig.acceptInterestEndTime
            ? Math.round(
                (gig.acceptInterestEndTime - gig.acceptInterestStartTime) /
                  (1000 * 60 * 60 * 24)
              )
            : 7,
        enableInterestWindow: !!(
          gig.acceptInterestStartTime || gig.acceptInterestEndTime
        ),
        maxSlots: gig.maxSlots || 1,
      };

      setFormValues(formattedValues);
      setOriginalValues(formattedValues);
      setBussinessCategory(gig.bussinesscat as BusinessCategory);
      setGigCustom({
        fontColor: gig.fontColor || "",
        font: gig.font || "",
        backgroundColor: gig.backgroundColor || "",
      });
      setUrl(gig.logo || "");
      const bandRolesFromGig =
        gig.bandCategory?.map((role: any) => ({
          role: role.role,
          maxSlots: role.maxSlots,
          requiredSkills: role.requiredSkills || [], // Default to empty array
          description: role.description,
          price: role.price,
          currency: role.currency,
          negotiable: role.negotiable,
          // Don't include fields that are not in BandRoleInput
        })) || [];

      setBandRoles(bandRolesFromGig);

      if (gig.date) {
        setSelectedDate(new Date(gig.date));
      }

      setIsLoading(false);
    }
  }, [gig]);

  // Check for changes
  useEffect(() => {
    if (formValues && originalValues) {
      const hasChanges =
        JSON.stringify(formValues) !== JSON.stringify(originalValues) ||
        JSON.stringify(gigcustom) !==
          JSON.stringify({
            fontColor: gig?.fontColor || "",
            font: gig?.font || "",
            backgroundColor: gig?.backgroundColor || "",
          }) ||
        JSON.stringify(bandRoles) !== JSON.stringify(gig?.bandCategory || []);

      setHasChanges(hasChanges);
    }
  }, [formValues, originalValues, gigcustom, bandRoles, gig]);

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
            toast.success("Logo updated successfully!");
            setHasChanges(true);
          }
        },
        toast,
        allowedTypes,
        imageUrl,
        (file: string | undefined) => {
          if (file) {
            // Handle file URL if needed
          }
        },
        setIsUploading,
        dep,
        minimalUser
      );
    },
    [imageUrl, user]
  );

  // Input change handler
  const handleInputChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value, type } = e.target;

      if (type === "checkbox") {
        const checked = (e.target as HTMLInputElement).checked;
        setFormValues((prev: any) => ({
          ...prev,
          [name]: checked,
        }));
      } else {
        setFormValues((prev: any) => ({
          ...prev,
          [name]: value,
        }));
      }

      // Clear error
      if (fieldErrors[name]) {
        setFieldErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [fieldErrors]
  );

  // Select change handler
  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormValues((prev: any) => ({
      ...prev,
      [name]: value,
    }));
    setHasChanges(true);
  }, []);

  // Business category change
  const handleBussinessChange = useCallback((value: BusinessCategory) => {
    setBussinessCategory(value);
    setFormValues((prev: any) => ({
      ...prev,
      bussinesscat: value,
    }));
    setHasChanges(true);
  }, []);

  // Band setup handlers
  const handleBandSetupSubmit = useCallback((roles: BandRoleInput[]) => {
    setBandRoles(roles);
    setHasChanges(true);
    toast.success(
      `Band setup updated! ${roles.length} role${roles.length !== 1 ? "s" : ""} selected.`
    );
  }, []);

  // Talent modal handlers
  const handleTalentSubmit = useCallback(
    (data: any) => {
      setFormValues((prev: any) => ({
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
      setHasChanges(true);
      toast.success("Talent details updated!");
    },
    [activeTalentType]
  );

  // Date selection
  const handleDate = useCallback((date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      setFormValues((prev: any) => ({
        ...prev,
        date: date.toISOString().split("T")[0],
      }));
      setHasChanges(true);
    }
  }, []);

  // Validate form
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!formValues.title?.trim()) {
      errors.title = "Title is required";
    }
    if (!formValues.description?.trim()) {
      errors.description = "Description is required";
    }
    if (!formValues.location?.trim()) {
      errors.location = "Location is required";
    }
    if (!formValues.bussinesscat) {
      errors.bussinesscat = "Business category is required";
    }

    // Category-specific validations
    if (formValues.bussinesscat === "mc") {
      if (!formValues.mcType) errors.mcType = "MC type is required";
      if (!formValues.mcLanguages)
        errors.mcLanguages = "Languages are required";
    } else if (formValues.bussinesscat === "dj") {
      if (!formValues.djGenre) errors.djGenre = "DJ genre is required";
      if (!formValues.djEquipment) errors.djEquipment = "Equipment is required";
    } else if (formValues.bussinesscat === "vocalist") {
      if (!formValues.vocalistGenre || formValues.vocalistGenre.length === 0) {
        errors.vocalistGenre = "At least one genre is required";
      }
    }

    // Timeline validations
    if (formValues.gigtimeline === "once" && !formValues.date) {
      errors.date = "Event date is required for one-time events";
    } else if (formValues.gigtimeline !== "once" && !formValues.day) {
      errors.day = "Day of week is required for recurring events";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formValues]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      toast.error("Please fix all errors before saving");
      return;
    }

    if (!user?._id || !gigId) {
      toast.error("Authentication error");
      return;
    }

    setIsSaving(true);
    try {
      // Prepare update data
      const updateData = {
        gigId,
        title: formValues.title,
        description: formValues.description,
        phone: formValues.phoneNo,
        price: formValues.price ? parseFloat(formValues.price) : undefined,
        category: formValues.category,
        location: formValues.location,
        secret: formValues.secret,
        bussinesscat: formValues.bussinesscat,
        otherTimeline: formValues.otherTimeline,
        gigtimeline: formValues.gigtimeline,
        day: formValues.day,
        date: formValues.date ? new Date(formValues.date).getTime() : gig.date,
        pricerange: formValues.pricerange,
        currency: formValues.currency,
        negotiable: formValues.negotiable,
        mcType: formValues.mcType,
        mcLanguages: formValues.mcLanguages,
        djGenre: formValues.djGenre,
        djEquipment: formValues.djEquipment,
        vocalistGenre: formValues.vocalistGenre,
        acceptInterestEndTime: formValues.acceptInterestEndTime
          ? new Date(formValues.acceptInterestEndTime).getTime()
          : undefined,
        acceptInterestStartTime: formValues.acceptInterestStartTime
          ? new Date(formValues.acceptInterestStartTime).getTime()
          : undefined,
        maxSlots: formValues.maxSlots
          ? parseInt(formValues.maxSlots)
          : undefined,
        font: gigcustom.font,
        fontColor: gigcustom.fontColor,
        backgroundColor: gigcustom.backgroundColor,
        logo: imageUrl,
        bandCategory: bussinesscat === "other" ? bandRoles : undefined,
        time: {
          start: formValues.start,
          end: formValues.end,
          durationFrom: formValues.durationfrom,
          durationTo: formValues.durationto,
        },
      };

      await updateGig(updateData);

      // Update original values
      setOriginalValues(formValues);
      setHasChanges(false);

      toast.success("Gig updated successfully!");
      setShowSaveConfirm(false);

      // Refresh the page data
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (error) {
      console.error("Error updating gig:", error);
      toast.error("Failed to update gig. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [
    formValues,
    gigcustom,
    imageUrl,
    bandRoles,
    bussinesscat,
    user,
    gigId,
    validateForm,
    updateGig,
    router,
    gig?.date,
  ]);

  // Handle delete
  const handleDelete = useCallback(async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this gig? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteGig({ gigId });
      toast.success("Gig deleted successfully");
      router.push("/hub/gigs");
    } catch (error) {
      console.error("Error deleting gig:", error);
      toast.error("Failed to delete gig");
    }
  }, [deleteGig, gigId, router]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (hasChanges) {
      setShowCancelConfirm(true);
    } else {
      router.back();
    }
  }, [hasChanges, router]);

  // Confirm cancel
  const confirmCancel = useCallback(() => {
    if (formValues && originalValues) {
      setFormValues(originalValues);
    }
    setGigCustom({
      fontColor: gig?.fontColor || "",
      font: gig?.font || "",
      backgroundColor: gig?.backgroundColor || "",
    });
    setUrl(gig?.logo || "");
    const bandRolesFromGig =
      gig.bandCategory?.map((role: any) => ({
        role: role.role,
        maxSlots: role.maxSlots,
        requiredSkills: role.requiredSkills || [], // Default to empty array
        description: role.description,
        price: role.price,
        currency: role.currency,
        negotiable: role.negotiable,
        // Don't include fields that are not in BandRoleInput
      })) || [];

    setBandRoles(bandRolesFromGig);
    setHasChanges(false);
    setShowCancelConfirm(false);
    router.back();
  }, [formValues, originalValues, gig, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading gig data...
          </p>
        </div>
      </div>
    );
  }

  // Not found
  if (!gig) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Gig Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The gig you're trying to edit doesn't exist or you don't have
            permission to edit it.
          </p>
          <Button onClick={() => router.push("/hub/gigs")}>Back to Gigs</Button>
        </div>
      </div>
    );
  }

  // Not owner
  if (!isOwner) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have permission to edit this gig.
          </p>
          <Button onClick={() => router.push("/hub/gigs")}>Back to Gigs</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleCancel} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Edit Gig</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {gig.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {hasChanges && (
                <Badge variant="outline" className="animate-pulse">
                  Unsaved Changes
                </Badge>
              )}
              <Button
                variant="outline"
                onClick={() => setShowSaveConfirm(true)}
                disabled={!hasChanges || isSaving}
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="customize">Customize</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <MemoizedInput
                      id="title"
                      value={formValues.title}
                      onChange={handleInputChange}
                      name="title"
                      placeholder="Gig title"
                      error={fieldErrors.title}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <MemoizedTextarea
                      id="description"
                      value={formValues.description}
                      onChange={handleInputChange}
                      name="description"
                      placeholder="Describe your gig"
                      rows={6}
                      error={fieldErrors.description}
                      required
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <MemoizedInput
                      id="location"
                      value={formValues.location}
                      onChange={handleInputChange}
                      name="location"
                      placeholder="Event location"
                      icon={MapPin}
                      error={fieldErrors.location}
                      required
                    />
                  </div>

                  {/* Business Category */}
                  <div>
                    <Label>Business Category</Label>
                    <Select
                      value={bussinesscat || ""}
                      onValueChange={(value) =>
                        handleBussinessChange(value as BusinessCategory)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Band</SelectItem>
                        <SelectItem value="personal">Individual</SelectItem>
                        <SelectItem value="other">Create Band</SelectItem>
                        <SelectItem value="mc">MC</SelectItem>
                        <SelectItem value="dj">DJ</SelectItem>
                        <SelectItem value="vocalist">Vocalist</SelectItem>
                      </SelectContent>
                    </Select>
                    <ErrorMessage error={fieldErrors.bussinesscat} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Contact Info */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Contact Information
                    </h3>
                    <MemoizedInput
                      value={formValues.phoneNo}
                      onChange={handleInputChange}
                      name="phoneNo"
                      placeholder="Phone number"
                      icon={Phone}
                    />
                  </div>

                  {/* Price Info */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Price Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Currency</Label>
                        <Select
                          value={formValues.currency}
                          onValueChange={(value) =>
                            handleSelectChange("currency", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
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
                        <Label>Amount</Label>
                        <MemoizedInput
                          type="number"
                          value={formValues.price}
                          onChange={handleInputChange}
                          name="price"
                          placeholder="Amount"
                          icon={DollarSign}
                        />
                      </div>
                      <div>
                        <Label>Price Range</Label>
                        <Select
                          value={formValues.pricerange}
                          onValueChange={(value) =>
                            handleSelectChange("pricerange", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Select range</SelectItem>
                            <SelectItem value="hundreds">
                              Hundreds (00)
                            </SelectItem>
                            <SelectItem value="thousands">
                              Thousands (000)
                            </SelectItem>
                            <SelectItem value="tensofthousands">
                              Tens of thousands (0000)
                            </SelectItem>
                            <SelectItem value="hundredsofthousands">
                              Hundreds of thousands (00000)
                            </SelectItem>
                            <SelectItem value="millions">
                              Millions (000000)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Timeline</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Gig Type</Label>
                        <Select
                          value={formValues.gigtimeline}
                          onValueChange={(value) =>
                            handleSelectChange("gigtimeline", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select timeline" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="once">One-time event</SelectItem>
                            <SelectItem value="weekly">
                              Weekly recurring
                            </SelectItem>
                            <SelectItem value="monthly">
                              Monthly recurring
                            </SelectItem>
                            <SelectItem value="other">
                              Custom schedule
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {formValues.gigtimeline !== "once" && (
                        <div>
                          <Label>Day of Week</Label>
                          <Select
                            value={formValues.day}
                            onValueChange={(value) =>
                              handleSelectChange("day", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monday">Monday</SelectItem>
                              <SelectItem value="tuesday">Tuesday</SelectItem>
                              <SelectItem value="wednesday">
                                Wednesday
                              </SelectItem>
                              <SelectItem value="thursday">Thursday</SelectItem>
                              <SelectItem value="friday">Friday</SelectItem>
                              <SelectItem value="saturday">Saturday</SelectItem>
                              <SelectItem value="sunday">Sunday</SelectItem>
                            </SelectContent>
                          </Select>
                          <ErrorMessage error={fieldErrors.day} />
                        </div>
                      )}
                    </div>

                    {formValues.gigtimeline === "once" && (
                      <div className="mt-4">
                        <Label>Event Date</Label>
                        <DatePicker
                          selected={selectedDate}
                          onChange={handleDate}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholderText="Select date"
                          minDate={new Date()}
                        />
                        <ErrorMessage error={fieldErrors.date} />
                      </div>
                    )}

                    {formValues.gigtimeline === "other" && (
                      <div className="mt-4">
                        <Label>Custom Timeline</Label>
                        <MemoizedInput
                          value={formValues.otherTimeline}
                          onChange={handleInputChange}
                          name="otherTimeline"
                          placeholder="Describe custom schedule"
                        />
                      </div>
                    )}
                  </div>

                  {/* Duration */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Duration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Start Time</Label>
                        <div className="flex gap-2">
                          <MemoizedInput
                            value={formValues.start}
                            onChange={handleInputChange}
                            name="start"
                            placeholder="10"
                          />
                          <Select
                            value={formValues.durationfrom}
                            onValueChange={(value) =>
                              handleSelectChange("durationfrom", value)
                            }
                          >
                            <SelectTrigger className="w-24">
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
                        <Label>End Time</Label>
                        <div className="flex gap-2">
                          <MemoizedInput
                            value={formValues.end}
                            onChange={handleInputChange}
                            name="end"
                            placeholder="12"
                          />
                          <Select
                            value={formValues.durationto}
                            onValueChange={(value) =>
                              handleSelectChange("durationto", value)
                            }
                          >
                            <SelectTrigger className="w-24">
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
                  </div>

                  {/* Secret Passphrase */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Security</h3>
                    <div>
                      <Label>Secret Passphrase</Label>
                      <div className="relative">
                        <MemoizedInput
                          type={secretpass ? "text" : "password"}
                          value={formValues.secret}
                          onChange={handleInputChange}
                          name="secret"
                          placeholder="Secret passphrase"
                        />
                        <button
                          type="button"
                          onClick={() => setSecretPass(!secretpass)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {secretpass ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Negotiable */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Price Negotiable</Label>
                      <p className="text-sm text-gray-500">
                        Allow applicants to negotiate the price
                      </p>
                    </div>
                    <Switch
                      checked={formValues.negotiable}
                      onCheckedChange={(checked) => {
                        setFormValues((prev: any) => ({
                          ...prev,
                          negotiable: checked,
                        }));
                        setHasChanges(true);
                      }}
                    />
                  </div>

                  {/* Max Slots */}
                  <div>
                    <Label>Maximum Slots</Label>
                    <MemoizedInput
                      type="number"
                      value={formValues.maxSlots?.toString() || "1"}
                      onChange={handleInputChange}
                      name="maxSlots"
                      placeholder="Maximum slots"
                      min="1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customize Tab */}
          <TabsContent value="customize">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">
                        Customize Gig Card
                      </h3>
                      <p className="text-sm text-gray-500">
                        Add your branding and styling
                      </p>
                    </div>
                    <Button
                      onClick={() => setShowCustomization(true)}
                      variant="outline"
                    >
                      <Palette className="w-4 h-4 mr-2" />
                      Customize
                    </Button>
                  </div>

                  {/* Current Preview */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Current Styling</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: gigcustom.backgroundColor }}
                        />
                        <span className="text-sm">
                          Background: {gigcustom.backgroundColor || "Default"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: gigcustom.fontColor }}
                        />
                        <span className="text-sm">
                          Text Color: {gigcustom.fontColor || "Default"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          Font: {gigcustom.font || "Default"}
                        </span>
                      </div>
                      {imageUrl && (
                        <div className="flex items-center gap-2">
                          <img
                            src={imageUrl}
                            alt="Logo"
                            className="w-8 h-8 rounded"
                          />
                          <span className="text-sm">Logo uploaded</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardContent className="p-6">
                <HistoryView gig={gig} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCustomization && (
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

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard Changes?</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to discard them?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelConfirm(false)}
            >
              Continue Editing
            </Button>
            <Button variant="destructive" onClick={confirmCancel}>
              Discard Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Confirmation Dialog */}
      <Dialog open={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Changes</DialogTitle>
            <DialogDescription>
              Are you sure you want to save all changes to this gig?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
