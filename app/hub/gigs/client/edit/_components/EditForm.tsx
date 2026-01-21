// Update your imports section:
import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Save,
  Trash2,
  Shield,
  History,
  Loader2,
  AlertCircle,
  Palette,
  Eye,
  EyeOff,
  Phone,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "sonner";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BusinessCategory } from "@/types/gig"; // Combined import
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
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
import { useGigUpdate } from "@/lib/gigUpdates"; // UpdateGigParams removed
import { fileupload } from "@/hooks/fileUpload";
import GigCustomization from "../../../_components/gigs/GigCustomization";

// Type definitions - consolidate to avoid duplicates
interface BandRoleInput {
  role: string;
  maxSlots?: number;
  filledSlots?: number;
  applicants?: Id<"users">[];
  bookedUsers?: Id<"users">[];
  requiredSkills?: string[];
  description?: string;
  isLocked?: boolean;
  price?: number | null;
  currency?: string;
  negotiable?: boolean;
  bookedPrice?: number | null;
}

interface MinimalUser {
  _id: Id<"users">;
  clerkId: string;
  email?: string;
  username?: string;
}

// In your EditGigForm component, update the props interface:
interface EditGigFormProps {
  gigId: string;
  customization?: {
    fontColor: string;
    font: string;
    backgroundColor: string;
  };
  logo?: string;
}
// Memoized ErrorMessage component
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

// Memoized Input component
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
    const { colors } = useThemeColors();
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
              error ? "border-red-500" : `${colors.border}`,
              `${colors.background} ${colors.text}`,
              className,
            )}
            {...props}
          />
        </div>
        <ErrorMessage error={error} />
      </div>
    );
  },
);
MemoizedInput.displayName = "MemoizedInput";

// Memoized Textarea component
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
    const { colors } = useThemeColors();
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
            error ? "border-red-500" : `${colors.border}`,
            `${colors.background} ${colors.text}`,
            className,
          )}
          {...props}
        />
        <ErrorMessage error={error} />
      </div>
    );
  },
);
MemoizedTextarea.displayName = "MemoizedTextarea";

// HistoryView component
const HistoryView = React.memo(({ gig }: { gig: any }) => {
  const { colors } = useThemeColors();

  if (!gig.bookingHistory || gig.bookingHistory.length === 0) {
    return (
      <div className="text-center py-8">
        <History className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
        <p className={colors.textMuted}>No booking history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className={`text-lg font-semibold mb-4 ${colors.text}`}>
        Booking History
      </h3>
      <div className="space-y-3">
        {gig.bookingHistory
          .sort((a: any, b: any) => b.timestamp - a.timestamp)
          .map((entry: any, index: number) => (
            <Card
              key={index}
              className={`overflow-hidden ${colors.cardBorder}`}
            >
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
                    <span className={`text-sm ${colors.textMuted}`}>
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {entry.userRole && (
                    <Badge variant="secondary">{entry.userRole}</Badge>
                  )}
                </div>
                <p className={`text-sm ${colors.text}`}>{entry.notes}</p>
                {entry.agreedPrice && (
                  <p className={`text-sm font-medium mt-2 ${colors.text}`}>
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

interface CustomProps {
  fontColor: string;
  font: string;
  backgroundColor: string;
}

export default function EditGigForm({
  gigId,
  customization: initialCustomization,
  logo: initialLogo,
}: EditGigFormProps) {
  const router = useRouter();
  const params = useParams();
  const { colors } = useThemeColors();
  const { user } = useCurrentUser();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formValues, setFormValues] = useState<any>(null);
  const [originalValues, setOriginalValues] = useState<any>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [imageUrl, setUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [bandRoles, setBandRoles] = useState<BandRoleInput[]>([]);
  const [bussinesscat, setBussinessCategory] = useState<BusinessCategory>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [secretpass, setSecretPass] = useState<boolean>(false);

  // Customization state - ADD THIS
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [gigcustom, setGigCustom] = useState<CustomProps>({
    fontColor: "",
    font: "",
    backgroundColor: "",
  });

  // Convex queries and mutations
  const gig = useQuery(api.controllers.gigs.getGigById, {
    gigId: gigId as Id<"gigs">,
  });
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
                  (1000 * 60 * 60 * 24),
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
      setUrl(gig.logo || "");

      setGigCustom(
        initialCustomization || {
          fontColor: gig.fontColor || "",
          font: gig.font || "",
          backgroundColor: gig.backgroundColor || "",
        },
      );

      // Initialize logo from either passed props or gig data
      setUrl(initialLogo || gig.logo || "");

      const bandRolesFromGig =
        gig.bandCategory?.map((role: any) => ({
          role: role.role,
          maxSlots: role.maxSlots,
          requiredSkills: role.requiredSkills || [],
          description: role.description,
          price: role.price,
          currency: role.currency,
          negotiable: role.negotiable,
        })) || [];

      setBandRoles(bandRolesFromGig);

      if (gig.date) {
        setSelectedDate(new Date(gig.date));
      }

      setIsLoading(false);
    }
  }, [gig]);

  // In your hasChanges useEffect:
  useEffect(() => {
    if (formValues && originalValues && gig) {
      const hasChanges =
        JSON.stringify(formValues) !== JSON.stringify(originalValues) ||
        JSON.stringify(gigcustom) !==
          JSON.stringify(
            initialCustomization || {
              fontColor: gig.fontColor || "",
              font: gig.font || "",
              backgroundColor: gig.backgroundColor || "",
            },
          ) ||
        JSON.stringify(bandRoles) !== JSON.stringify(gig?.bandCategory || []) ||
        imageUrl !== (initialLogo || gig.logo || "");

      setHasChanges(hasChanges);
    }
  }, [
    formValues,
    originalValues,
    gigcustom,
    bandRoles,
    imageUrl,
    gig,
    initialCustomization,
    initialLogo,
  ]);

  // File upload handler - UPDATE to set imageUrl
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
        minimalUser,
      );
    },
    [imageUrl, user],
  );

  // Customization file change handler - for the customization modal
  const handleCustomizationFileChange = useCallback(
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
        minimalUser,
      );
    },
    [imageUrl, user],
  );

  // Handle apply customization from modal
  const handleApplyCustomization = useCallback(() => {
    setHasChanges(true);
    toast.success("Customization applied!");
  }, []);

  // Input change handler
  const handleInputChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
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
    [fieldErrors],
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

  const { updateGig, updateGigStatus, updateGigVisibility } = useGigUpdate();

  // Handle delete
  const handleDelete = useCallback(async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this gig? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await deleteGig({ gigId: gigId as Id<"gigs"> });
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

  // Handle save - UPDATE to include gigcustom
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
      // Format band roles properly before sending
      const formattedBandRoles =
        bussinesscat === "other" && bandRoles.length > 0
          ? bandRoles.map((role) => ({
              role: role.role,
              maxSlots: role.maxSlots || 1,
              filledSlots: role.filledSlots || 0,
              applicants: role.applicants || [],
              bookedUsers: role.bookedUsers || [],
              requiredSkills: role.requiredSkills || [],
              description: role.description || "",
              isLocked: role.isLocked || false,
              price: role.price !== undefined ? role.price : null,
              currency: role.currency || "KES",
              negotiable:
                role.negotiable !== undefined ? role.negotiable : true,
              bookedPrice:
                role.bookedPrice !== undefined ? role.bookedPrice : null,
            }))
          : undefined; // Send undefined if not "other" category

      // Prepare update data - include gigcustom fields
      const updateData = {
        gigId: gigId as Id<"gigs">,
        clerkId: user.clerkId,
        title: formValues.title,
        description: formValues.description,
        phone: formValues.phoneNo || undefined,
        price: formValues.price ? parseFloat(formValues.price) : undefined,
        category: formValues.category || undefined,
        location: formValues.location,
        secret: formValues.secret || undefined,
        bussinesscat: formValues.bussinesscat,
        otherTimeline: formValues.otherTimeline || undefined,
        gigtimeline: formValues.gigtimeline || undefined,
        day: formValues.day || undefined,
        date: formValues.date ? new Date(formValues.date).getTime() : undefined,
        pricerange: formValues.pricerange || undefined,
        currency: formValues.currency || "KES",
        negotiable: formValues.negotiable ?? true,
        mcType: formValues.mcType || undefined,
        mcLanguages: formValues.mcLanguages || undefined,
        djGenre: formValues.djGenre || undefined,
        djEquipment: formValues.djEquipment || undefined,
        vocalistGenre: formValues.vocalistGenre || undefined,
        acceptInterestEndTime: formValues.acceptInterestEndTime
          ? new Date(formValues.acceptInterestEndTime).getTime()
          : undefined,
        acceptInterestStartTime: formValues.acceptInterestStartTime
          ? new Date(formValues.acceptInterestStartTime).getTime()
          : undefined,
        maxSlots: formValues.maxSlots
          ? parseInt(formValues.maxSlots)
          : undefined,
        // Add customization fields
        font: gigcustom.font || undefined,
        fontColor: gigcustom.fontColor || undefined,
        backgroundColor: gigcustom.backgroundColor || undefined,
        logo: imageUrl || undefined,
        bandCategory: formattedBandRoles,
        time: {
          start: formValues.start,
          end: formValues.end,
          durationFrom: formValues.durationfrom,
          durationTo: formValues.durationto,
        },
      };

      // Remove undefined values
      const cleanUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => v !== undefined),
      );

      // Use the helper utility
      await updateGig(cleanUpdateData as any);

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
      toast.error("Failed to update gig");
      throw error;
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
  ]);

  const confirmCancel = useCallback(() => {
    if (formValues && originalValues) {
      setFormValues(originalValues);
    }

    // Reset to initial props or gig data
    setUrl(initialLogo || gig?.logo || "");

    // Reset gigcustom state to initial props or gig data
    setGigCustom(
      initialCustomization || {
        fontColor: gig?.fontColor || "",
        font: gig?.font || "",
        backgroundColor: gig?.backgroundColor || "",
      },
    );

    const bandRolesFromGig =
      (gig &&
        gig?.bandCategory?.map((role: any) => ({
          role: role.role,
          maxSlots: role.maxSlots,
          requiredSkills: role.requiredSkills || [],
          description: role.description,
          price: role.price,
          currency: role.currency,
          negotiable: role.negotiable,
        }))) ||
      [];

    setBandRoles(bandRolesFromGig);
    setHasChanges(false);
    setShowCancelConfirm(false);
    router.back();
  }, [
    formValues,
    originalValues,
    gig,
    initialCustomization,
    initialLogo,
    router,
  ]);
  // Loading state
  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen ${colors.background}`}
      >
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className={colors.textMuted}>Loading gig data...</p>
        </div>
      </div>
    );
  }

  // Not found
  if (!gig) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen ${colors.background}`}
      >
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className={`text-2xl font-bold mb-2 ${colors.text}`}>
            Gig Not Found
          </h2>
          <p className={`${colors.textMuted} mb-6`}>
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
      <div
        className={`flex items-center justify-center min-h-screen ${colors.background}`}
      >
        <div className="text-center">
          <Shield className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h2 className={`text-2xl font-bold mb-2 ${colors.text}`}>
            Access Denied
          </h2>
          <p className={`${colors.textMuted} mb-6`}>
            You don't have permission to edit this gig.
          </p>
          <Button onClick={() => router.push("/hub/gigs")}>Back to Gigs</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${colors.background}`}>
      {/* Customization Modal */}
      {showCustomizationModal && (
        <GigCustomization
          customization={gigcustom}
          setCustomization={setGigCustom}
          closeModal={() => setShowCustomizationModal(false)}
          logo={imageUrl}
          handleFileChange={handleCustomizationFileChange}
          isUploading={isUploading}
        />
      )}

      {/* Header */}
      <div
        className={`sticky top-0 z-40 ${colors.navBackground}/80 backdrop-blur-sm ${colors.navBorder} border-b`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleCancel} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className={`text-2xl font-bold ${colors.text}`}>
                  Edit Gig
                </h1>
                <p className={`text-sm ${colors.textMuted}`}>{gig.title}</p>
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
          <TabsList
            className={`grid grid-cols-4 mb-8 ${colors.backgroundSecondary}`}
          >
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="customize">Customize</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card className={colors.cardBorder}>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <Label htmlFor="title" className={colors.text}>
                      Title
                    </Label>
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

                  {hasChanges &&
                    (gigcustom.fontColor ||
                      gigcustom.font ||
                      gigcustom.backgroundColor) && (
                      <Badge
                        variant="outline"
                        className="ml-3 border-purple-500 text-purple-600"
                      >
                        <Palette className="w-3 h-3 mr-1" />
                        Customized
                      </Badge>
                    )}
                  {/* Description */}
                  <div>
                    <Label htmlFor="description" className={colors.text}>
                      Description
                    </Label>
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
                    <Label htmlFor="location" className={colors.text}>
                      Location
                    </Label>
                    <MemoizedInput
                      id="location"
                      value={formValues.location}
                      onChange={handleInputChange}
                      name="location"
                      placeholder="Event location"
                      error={fieldErrors.location}
                      required
                    />
                  </div>

                  {/* Business Category */}
                  <div>
                    <Label className={colors.text}>Business Category</Label>
                    <Select
                      value={bussinesscat || ""}
                      onValueChange={(value) =>
                        handleBussinessChange(value as BusinessCategory)
                      }
                    >
                      <SelectTrigger className={colors.border}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className={colors.background}>
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
            <Card className={colors.cardBorder}>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Contact Info */}
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${colors.text}`}>
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
                    <h3 className={`text-lg font-semibold mb-4 ${colors.text}`}>
                      Price Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className={colors.text}>Currency</Label>
                        <Select
                          value={formValues.currency}
                          onValueChange={(value) =>
                            handleSelectChange("currency", value)
                          }
                        >
                          <SelectTrigger className={colors.border}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className={colors.background}>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                            <SelectItem value="KES">KES (KSh)</SelectItem>
                            <SelectItem value="NGN">NGN (₦)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className={colors.text}>Amount</Label>
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
                        <Label className={colors.text}>Price Range</Label>
                        <Select
                          value={formValues.pricerange}
                          onValueChange={(value) =>
                            handleSelectChange("pricerange", value)
                          }
                        >
                          <SelectTrigger className={colors.border}>
                            <SelectValue placeholder="Select range" />
                          </SelectTrigger>
                          <SelectContent className={colors.background}>
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
                    <h3 className={`text-lg font-semibold mb-4 ${colors.text}`}>
                      Timeline
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className={colors.text}>Gig Type</Label>
                        <Select
                          value={formValues.gigtimeline}
                          onValueChange={(value) =>
                            handleSelectChange("gigtimeline", value)
                          }
                        >
                          <SelectTrigger className={colors.border}>
                            <SelectValue placeholder="Select timeline" />
                          </SelectTrigger>
                          <SelectContent className={colors.background}>
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
                          <Label className={colors.text}>Day of Week</Label>
                          <Select
                            value={formValues.day}
                            onValueChange={(value) =>
                              handleSelectChange("day", value)
                            }
                          >
                            <SelectTrigger className={colors.border}>
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                            <SelectContent className={colors.background}>
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
                        <Label className={colors.text}>Event Date</Label>
                        <DatePicker
                          selected={selectedDate}
                          onChange={handleDate}
                          className={`w-full px-3 py-2 rounded-lg ${colors.border} ${colors.background} ${colors.text}`}
                          placeholderText="Select date"
                          minDate={new Date()}
                        />
                        <ErrorMessage error={fieldErrors.date} />
                      </div>
                    )}

                    {formValues.gigtimeline === "other" && (
                      <div className="mt-4">
                        <Label className={colors.text}>Custom Timeline</Label>
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
                    <h3 className={`text-lg font-semibold mb-4 ${colors.text}`}>
                      Duration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className={colors.text}>Start Time</Label>
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
                            <SelectTrigger className={`w-24 ${colors.border}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className={colors.background}>
                              <SelectItem value="am">AM</SelectItem>
                              <SelectItem value="pm">PM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label className={colors.text}>End Time</Label>
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
                            <SelectTrigger className={`w-24 ${colors.border}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className={colors.background}>
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
                    <h3 className={`text-lg font-semibold mb-4 ${colors.text}`}>
                      Security
                    </h3>
                    <div>
                      <Label className={colors.text}>Secret Passphrase</Label>
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
                      <Label className={colors.text}>Price Negotiable</Label>
                      <p className={`text-sm ${colors.textMuted}`}>
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
                    <Label className={colors.text}>Maximum Slots</Label>
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
            <Card className={colors.cardBorder}>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className={`text-lg font-semibold ${colors.text}`}>
                        Customize Gig Card
                      </h3>
                      <p className={`text-sm ${colors.textMuted}`}>
                        Add your branding and styling to make your gig stand out
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowCustomizationModal(true)}
                      className="flex items-center gap-2 border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    >
                      <Palette className="w-4 h-4" />
                      Open Customizer
                    </Button>
                  </div>

                  {/* Current Customization Preview */}
                  <div className={`rounded-lg p-6 border ${colors.border}`}>
                    <h4 className={`font-medium mb-4 ${colors.text}`}>
                      Current Customization
                    </h4>

                    <div className="space-y-4">
                      {/* Color Preview */}
                      <div>
                        <h5
                          className={`text-sm font-medium mb-2 ${colors.text}`}
                        >
                          Colors
                        </h5>
                        <div className="flex flex-wrap gap-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded border shadow-sm"
                              style={{
                                backgroundColor:
                                  gigcustom.fontColor ||
                                  gig?.fontColor ||
                                  colors.text,
                              }}
                            />
                            <span className={`text-sm ${colors.text}`}>
                              Font Color:{" "}
                              {gigcustom.fontColor ||
                                gig?.fontColor ||
                                "Default"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded border shadow-sm"
                              style={{
                                backgroundColor:
                                  gigcustom.backgroundColor ||
                                  gig?.backgroundColor ||
                                  colors.background,
                              }}
                            />
                            <span className={`text-sm ${colors.text}`}>
                              Background:{" "}
                              {gigcustom.backgroundColor ||
                                gig?.backgroundColor ||
                                "Default"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Font Preview */}
                      <div>
                        <h5
                          className={`text-sm font-medium mb-2 ${colors.text}`}
                        >
                          Font
                        </h5>
                        <p
                          className={`text-lg ${colors.text}`}
                          style={{
                            fontFamily:
                              gigcustom.font || gig?.font || "inherit",
                          }}
                        >
                          {gigcustom.font || gig?.font || "Default font"}
                        </p>
                      </div>

                      {/* Logo Preview */}
                      <div>
                        <h5
                          className={`text-sm font-medium mb-2 ${colors.text}`}
                        >
                          Logo
                        </h5>
                        {imageUrl || gig?.logo ? (
                          <div className="flex items-center gap-3">
                            <img
                              src={imageUrl || gig?.logo}
                              alt="Logo"
                              className="w-12 h-12 rounded-lg border shadow-sm object-cover"
                            />
                            <span className={`text-sm ${colors.text}`}>
                              {imageUrl ? "Custom logo uploaded" : "Gig logo"}
                            </span>
                          </div>
                        ) : (
                          <p className={`text-sm ${colors.textMuted}`}>
                            No logo uploaded
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Live Preview Card */}
                    <div className="mt-6 pt-6 border-t">
                      <h5 className={`text-sm font-medium mb-3 ${colors.text}`}>
                        Live Preview
                      </h5>
                      <div
                        className="p-4 rounded-xl border shadow-sm"
                        style={{
                          backgroundColor:
                            gigcustom.backgroundColor ||
                            gig?.backgroundColor ||
                            colors.background,
                          borderColor: colors.border,
                        }}
                      >
                        <div className="space-y-3">
                          <h4
                            className="font-bold text-lg truncate"
                            style={{
                              color:
                                gigcustom.fontColor ||
                                gig?.fontColor ||
                                colors.text,
                              fontFamily:
                                gigcustom.font || gig?.font || "inherit",
                            }}
                          >
                            {formValues?.title ||
                              gig?.title ||
                              "Your Gig Title"}
                          </h4>
                          <p
                            className="text-sm line-clamp-2"
                            style={{
                              color:
                                gigcustom.fontColor || gig?.fontColor
                                  ? `${gigcustom.fontColor || gig?.fontColor || colors.text}CC`
                                  : colors.textMuted,
                              fontFamily:
                                gigcustom.font || gig?.font || "inherit",
                            }}
                          >
                            {formValues?.description ||
                              gig?.description ||
                              "Your gig description will appear here"}
                          </p>
                          <div className="flex justify-between items-center">
                            <span
                              className="font-semibold"
                              style={{
                                color:
                                  gigcustom.fontColor ||
                                  gig?.fontColor ||
                                  colors.text,
                                fontFamily:
                                  gigcustom.font || gig?.font || "inherit",
                              }}
                            >
                              ${formValues?.price || gig?.price || "0"}
                            </span>
                            <div className="w-8 h-8 rounded-full overflow-hidden border">
                              {imageUrl || gig?.logo ? (
                                <img
                                  src={imageUrl || gig?.logo}
                                  alt="Logo"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">
                                    G
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reset Customization */}
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setGigCustom({
                          fontColor: "",
                          font: "",
                          backgroundColor: "",
                        });
                        setUrl("");
                        setHasChanges(true);
                        toast.info("Customization reset to default");
                      }}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      disabled={
                        !gigcustom.fontColor &&
                        !gigcustom.font &&
                        !gigcustom.backgroundColor &&
                        !imageUrl &&
                        !gig?.fontColor &&
                        !gig?.font &&
                        !gig?.backgroundColor &&
                        !gig?.logo
                      }
                    >
                      Reset to Default
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card className={colors.cardBorder}>
              <CardContent className="p-6">
                <HistoryView gig={gig} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <DialogContent className={colors.background}>
          <DialogHeader>
            <DialogTitle className={colors.text}>Discard Changes?</DialogTitle>
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
        <DialogContent className={colors.background}>
          <DialogHeader>
            <DialogTitle className={colors.text}>Save Changes</DialogTitle>
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
