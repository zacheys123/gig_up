"use client";
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
  Users,
  Music,
  Mic,
  Volume2,
  Calendar,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  Info,
  X,
  Drum,
  Piano,
  Guitar,
  Music as MusicIcon,
  Mic as MicIcon,
  Volume2 as Volume2Icon,
  FileText,
  Search,
  Briefcase,
  Zap,
  Type,
  ArrowRight,
  ChevronRight,
  Key,
  Shield as ShieldIcon,
  Palette as PaletteIcon,
  Settings,
  UserPlus,
  Star,
  TrendingUp,
  CheckCircle,
  Plus,
  Check,
  Users as UsersIcon,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "sonner";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  BusinessCategory,
  BandRoleInput,
  BandSetupRole,
  CustomProps,
  TalentType,
  parseTalentData,
} from "@/types/gig";
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
import { useGigUpdate } from "@/lib/gigUpdates";
import { fileupload } from "@/hooks/fileUpload";
import GigCustomization from "../../../_components/gigs/GigCustomization";
import BandSetupModal from "../../../_components/gigs/BandSetUpModal";
import TalentModal from "./TalentModal";

// Memoized ErrorMessage Component
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
              error ? "border-red-500" : "border-gray-200 dark:border-gray-800",
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

// Talent Preview Component
const TalentPreview = React.memo(({ formValues, colors }: any) => {
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
        "rounded-xl p-4 border mt-4",
        colors.border,
        colors.backgroundMuted,
        "relative overflow-hidden",
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
            // This would be handled by parent component
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
                "px-3 py-1 rounded-full font-medium",
              )}
            >
              MC: {formValues.mcType}
            </Badge>
            {formValues.mcLanguages && (
              <Badge
                variant="outline"
                className={cn(
                  "border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-300",
                  "px-3 py-1 rounded-full font-medium",
                )}
              >
                {Array.isArray(formValues.mcLanguages)
                  ? formValues.mcLanguages.join(", ")
                  : formValues.mcLanguages}
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
                "px-3 py-1 rounded-full font-medium",
              )}
            >
              DJ:{" "}
              {Array.isArray(formValues.djGenre)
                ? formValues.djGenre.join(", ")
                : formValues.djGenre}
            </Badge>
            {formValues.djEquipment && (
              <Badge
                variant="outline"
                className={cn(
                  "border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-300",
                  "px-3 py-1 rounded-full font-medium",
                )}
              >
                {Array.isArray(formValues.djEquipment)
                  ? formValues.djEquipment.join(", ")
                  : formValues.djEquipment}
              </Badge>
            )}
          </div>
        )}

        {formValues.vocalistGenre?.length && (
          <div className="flex flex-wrap gap-2">
            {formValues.vocalistGenre.map((genre: string) => (
              <Badge
                key={genre}
                variant="outline"
                className={cn(
                  "border-green-200 text-green-700 dark:border-green-800 dark:text-green-300",
                  "px-3 py-1 rounded-full font-medium",
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
});
TalentPreview.displayName = "TalentPreview";

// Band Setup Preview Component
const BandSetupPreview = React.memo(
  ({ bandRoles, bussinesscat, colors, setShowBandSetupModal }: any) => {
    if (bussinesscat !== "other" || bandRoles.length === 0) return null;

    const totalPositions = bandRoles.reduce(
      (sum: number, role: BandRoleInput) => sum + role.maxSlots,
      0,
    );

    const totalPrice = bandRoles.reduce((sum: number, role: BandRoleInput) => {
      const price = role.price || 0;
      return sum + price * role.maxSlots;
    }, 0);

    const hasPricedRoles = bandRoles.some(
      (role: BandRoleInput) => role.price && role.price > 0,
    );

    // logic used for global indicator
    const hasNegotiableRoles = bandRoles.some(
      (role: BandRoleInput) => role.negotiable,
    );

    const getRoleIcon = (roleName: string) => {
      const roleIcons: Record<string, React.ElementType> = {
        "Lead Vocalist": Mic,
        Guitarist: Guitar,
        Bassist: Music,
        Drummer: Drum,
        "Pianist/Keyboardist": Piano,
        Saxophonist: Music,
        Trumpeter: Music,
        Violinist: Music,
        "Backup Vocalist": Mic,
        Percussionist: Drum,
        DJ: Volume2,
        "MC/Host": Mic,
        Vocalist: Mic,
        Keyboardist: Piano,
        "Bass Guitarist": Music,
      };
      const Icon = roleIcons[roleName] || Music;
      return <Icon className="w-4 h-4" />;
    };

    const getRoleColor = (roleName: string) => {
      const roleColors: Record<string, string> = {
        "Lead Vocalist":
          "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        Guitarist:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        Bassist:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        Drummer:
          "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
        "Pianist/Keyboardist":
          "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      };
      return (
        roleColors[roleName] ||
        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      );
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "rounded-xl p-4 border mt-4 overflow-hidden relative",
          colors.border,
          colors.backgroundMuted,
        )}
      >
        {/* Animated accent glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -translate-y-16 translate-x-16 blur-3xl pointer-events-none" />

        <div className="flex justify-between items-center mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Users className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  className={cn(
                    "font-bold uppercase tracking-tighter",
                    colors.text,
                  )}
                >
                  Band Setup
                </h3>
                {hasNegotiableRoles && (
                  <Badge className="bg-orange-500/10 text-orange-600 border-none text-[9px] font-black uppercase tracking-widest h-4">
                    Open Rates
                  </Badge>
                )}
              </div>
              <p
                className={cn(
                  "text-[10px] font-bold uppercase text-zinc-500 tracking-widest",
                  colors.textMuted,
                )}
              >
                {bandRoles.length} Roles • {totalPositions} Slots
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full h-8 text-xs font-bold border-zinc-200 dark:border-zinc-800"
            onClick={() => setShowBandSetupModal(true)}
          >
            Edit Lineup
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
          {bandRoles.map((role: BandRoleInput, index: number) => (
            <div
              key={index}
              className={cn(
                "p-4 border rounded-xl transition-all group",
                colors.border,
                colors.background,
                "hover:border-orange-500/20",
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={cn("p-1.5 rounded-lg", getRoleColor(role.role))}
                  >
                    {getRoleIcon(role.role)}
                  </div>
                  <span className="font-black text-xs uppercase tracking-tight">
                    {role.role}
                  </span>
                </div>
                <div className="flex gap-1">
                  <span className="text-[10px] font-black bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                    x{role.maxSlots}
                  </span>
                </div>
              </div>

              {/* Price Row matching the modal aesthetic */}
              {role.price && role.price > 0 && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-50 dark:border-zinc-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">
                      Rate:
                    </span>
                    <span className="text-sm font-black text-green-600">
                      {role.currency} {role.price.toLocaleString()}
                    </span>
                  </div>
                  {role.negotiable && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_5px_rgba(249,115,22,0.8)]" />
                      <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">
                        Negotiable
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Total Budget Summary Area */}
        {hasPricedRoles && (
          <div
            className={cn(
              "mt-4 p-4 rounded-xl flex items-center justify-between border-l-4 transition-all",
              "bg-zinc-100/80 dark:bg-zinc-900/40 backdrop-blur-sm",
              hasNegotiableRoles
                ? "border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.05)]"
                : "border-zinc-400 dark:border-zinc-700",
            )}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center rotate-3 transition-transform group-hover:rotate-0",
                  hasNegotiableRoles
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : "bg-zinc-800 dark:bg-zinc-200 text-zinc-100 dark:text-zinc-900",
                )}
              >
                <DollarSign className="w-5 h-5" />
              </div>

              <div>
                <p className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em] leading-none mb-1.5">
                  Est. Total Investment
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">
                    {bandRoles[0]?.currency || "KES"}
                  </span>
                  <p
                    className={cn(
                      "text-2xl font-black tracking-tighter leading-none",
                      "text-zinc-900",
                    )}
                  >
                    {totalPrice.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {hasNegotiableRoles && (
              <div className="text-right flex flex-col items-end gap-1">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-orange-500/10 border border-orange-500/20">
                  <div className="w-1 h-1 rounded-full bg-orange-500 animate-ping" />
                  <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                    Flexible
                  </span>
                </div>
                <p className="text-[9px] font-bold text-zinc-500 italic">
                  Subject to negotiation
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    );
  },
);
// Create a reusable ErrorDisplay component
const ErrorDisplay = ({ error, className = "" }: any) => {
  if (!error) return null;
  return <p className={`text-sm text-red-500 mt-1 ${className}`}>{error}</p>;
};

// Simplified date field component
const DateField = ({
  label,
  value,
  onChange,
  error,
  description,
  fieldName,
  colors,
}: any) => (
  <div>
    <label className={cn("block text-sm font-medium mb-2", colors.text)}>
      {label}
    </label>
    <div className="relative">
      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        type="datetime-local"
        value={value || ""}
        onChange={(e) => onChange(fieldName, e.target.value || undefined)}
        className="pl-10"
      />
    </div>
    <ErrorDisplay error={error} />
    <p className={cn("text-xs mt-1", colors.textMuted)}>{description}</p>
  </div>
);

// Interest Window Section Component
const InterestWindowSection = React.memo(
  ({ formValues, colors, onInterestWindowChange }: any) => {
    const [showInterestWindow, setShowInterestWindow] = useState(() => {
      // Show the window if there are any interest window values
      return !!(
        formValues?.acceptInterestStartTime ||
        formValues?.acceptInterestEndTime ||
        (formValues?.interestWindowDays && formValues.interestWindowDays !== 7)
      );
    });

    const [interestWindowType, setInterestWindowType] = useState<
      "dates" | "days"
    >(() => {
      // Determine type based on existing values
      if (
        formValues?.acceptInterestStartTime ||
        formValues?.acceptInterestEndTime
      ) {
        return "dates";
      }
      return "days";
    });

    // Log when component renders
    useEffect(() => {
      console.log("=== InterestWindowSection Render ===");
      console.log("Form values passed:", {
        acceptInterestStartTime: formValues?.acceptInterestStartTime,
        acceptInterestEndTime: formValues?.acceptInterestEndTime,
        interestWindowDays: formValues?.interestWindowDays,
        enableInterestWindow: formValues?.enableInterestWindow,
      });
      console.log("Current interestWindowType:", interestWindowType);
    }, [formValues, interestWindowType]);

    // When the section opens, automatically enable it
    useEffect(() => {
      if (showInterestWindow && !formValues?.enableInterestWindow) {
        console.log("Auto-enabling interest window");
        onInterestWindowChange("enableInterestWindow", true);
      }
    }, [
      showInterestWindow,
      formValues?.enableInterestWindow,
      onInterestWindowChange,
    ]);
    // Inside InterestWindowSection component, replace the handleInterestWindowChange
    const handleInterestWindowChange = useCallback(
      (field: string, value: any) => {
        // This function should be defined by the parent component (EditGigForm)
        // and passed down as a prop
        if (onInterestWindowChange) {
          onInterestWindowChange(field, value);
        }
      },
      [onInterestWindowChange], // This should be passed as a prop
    );
    // Add these helper functions inside the component
    const getDefaultStartDate = () => {
      const now = new Date();
      now.setHours(now.getHours() + 1); // 1 hour from now
      return formatDateForInput(now);
    };

    const getDefaultEndDate = () => {
      const now = new Date();
      now.setDate(now.getDate() + 7); // 7 days from now
      now.setHours(17, 0, 0, 0); // 5:00 PM
      return formatDateForInput(now);
    };

    const formatDateForInput = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    if (!showInterestWindow) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn(
            "rounded-xl p-6 border cursor-pointer transition-all group",
            colors.border,
            colors.backgroundMuted,
            "hover:shadow-lg hover:border-purple-500/50",
          )}
          onClick={() => setShowInterestWindow(true)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-3 rounded-lg transition-transform group-hover:scale-110",
                  "bg-gradient-to-r from-purple-500/10 to-pink-500/10",
                )}
              >
                <Clock className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h3 className={cn("font-semibold", colors.text)}>
                  Set Interest Window (Optional)
                </h3>
                <p className={cn("text-sm", colors.textMuted)}>
                  Control when musicians can show interest in your gig
                </p>
              </div>
            </div>
            <ChevronRight className={cn("w-5 h-5", colors.textMuted)} />
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        className={cn(
          "rounded-xl border overflow-hidden",
          colors.border,
          colors.backgroundMuted,
        )}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                <Clock className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h3 className={cn("font-semibold", colors.text)}>
                  Interest Window Settings
                </h3>
                <p className={cn("text-sm", colors.textMuted)}>
                  When can musicians show interest in this gig?
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowInterestWindow(false)}
              className={cn(
                "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800",
                colors.textMuted,
              )}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <label
              className={cn("block text-sm font-medium mb-3", colors.text)}
            >
              Interest Window Type
            </label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={interestWindowType === "dates" ? "default" : "outline"}
                // In InterestWindowSection, update the type switching logic:

                onClick={() => {
                  setInterestWindowType("days");
                  // When switching to days, clear dates AND disable interest window if dates were set
                  if (
                    formValues?.acceptInterestStartTime ||
                    formValues?.acceptInterestEndTime
                  ) {
                    onInterestWindowChange(
                      "acceptInterestStartTime",
                      undefined,
                    );
                    onInterestWindowChange("acceptInterestEndTime", undefined);
                  }
                  // Ensure interest window is enabled if we're setting days
                  onInterestWindowChange("enableInterestWindow", true);
                }}
                className={cn(
                  "flex-1",
                  interestWindowType === "dates" &&
                    "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
                )}
              >
                Specific Dates
              </Button>
              <Button
                type="button"
                variant={interestWindowType === "days" ? "default" : "outline"}
                onClick={() => {
                  setInterestWindowType("days");
                  // When switching to days, clear dates
                  if (
                    formValues?.acceptInterestStartTime ||
                    formValues?.acceptInterestEndTime
                  ) {
                    onInterestWindowChange(
                      "acceptInterestStartTime",
                      undefined,
                    );
                    onInterestWindowChange("acceptInterestEndTime", undefined);
                  }
                  // Ensure interest window is enabled
                  onInterestWindowChange("enableInterestWindow", true);
                }}
                className={cn(
                  "flex-1",
                  interestWindowType === "days" &&
                    "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
                )}
              >
                Days After Posting
              </Button>
            </div>
          </div>
          {interestWindowType === "dates" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className={cn(
                      "block text-sm font-medium mb-2",
                      colors.text,
                    )}
                  >
                    Interest Opens
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="datetime-local"
                      value={
                        formValues.acceptInterestStartTime ||
                        getDefaultStartDate()
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        console.log("Start time changed to:", value);
                        onInterestWindowChange(
                          "acceptInterestStartTime",
                          value || undefined,
                        );
                        // Auto-set end date if not set
                        if (!formValues.acceptInterestEndTime && value) {
                          const startDate = new Date(value);
                          const endDate = new Date(
                            startDate.getTime() + 7 * 24 * 60 * 60 * 1000,
                          ); // 7 days later
                          const endValue = formatDateForInput(endDate);
                          onInterestWindowChange(
                            "acceptInterestEndTime",
                            endValue,
                          );
                        }
                      }}
                      className="pl-10"
                    />
                  </div>
                  <p className={cn("text-xs mt-1", colors.textMuted)}>
                    When musicians can start showing interest
                  </p>
                </div>

                <div>
                  <label
                    className={cn(
                      "block text-sm font-medium mb-2",
                      colors.text,
                    )}
                  >
                    Interest Closes
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="datetime-local"
                      value={
                        formValues.acceptInterestEndTime || getDefaultEndDate()
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        console.log("End time changed to:", value);
                        onInterestWindowChange(
                          "acceptInterestEndTime",
                          value || undefined,
                        );
                      }}
                      className="pl-10"
                    />
                  </div>
                  <p className={cn("text-xs mt-1", colors.textMuted)}>
                    When interest period ends
                  </p>
                </div>
              </div>
            </div>
          )}
          {interestWindowType === "days" && (
            <div>
              <label
                className={cn("block text-sm font-medium mb-3", colors.text)}
              >
                Interest Window Duration
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-background border rounded-lg p-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      const current = formValues.interestWindowDays || 7;
                      onInterestWindowChange(
                        "interestWindowDays",
                        Math.max(1, current - 1),
                      );
                    }}
                    className="h-8 w-8"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>

                  <div className="w-12 text-center font-bold">
                    {formValues.interestWindowDays || 7}
                  </div>

                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      const current = formValues.interestWindowDays || 7;
                      onInterestWindowChange(
                        "interestWindowDays",
                        Math.min(30, current + 1),
                      );
                    }}
                    className="h-8 w-8"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <span className={cn("text-sm font-medium", colors.textMuted)}>
                  days after posting
                </span>
              </div>
              <p className={cn("text-xs mt-3", colors.textMuted)}>
                Musicians will be able to show interest for{" "}
                {formValues.interestWindowDays || 7} days once this gig is
                published.
              </p>
            </div>
          )}

          {(formValues.acceptInterestStartTime ||
            formValues.acceptInterestEndTime ||
            formValues.interestWindowDays) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 pt-4 border-t"
            >
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">
                    Interest Window Configured
                  </p>
                  <p className="text-xs text-gray-500">
                    {interestWindowType === "dates"
                      ? `Interest opens: ${formValues.acceptInterestStartTime ? new Date(formValues.acceptInterestStartTime).toLocaleString() : "Not set"}`
                      : `Interest open for ${formValues.interestWindowDays || 7} days after posting`}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="mt-4 pt-4 border-t">
            <p className={cn("text-xs", colors.textMuted)}>
              <strong>Tip:</strong> Setting an interest window helps manage
              application flow and prevents last-minute applications.
            </p>
          </div>
        </div>
        {/* Add this at the bottom of the expanded section for debugging
        <div className="mt-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
          <h4 className="text-sm font-medium mb-2">Debug Info</h4>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(
              {
                showInterestWindow,
                interestWindowType,
                formValues: {
                  acceptInterestStartTime: formValues?.acceptInterestStartTime,
                  acceptInterestEndTime: formValues?.acceptInterestEndTime,
                  interestWindowDays: formValues?.interestWindowDays,
                  enableInterestWindow: formValues?.enableInterestWindow,
                },
              },
              null,
              2,
            )}
          </pre>
        </div> */}
      </motion.div>
    );
  },
);
InterestWindowSection.displayName = "InterestWindowSection";

// History View Component
const HistoryView = ({ gig }: { gig: any }) => {
  const { colors } = useThemeColors();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <History className="w-5 h-5 text-orange-500" />
        <h3 className={`text-lg font-semibold ${colors.text}`}>Gig History</h3>
      </div>

      <div className="space-y-3">
        <div className={`p-4 rounded-xl border ${colors.border}`}>
          <div className="flex items-center justify-between">
            <span className={`font-medium ${colors.text}`}>Created</span>
            <span className={`text-sm ${colors.textMuted}`}>
              {gig?._creationTime
                ? new Date(gig._creationTime).toLocaleString()
                : "Unknown"}
            </span>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${colors.border}`}>
          <div className="flex items-center justify-between">
            <span className={`font-medium ${colors.text}`}>Last Updated</span>
            <span className={`text-sm ${colors.textMuted}`}>
              {gig?.lastUpdated
                ? new Date(gig.lastUpdated).toLocaleString()
                : "Never"}
            </span>
          </div>
        </div>

        {gig?.applications && gig.applications.length > 0 && (
          <div className={`p-4 rounded-xl border ${colors.border}`}>
            <div className="flex items-center justify-between">
              <span className={`font-medium ${colors.text}`}>Applications</span>
              <Badge variant="outline">{gig.applications.length}</Badge>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Type definitions
interface MinimalUser {
  _id: Id<"users">;
  clerkId: string;
  email?: string;
  username?: string;
}

interface EditGigFormProps {
  gigId: string;
  customization?: CustomProps;
  logo?: string;
}

export default function EditGigForm({
  gigId,
  customization: initialCustomization,
  logo: initialLogo,
}: EditGigFormProps) {
  const router = useRouter();
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

  // Talent Modal State
  const [activeTalentType, setActiveTalentType] = useState<TalentType>(null);
  const [showTalentModal, setShowTalentModal] = useState(false);

  // Add state for instrument dropdown
  const [isInstrumentDropdownOpen, setIsInstrumentDropdownOpen] =
    useState(false);

  // Customization state
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [gigcustom, setGigCustom] = useState<CustomProps>({
    fontColor: "",
    font: "",
    backgroundColor: "",
  });

  // Duration state
  const [durationVisible, setDurationVisible] = useState(false);

  // Band setup state
  const [showBandSetupModal, setShowBandSetupModal] = useState(false);

  // Price ranges constant
  const priceRanges = useMemo(
    () => [
      { value: "0", label: "Select range" },
      { value: "hundreds", label: "Hundreds (00)" },
      { value: "thousands", label: "Thousands (000)" },
      { value: "tensofthousands", label: "Tens of thousands (0000)" },
      { value: "hundredsofthousands", label: "Hundreds of thousands (00000)" },
      { value: "millions", label: "Millions (000000)" },
    ],
    [],
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
      "keyboard",
      "synthesizer",
      "accordion",
      "harmonica",
      "mandolin",
      "banjo",
      "steelpan",
    ],
    [],
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
    [],
  );

  const businessCategories = useMemo(
    () => [
      { value: "full", label: "🎵 Full Band", icon: Users, color: "orange" },
      { value: "personal", label: "👤 Individual", icon: Music, color: "blue" },
      { value: "other", label: "🎭 Create Band", icon: Zap, color: "purple" },
      { value: "mc", label: "🎤 MC", icon: Mic, color: "red" },
      { value: "dj", label: "🎧 DJ", icon: Volume2, color: "pink" },
      { value: "vocalist", label: "🎤 Vocalist", icon: Music, color: "green" },
    ],
    [],
  );

  // Convex queries and mutations
  const gig = useQuery(api.controllers.gigs.getGigById, {
    gigId: gigId as Id<"gigs">,
  });
  const deleteGig = useMutation(api.controllers.gigs.deleteGig);
  const { updateGig } = useGigUpdate();

  // Check if user is the owner
  const isOwner = useMemo(() => {
    return user?._id === gig?.postedBy;
  }, [user, gig]);

  // In EditGigForm, update handleTalentSubmit:
  const handleTalentSubmit = useCallback(
    (data: Partial<any>) => {
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
    [activeTalentType],
  );

  // In your EditGigForm component
  useEffect(() => {
    if (gig && !formValues) {
      const talentData = parseTalentData(gig);

      const timestampToDateTimeLocal = (timestamp: number | undefined) => {
        if (!timestamp) return undefined;

        // Create date object
        const date = new Date(timestamp);

        // Get local time components
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      // Calculate interest window days if both dates exist
      let interestWindowDays = gig.interestWindowDays; // Default
      if (gig.acceptInterestStartTime && gig.acceptInterestEndTime) {
        const start = gig.acceptInterestStartTime;
        const end = gig.acceptInterestEndTime;
        const diffInMs = end - start;
        const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
        interestWindowDays = Math.max(1, diffInDays);
      }

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
        mcLanguages: talentData.mcLanguages,
        djGenre: talentData.djGenre,
        djEquipment: talentData.djEquipment,
        vocalistGenre: talentData.vocalistGenre,
        // Interest window fields
        acceptInterestStartTime: timestampToDateTimeLocal(
          gig.acceptInterestStartTime,
        ),
        acceptInterestEndTime: timestampToDateTimeLocal(
          gig.acceptInterestEndTime,
        ),
        interestWindowDays: interestWindowDays,
        enableInterestWindow: !!(
          gig.acceptInterestStartTime || gig.acceptInterestEndTime
        ),
        maxSlots: gig.maxSlots || 1,
      };

      setFormValues(formattedValues);
      setOriginalValues(formattedValues);
      setBussinessCategory(gig.bussinesscat as BusinessCategory);
      setUrl(initialLogo || gig.logo || "");

      setGigCustom(
        initialCustomization || {
          fontColor: gig.fontColor || "",
          font: gig.font || "",
          backgroundColor: gig.backgroundColor || "",
        },
      );

      // Initialize band roles from gig data
      const bandRolesFromGig =
        gig.bandCategory?.map((role: any) => {
          const { bookedPrice, ...roleWithoutBookedPrice } = role;
          return {
            ...roleWithoutBookedPrice,
            maxSlots: role.maxSlots || 1,
            maxApplicants: role.maxApplicants || 20,
            currentApplicants: role.currentApplicants || 0,
            filledSlots: role.filledSlots || 0,
            applicants: role.applicants || [],
            bookedUsers: role.bookedUsers || [],
            requiredSkills: role.requiredSkills || [],
            description: role.description || "",
            price: role.price || undefined,
            currency: role.currency || "KES",
            negotiable: role.negotiable ?? true,
            isLocked: role.isLocked || false,
          };
        }) || [];

      setBandRoles(bandRolesFromGig);

      if (gig.date) {
        setSelectedDate(new Date(gig.date));
      }

      setIsLoading(false);
    }
  }, [gig, initialCustomization, initialLogo, formValues]);
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};

    console.log("=== DEBUG: Form Values for Validation ===");
    console.log("Form values:", formValues);

    // Basic required fields with better logging
    if (!formValues?.title?.trim()) {
      errors.title = "Title is required";
      console.log("❌ Title missing");
    }

    if (!formValues?.description?.trim()) {
      errors.description = "Description is required";
      console.log("❌ Description missing");
    }

    if (!formValues?.location?.trim()) {
      errors.location = "Location is required";
      console.log("❌ Location missing");
    }

    if (!formValues?.bussinesscat) {
      errors.bussinesscat = "Business category is required";
      console.log("❌ Business category missing");
    }

    // Category-specific validations
    if (formValues?.bussinesscat === "mc") {
      if (!formValues.mcType) {
        errors.mcType = "MC type is required";
        console.log("❌ MC type missing");
      }
      if (!formValues.mcLanguages) {
        errors.mcLanguages = "Languages are required";
        console.log("❌ MC languages missing");
      }
    } else if (formValues?.bussinesscat === "dj") {
      if (!formValues.djGenre) {
        errors.djGenre = "DJ genre is required";
        console.log("❌ DJ genre missing");
      }
      if (!formValues.djEquipment) {
        errors.djEquipment = "Equipment is required";
        console.log("❌ DJ equipment missing");
      }
    } else if (formValues?.bussinesscat === "vocalist") {
      if (!formValues.vocalistGenre || formValues.vocalistGenre.length === 0) {
        errors.vocalistGenre = "At least one genre is required";
        console.log("❌ Vocalist genre missing");
      }
    }

    // Band roles validation for "other" category
    if (
      formValues?.bussinesscat === "other" &&
      (!bandRoles || bandRoles.length === 0)
    ) {
      errors.bandRoles = "At least one band role is required";
      console.log("❌ Band roles missing for 'other' category");
    }

    // Timeline validations
    console.log("Timeline check:", {
      gigtimeline: formValues?.gigtimeline,
      date: formValues?.date,
      day: formValues?.day,
    });

    if (formValues?.gigtimeline === "once") {
      if (!formValues.date) {
        errors.date = "Event date is required for one-time events";
        console.log("❌ Date missing for one-time event");
      }
    } else if (formValues?.gigtimeline && formValues.gigtimeline !== "once") {
      if (!formValues.day) {
        errors.day = "Day of week is required for recurring events";
        console.log("❌ Day missing for recurring event");
      }
    }

    // Secret validation
    if (!formValues?.secret?.trim() || formValues.secret.length < 4) {
      errors.secret = "Secret passphrase is required (minimum 4 characters)";
      console.log("❌ Secret invalid:", formValues?.secret);
    }

    // Price validation for non-"other" categories
    if (formValues?.bussinesscat !== "other" && formValues?.price) {
      const price = parseFloat(formValues.price);
      if (isNaN(price) || price < 0) {
        errors.price = "Please enter a valid price";
        console.log("❌ Price invalid:", formValues.price);
      }
    }

    // Interest window validation - only validate if window is enabled
    const hasInterestWindow = formValues?.enableInterestWindow;

    if (hasInterestWindow) {
      const hasStartTime = formValues?.acceptInterestStartTime;
      const hasEndTime = formValues?.acceptInterestEndTime;
      const hasDays = formValues?.interestWindowDays;

      console.log("Interest window check:", {
        enabled: hasInterestWindow,
        startTime: hasStartTime,
        endTime: hasEndTime,
        days: hasDays,
        interestWindowType: formValues?.interestWindowType,
      });

      // If using dates
      if (hasStartTime || hasEndTime) {
        if (hasStartTime && !hasEndTime) {
          errors.acceptInterestEndTime =
            "End time is required when start time is set";
          console.log("❌ Interest end time missing");
        }
        if (!hasStartTime && hasEndTime) {
          errors.acceptInterestStartTime =
            "Start time is required when end time is set";
          console.log("❌ Interest start time missing");
        }

        // Validate dates if both are set
        if (hasStartTime && hasEndTime) {
          const start = new Date(formValues.acceptInterestStartTime);
          const end = new Date(formValues.acceptInterestEndTime);

          if (isNaN(start.getTime())) {
            errors.acceptInterestStartTime = "Invalid start date";
            console.log("❌ Invalid start date");
          }

          if (isNaN(end.getTime())) {
            errors.acceptInterestEndTime = "Invalid end date";
            console.log("❌ Invalid end date");
          }

          if (
            !isNaN(start.getTime()) &&
            !isNaN(end.getTime()) &&
            end <= start
          ) {
            errors.acceptInterestEndTime = "End time must be after start time";
            console.log("❌ End time not after start time");
          }
        }
      }

      // If using days
      if (hasDays) {
        const days = parseInt(formValues.interestWindowDays);
        if (isNaN(days) || days < 1 || days > 90) {
          errors.interestWindowDays =
            "Interest window must be between 1 and 90 days";
          console.log("❌ Interest window days invalid:", days);
        }
      }
    }

    // Max slots validation
    if (formValues?.maxSlots) {
      const slots = parseInt(formValues.maxSlots);
      if (isNaN(slots) || slots < 1) {
        errors.maxSlots = "At least 1 slot is required";
        console.log("❌ Max slots invalid:", slots);
      }
    }

    // Phone validation (if provided)
    if (formValues?.phoneNo && formValues.phoneNo.trim()) {
      const phoneRegex = /^[+]?[\d\s\-()]{10,}$/;
      if (!phoneRegex.test(formValues.phoneNo)) {
        errors.phoneNo = "Please enter a valid phone number";
        console.log("❌ Phone invalid:", formValues.phoneNo);
      }
    }

    console.log("=== DEBUG: Validation Complete ===");
    console.log("Total errors:", Object.keys(errors).length);
    console.log("Errors:", errors);

    // Show toast with specific errors
    if (Object.keys(errors).length > 0) {
      const errorMessages = Object.values(errors);
      const firstError = errorMessages[0];

      console.log("First error to show:", firstError);

      // You can also show all errors in console for debugging
      errorMessages.forEach((error, index) => {
        console.log(`Error ${index + 1}: ${error}`);
      });
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formValues, bandRoles]);
  // Check for changes
  // Check for changes - FIXED VERSION
  useEffect(() => {
    if (formValues && originalValues && gig) {
      console.log("=== Checking for changes ===");

      // Compare each field individually for debugging
      const changes = {
        formValuesChanged:
          JSON.stringify(formValues) !== JSON.stringify(originalValues),
        gigCustomChanged:
          JSON.stringify(gigcustom) !==
          JSON.stringify(
            initialCustomization || {
              fontColor: gig.fontColor || "",
              font: gig.font || "",
              backgroundColor: gig.backgroundColor || "",
            },
          ),
        bandRolesChanged:
          JSON.stringify(bandRoles) !== JSON.stringify(gig?.bandCategory || []),
        imageUrlChanged: imageUrl !== (initialLogo || gig.logo || ""),
      };

      console.log("Change detection:", changes);

      const hasAnyChanges = Object.values(changes).some((change) => change);
      console.log("Has any changes?", hasAnyChanges);

      setHasChanges(hasAnyChanges);
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

  // Customization file change handler
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

  const handleBandSetupSubmit = useCallback((roles: BandRoleInput[]) => {
    setBandRoles(roles);
    setHasChanges(true);
    toast.success(
      `Band setup updated! ${roles.length} role${roles.length !== 1 ? "s" : ""} configured.`,
    );
  }, []);

  // Update handleInterestWindowChange with proper dependencies
  const handleInterestWindowChange = useCallback(
    (field: string, value: any) => {
      setFormValues((prev: any) => ({
        ...prev,
        [field]: value === "" ? undefined : value,
      }));
      setHasChanges(true);
    },
    [setFormValues, setHasChanges], // Add these
  );

  // Update handleBussinessChange
  const handleBussinessChange = useCallback(
    (value: BusinessCategory) => {
      setBussinessCategory(value);
      setFormValues((prev: any) => ({
        ...prev,
        bussinesscat: value,
      }));
      setHasChanges(true);

      // Show talent modal for talent categories
      if (["mc", "dj", "vocalist"].includes(value || "")) {
        const newTalentType = value as Exclude<TalentType, null>;
        setActiveTalentType(newTalentType);
        setShowTalentModal(true);
      } else if (value === "other") {
        setShowBandSetupModal(true);
      }
    },
    [
      setBussinessCategory,
      setFormValues,
      setHasChanges,
      setActiveTalentType,
      setShowTalentModal,
      setShowBandSetupModal,
    ],
  );

  // Update handleSelectChange
  const handleSelectChange = useCallback(
    (name: string, value: string) => {
      setFormValues((prev: any) => ({
        ...prev,
        [name]: value,
      }));
      setHasChanges(true);
    },
    [setFormValues, setHasChanges],
  );

  const handleSetFormValues = useCallback((updater: any) => {
    setFormValues(updater);
    setHasChanges(true);
  }, []);

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

      setHasChanges(true);
    },
    [fieldErrors],
  );

  const handleInputBlur = useCallback(
    (fieldName: string) => {
      const value = formValues?.[fieldName as keyof typeof formValues];

      if (fieldName === "secret") {
        if (typeof value === "string") {
          if (!value.trim() || value.trim().length < 4) {
            setFieldErrors((prev) => ({
              ...prev,
              [fieldName]:
                "Secret passphrase is required (minimum 4 characters)",
            }));
          } else {
            setFieldErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors[fieldName];
              return newErrors;
            });
          }
        }
      }
    },
    [formValues],
  );

  // Add this function to determine if a field is required
  const isFieldRequired = useCallback(
    (fieldName: string) => {
      const baseRequiredFields = [
        "title",
        "description",
        "location",
        "phoneNo",
        "gigtimeline",
        "bussinesscat",
        "secret",
      ];

      const categoryRequirements: Record<string, string[]> = {
        mc: ["mcType", "mcLanguages"],
        dj: ["djGenre", "djEquipment"],
        vocalist: ["vocalistGenre"],
        personal: ["category", "price", "maxSlots"],
        full: ["price", "maxSlots"],
        other: ["bandRoles"],
      };

      const timelineRequirements =
        formValues?.gigtimeline === "once"
          ? ["date"]
          : formValues?.gigtimeline !== "once" && formValues?.gigtimeline !== ""
            ? ["day"]
            : [];

      const allRequiredFields = [
        ...baseRequiredFields,
        ...(bussinesscat ? categoryRequirements[bussinesscat] || [] : []),
        ...timelineRequirements,
      ];

      return allRequiredFields.includes(fieldName);
    },
    [bussinesscat, formValues?.gigtimeline],
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

  // Parse date/time values
  const parseDateTimeLocal = (dateTimeStr: string | undefined) => {
    if (!dateTimeStr) return undefined;
    const date = new Date(dateTimeStr);
    return isNaN(date.getTime()) ? undefined : date.getTime();
  };
  // COMPLETE handleSave function - replace your current one
  const handleSave = useCallback(async () => {
    console.log("=== SAVE ATTEMPT STARTED ===");
    console.log("Current state:", {
      hasChanges,
      fieldErrors: Object.keys(fieldErrors).length,
      formValues,
    });

    const isValid = validateForm();

    if (!isValid) {
      console.log("Validation failed!");

      const errorFields = Object.keys(fieldErrors);
      if (errorFields.length > 0) {
        const firstError = fieldErrors[errorFields[0]];
        toast.error(`Please fix: ${firstError}`, {
          description: `There are ${errorFields.length} field(s) that need attention`,
          duration: 5000,
        });

        // Scroll to first error
        const firstErrorElement = document.querySelector(
          `[name="${errorFields[0]}"]`,
        );
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          (firstErrorElement as HTMLElement).focus();
        }
      }

      return;
    }

    if (!hasChanges) {
      toast.info("No changes to save");
      setShowSaveConfirm(false);
      return;
    }

    if (!user?._id || !gigId) {
      toast.error("Authentication error");
      return;
    }

    setIsSaving(true);

    try {
      console.log("=== DEBUG: Saving gig data ===");
      console.log("Form values:", formValues);
      const isUsingDates =
        formValues.acceptInterestStartTime || formValues.acceptInterestEndTime;
      const isUsingDays =
        formValues.interestWindowDays && formValues.interestWindowDays !== 7;
      const isEnabled = formValues.enableInterestWindow;

      let interestWindowData: any = {};

      if (isEnabled) {
        if (isUsingDates) {
          // Using specific dates mode
          const acceptInterestStartTime = parseDateTimeLocal(
            formValues.acceptInterestStartTime,
          );
          const acceptInterestEndTime = parseDateTimeLocal(
            formValues.acceptInterestEndTime,
          );

          interestWindowData = {
            acceptInterestStartTime,
            acceptInterestEndTime,
            interestWindowDays: undefined, // Clear days when using dates
          };
        } else if (isUsingDays) {
          // Using days after posting mode
          interestWindowData = {
            acceptInterestStartTime: undefined, // Clear dates when using days
            acceptInterestEndTime: undefined, // Clear dates when using days
            interestWindowDays: formValues.interestWindowDays,
          };
        } else {
          // Enabled but no mode selected - default to 7 days
          interestWindowData = {
            acceptInterestStartTime: undefined,
            acceptInterestEndTime: undefined,
            interestWindowDays: 7, // Default to 7 days
          };
        }
      } else {
        // Interest window disabled - clear all fields
        interestWindowData = {
          acceptInterestStartTime: undefined,
          acceptInterestEndTime: undefined,
          interestWindowDays: undefined,
        };
      }
      // Convert band role data properly
      const convertBandRoleForConvex = (role: BandRoleInput) => {
        // Remove bookedPrice if it exists
        const { bookedPrice, ...roleWithoutBookedPrice } = role as any;

        return {
          role: roleWithoutBookedPrice.role,
          maxSlots: roleWithoutBookedPrice.maxSlots || 1,
          maxApplicants: roleWithoutBookedPrice.maxApplicants || 20,
          currentApplicants: roleWithoutBookedPrice.currentApplicants || 0,
          filledSlots: roleWithoutBookedPrice.filledSlots || 0,
          applicants: roleWithoutBookedPrice.applicants || [],
          bookedUsers: roleWithoutBookedPrice.bookedUsers || [],
          requiredSkills: roleWithoutBookedPrice.requiredSkills || [],
          description: roleWithoutBookedPrice.description || "",
          price: roleWithoutBookedPrice.price || undefined,
          currency: roleWithoutBookedPrice.currency || "KES",
          negotiable: roleWithoutBookedPrice.negotiable ?? true,
          isLocked: roleWithoutBookedPrice.isLocked || false,
        };
      };

      // Format band roles
      const formattedBandRoles =
        bussinesscat === "other" && bandRoles.length > 0
          ? bandRoles.map(convertBandRoleForConvex)
          : undefined;

      // Convert talent arrays to strings
      const mcLanguagesString = Array.isArray(formValues.mcLanguages)
        ? formValues.mcLanguages.join(", ")
        : formValues.mcLanguages || "";

      const djGenreString = Array.isArray(formValues.djGenre)
        ? formValues.djGenre.join(", ")
        : formValues.djGenre || "";

      const djEquipmentString = Array.isArray(formValues.djEquipment)
        ? formValues.djEquipment.join(", ")
        : formValues.djEquipment || "";

      const vocalistGenreString = Array.isArray(formValues.vocalistGenre)
        ? formValues.vocalistGenre.join(", ")
        : formValues.vocalistGenre || "";

      const acceptInterestStartTime = parseDateTimeLocal(
        formValues.acceptInterestStartTime,
      );
      const acceptInterestEndTime = parseDateTimeLocal(
        formValues.acceptInterestEndTime,
      );

      // Prepare update data - DO NOT include gigId in the object to be cleaned
      const updateData: any = {
        //  OPTIONAL field - can be undefined
        ...interestWindowData,

        // REQUIRED fields - don't filter these out
        gigId: gigId as Id<"gigs">,
        clerkId: user.clerkId,
        title: formValues.title,
        description: formValues.description,
        location: formValues.location,
        secret: formValues.secret,
        bussinesscat: formValues.bussinesscat,

        // OPTIONAL fields - can be undefined
        phone: formValues.phoneNo || undefined,
        price: formValues.price ? parseFloat(formValues.price) : undefined,
        category: formValues.category || undefined,
        otherTimeline: formValues.otherTimeline || undefined,
        gigtimeline: formValues.gigtimeline || undefined,
        day: formValues.day || undefined,
        date: formValues.date ? new Date(formValues.date).getTime() : undefined,
        pricerange: formValues.pricerange || undefined,
        currency: formValues.currency || "KES",
        negotiable: formValues.negotiable ?? true,
        mcType: formValues.mcType || undefined,
        mcLanguages: mcLanguagesString || undefined,
        djGenre: djGenreString || undefined,
        djEquipment: djEquipmentString || undefined,
        vocalistGenre: vocalistGenreString || undefined,
        acceptInterestStartTime,
        acceptInterestEndTime,
        interestWindowDays: formValues.interestWindowDays || undefined,
        maxSlots: formValues.maxSlots
          ? parseInt(formValues.maxSlots)
          : undefined,
        font: gigcustom.font || undefined,
        fontColor: gigcustom.fontColor || undefined,
        backgroundColor: gigcustom.backgroundColor || undefined,
        logo: imageUrl || undefined,
        bandCategory: formattedBandRoles,
        time: {
          start: formValues.start || "",
          end: formValues.end || "",
          durationFrom: formValues.durationfrom || "am",
          durationTo: formValues.durationto || "pm",
        },
      };

      // Clean up undefined values but keep required fields
      const cleanUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => {
          // Always keep these required fields even if empty
          const requiredFields = [
            "gigId",
            "clerkId",
            "title",
            "description",
            "location",
            "secret",
            "bussinesscat",
          ];
          if (requiredFields.includes(_ as string)) {
            return true;
          }
          // For other fields, only keep if not undefined
          return v !== undefined;
        }),
      ) as any; // Cast to any to satisfy TypeScript

      console.log("Sending update data:", cleanUpdateData);
      console.log("Has gigId?", !!cleanUpdateData.gigId);

      // Call the update function
      await updateGig(cleanUpdateData);

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
    validateForm,
    fieldErrors,
    hasChanges,
    formValues,
    gigcustom,
    imageUrl,
    bandRoles,
    bussinesscat,
    user,
    gigId,
    updateGig,
    router,
  ]);
  // Add this near your other debug functions
  const debugInterestWindowData = () => {
    console.log("=== DEBUG: Interest Window Data ===");
    console.log("Form Values:", {
      acceptInterestStartTime: formValues?.acceptInterestStartTime,
      acceptInterestEndTime: formValues?.acceptInterestEndTime,
      interestWindowDays: formValues?.interestWindowDays,
      enableInterestWindow: formValues?.enableInterestWindow,
    });

    // Parse the dates to see what we have
    if (formValues?.acceptInterestStartTime) {
      const start = new Date(formValues.acceptInterestStartTime);
      console.log("Start Date parsed:", {
        raw: formValues.acceptInterestStartTime,
        ISO: start.toISOString(),
        local: start.toLocaleString(),
        timestamp: start.getTime(),
        isValid: !isNaN(start.getTime()),
      });
    }

    if (formValues?.acceptInterestEndTime) {
      const end = new Date(formValues.acceptInterestEndTime);
      console.log("End Date parsed:", {
        raw: formValues.acceptInterestEndTime,
        ISO: end.toISOString(),
        local: end.toLocaleString(),
        timestamp: end.getTime(),
        isValid: !isNaN(end.getTime()),
      });
    }

    // Check what the component is getting from the gig
    console.log("Original gig data:", {
      start: gig?.acceptInterestStartTime,
      end: gig?.acceptInterestEndTime,
      startType: typeof gig?.acceptInterestStartTime,
      endType: typeof gig?.acceptInterestEndTime,
    });
  };
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

    // Initialize band roles from gig data
    const bandRolesFromGig =
      (gig &&
        gig?.bandCategory?.map((role: any) => {
          const { bookedPrice, ...roleWithoutBookedPrice } = role;

          return {
            ...roleWithoutBookedPrice,
            maxSlots: role.maxSlots || 1,
            maxApplicants: role.maxApplicants || 20,
            currentApplicants: role.currentApplicants || 0,
            filledSlots: role.filledSlots || 0,
            applicants: role.applicants || [],
            bookedUsers: role.bookedUsers || [],
            requiredSkills: role.requiredSkills || [],
            description: role.description || "",
            price: role.price || undefined,
            currency: role.currency || "KES",
            negotiable: role.negotiable ?? true,
            isLocked: role.isLocked || false,
            // DO NOT include bookedPrice
          };
        })) ||
      [];

    setBandRoles(bandRolesFromGig);
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

  // Slots Configuration Component
  const SlotsConfiguration = useCallback(() => {
    if (!bussinesscat || bussinesscat === "other") return null;

    const getDefaultSlots = () => {
      switch (bussinesscat) {
        case "full":
          return 5;
        case "personal":
          return 1;
        case "mc":
        case "dj":
        case "vocalist":
          return 1;
        default:
          return 1;
      }
    };

    const getSlotLabel = () => {
      switch (bussinesscat) {
        case "full":
          return "band members";
        case "personal":
          return "person";
        case "mc":
          return "MC";
        case "dj":
          return "DJ";
        case "vocalist":
          return "vocalist";
        default:
          return "slots";
      }
    };

    const getDescription = () => {
      switch (bussinesscat) {
        case "full":
          return "How many musicians do you need for your full band?";
        case "personal":
          return "How many individual musicians do you need?";
        case "mc":
          return "How many MCs do you need for your event?";
        case "dj":
          return "How many DJs do you need for your event?";
        case "vocalist":
          return "How many vocalists do you need for your event?";
        default:
          return "Number of positions available";
      }
    };

    const getIcon = () => {
      switch (bussinesscat) {
        case "full":
          return Users;
        case "personal":
          return Users;
        case "mc":
          return Mic;
        case "dj":
          return Volume2;
        case "vocalist":
          return Music;
        default:
          return Users;
      }
    };

    const Icon = getIcon();
    const currentSlots = formValues?.maxSlots || getDefaultSlots();

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "rounded-xl p-6 border mt-4",
          colors.border,
          colors.backgroundMuted,
          "relative overflow-hidden",
        )}
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-12 translate-x-12 blur-2xl" />

        <div className="flex items-start justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10">
              <Icon className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className={cn("font-semibold", colors.text)}>
                Positions Needed
              </h3>
              <p className={cn("text-sm", colors.textMuted)}>
                {getDescription()}
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="flex-1">
              <label
                className={cn("block text-sm font-medium mb-3", colors.text)}
              >
                Number of {getSlotLabel()}
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setFormValues((prev: any) => ({
                        ...prev,
                        maxSlots: Math.max(
                          1,
                          (prev.maxSlots || getDefaultSlots()) - 1,
                        ),
                      }))
                    }
                    className="h-12 w-12 rounded-xl text-lg"
                  >
                    -
                  </Button>

                  <div className="relative">
                    <Input
                      type="number"
                      value={currentSlots}
                      onChange={(e) =>
                        setFormValues((prev: any) => ({
                          ...prev,
                          maxSlots: Math.max(
                            1,
                            parseInt(e.target.value) || getDefaultSlots(),
                          ),
                        }))
                      }
                      min="1"
                      max={bussinesscat === "full" ? "20" : "10"}
                      className="w-24 h-12 text-center text-xl font-bold"
                    />
                    <div className="absolute inset-y-0 right-2 flex items-center">
                      <span className={cn("text-sm", colors.textMuted)}>
                        {getSlotLabel()}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setFormValues((prev: any) => ({
                        ...prev,
                        maxSlots: (prev.maxSlots || getDefaultSlots()) + 1,
                      }))
                    }
                    className="h-12 w-12 rounded-xl text-lg"
                  >
                    +
                  </Button>
                </div>

                {bussinesscat === "full" && (
                  <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                    {[3, 4, 5, 6, 7, 8].map((num) => (
                      <Button
                        key={num}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFormValues((prev: any) => ({
                            ...prev,
                            maxSlots: num,
                          }));
                          setHasChanges(true);
                        }}
                        className={cn(
                          "px-3",
                          currentSlots === num &&
                            "bg-gradient-to-r from-blue-500 to-purple-500 text-white",
                        )}
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1">
              <div className={cn("p-4 rounded-xl border", colors.border)}>
                <div className="flex items-center justify-between mb-2">
                  <span className={cn("text-sm font-medium", colors.text)}>
                    Available Positions
                  </span>
                  <Badge variant="outline">
                    {currentSlots} {getSlotLabel()}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: currentSlots }).map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        "bg-gradient-to-r from-blue-500/20 to-purple-500/20",
                        "border border-blue-500/30",
                      )}
                    >
                      <Users className="w-4 h-4 text-blue-500" />
                    </div>
                  ))}
                </div>

                {bussinesscat === "full" && (
                  <p className={cn("text-xs mt-2", colors.textMuted)}>
                    {currentSlots} positions to fill in your band
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className={cn("text-xs", colors.textMuted)}>
                {bussinesscat === "full"
                  ? "You can specify exact roles for each slot in the next section."
                  : "This is the number of positions available for this gig."}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }, [bussinesscat, formValues?.maxSlots, colors]);

  // Render Price Information
  const renderPriceInformation = useCallback(() => {
    if (bussinesscat === "other") return null;

    return (
      <div className="space-y-4">
        <div>
          <Label className={cn("text-lg font-semibold mb-4", colors.text)}>
            Budget Information
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className={cn("text-sm font-medium mb-2", colors.text)}>
                Currency
              </Label>
              <Select
                value={formValues?.currency || "KES"}
                onValueChange={(value) => handleSelectChange("currency", value)}
              >
                <SelectTrigger className={cn("rounded-xl py-3", colors.border)}>
                  <SelectValue placeholder="Select currency" />
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
              <Label className={cn("text-sm font-medium mb-2", colors.text)}>
                Amount
              </Label>
              <MemoizedInput
                type="number"
                value={formValues?.price || ""}
                onChange={handleInputChange}
                onBlur={() => handleInputBlur("price")}
                name="price"
                placeholder="15000"
                icon={DollarSign}
                min="0"
              />
            </div>

            <div>
              <Label className={cn("text-sm font-medium mb-2", colors.text)}>
                Price Range
              </Label>
              <Select
                value={formValues?.pricerange || ""}
                onValueChange={(value) =>
                  handleSelectChange("pricerange", value)
                }
              >
                <SelectTrigger className={cn("rounded-xl py-3", colors.border)}>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent className={colors.background}>
                  {priceRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {(formValues?.price || formValues?.pricerange !== "0") && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "rounded-xl p-4 border",
              colors.border,
              colors.backgroundMuted,
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
                    {formValues?.currency === "USD" && "$"}
                    {formValues?.currency === "EUR" && "€"}
                    {formValues?.currency === "GBP" && "£"}
                    {formValues?.currency === "KES" && "KSh"}
                    {formValues?.currency === "NGN" && "₦"}
                    {formValues?.price || "---"}
                  </span>
                  {formValues?.pricerange !== "0" && formValues?.pricerange && (
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
    );
  }, [
    bussinesscat,
    formValues,
    colors,
    handleSelectChange,
    handleInputChange,
    handleInputBlur,
    setHasChanges,
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
      {/* Talent Modal */}
      <AnimatePresence>
        {showTalentModal && activeTalentType && (
          <TalentModal
            isOpen={showTalentModal}
            onClose={() => setShowTalentModal(false)}
            talentType={activeTalentType}
            onSubmit={handleTalentSubmit}
            initialData={{
              ...(activeTalentType === "mc" && {
                mcType: formValues?.mcType,
                mcLanguages: formValues?.mcLanguages,
              }),
              ...(activeTalentType === "dj" && {
                djGenre: formValues?.djGenre,
                djEquipment: formValues?.djEquipment,
              }),
              ...(activeTalentType === "vocalist" && {
                vocalistGenre: formValues?.vocalistGenre,
              }),
            }}
          />
        )}
      </AnimatePresence>

      {/* Customization Modal */}
      <AnimatePresence>
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
      </AnimatePresence>

      {/* Band Setup Modal */}
      <AnimatePresence>
        {showBandSetupModal && (
          <BandSetupModal
            isOpen={showBandSetupModal}
            onClose={() => setShowBandSetupModal(false)}
            onSubmit={handleBandSetupSubmit}
            initialRoles={bandRoles}
            isEditMode={true}
          />
        )}
      </AnimatePresence>

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
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <TabsList
            className={`grid grid-cols-4 ${colors.backgroundSecondary}`}
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
                    <Label
                      htmlFor="title"
                      className={cn("text-lg font-semibold mb-4", colors.text)}
                    >
                      Title
                    </Label>
                    <MemoizedInput
                      id="title"
                      value={formValues?.title || ""}
                      onChange={handleInputChange}
                      name="title"
                      placeholder="Gig title"
                      error={fieldErrors.title}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <Label
                      htmlFor="description"
                      className={cn("text-lg font-semibold mb-4", colors.text)}
                    >
                      Description
                    </Label>
                    <MemoizedTextarea
                      id="description"
                      value={formValues?.description || ""}
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
                    <Label
                      htmlFor="location"
                      className={cn("text-lg font-semibold mb-4", colors.text)}
                    >
                      Location
                    </Label>
                    <MemoizedInput
                      id="location"
                      value={formValues?.location || ""}
                      onChange={handleInputChange}
                      name="location"
                      placeholder="Event location"
                      error={fieldErrors.location}
                      required
                      icon={MapPin}
                    />
                  </div>

                  {/* Business Category */}
                  <div>
                    <Label
                      className={cn("text-lg font-semibold mb-4", colors.text)}
                    >
                      Business Category
                    </Label>
                    <Select
                      value={bussinesscat || ""}
                      onValueChange={(value) =>
                        handleBussinessChange(value as BusinessCategory)
                      }
                    >
                      <SelectTrigger className={cn("py-6", colors.border)}>
                        <SelectValue placeholder="Select who you need for your gig" />
                      </SelectTrigger>
                      <SelectContent className={colors.background}>
                        {businessCategories.map((category) => {
                          const Icon = category.icon;
                          return (
                            <SelectItem
                              key={category.value}
                              value={category.value}
                              className="py-3"
                            >
                              <div className="flex items-center gap-3">
                                <Icon className="w-5 h-5" />
                                <span>{category.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <ErrorMessage error={fieldErrors.bussinesscat} />
                  </div>

                  {/* Band Setup Preview */}
                  {bussinesscat !== "other" && (
                    <>
                      <TalentPreview formValues={formValues} colors={colors} />
                    </>
                  )}

                  {bussinesscat === "other" && (
                    <>
                      <BandSetupPreview
                        bandRoles={bandRoles}
                        bussinesscat={bussinesscat}
                        colors={colors}
                        setShowBandSetupModal={setShowBandSetupModal}
                      />

                      {(!bandRoles || bandRoles.length === 0) && (
                        <div className="mt-4 p-4 border border-dashed rounded-xl">
                          <div className="text-center">
                            <Users className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                              No band roles configured
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                              Add roles to your band setup
                            </p>
                            <Button
                              onClick={() => setShowBandSetupModal(true)}
                              variant="outline"
                              className="gap-2"
                            >
                              <Users className="w-4 h-4" />
                              Configure Band Setup
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
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
                      value={formValues?.phoneNo || ""}
                      onChange={handleInputChange}
                      name="phoneNo"
                      placeholder="Phone number"
                      icon={Phone}
                    />
                  </div>

                  {/* Price Information */}
                  {renderPriceInformation()}

                  {/* Slots Configuration */}
                  <SlotsConfiguration />

                  {/* Instrument Selection - Only for personal category */}
                  {bussinesscat === "personal" && (
                    <div>
                      <Label
                        className={cn(
                          "text-lg font-semibold mb-4",
                          colors.text,
                        )}
                      >
                        Instrument Selection
                      </Label>

                      <div className="relative">
                        <Guitar
                          className={cn(
                            "absolute left-3 top-1/2 transform -translate-y-1/2 z-10",
                            colors.textMuted,
                          )}
                        />

                        {/* Custom dropdown implementation */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setIsInstrumentDropdownOpen((prev) => !prev)
                            }
                            className={cn(
                              "w-full pl-12 pr-10 py-3 text-left rounded-xl border transition-all duration-200",
                              colors.border,
                              colors.background,
                              colors.text,
                              "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20",
                            )}
                          >
                            {formValues?.category
                              ? formValues.category.charAt(0).toUpperCase() +
                                formValues.category.slice(1)
                              : "Select your instrument"}
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4" />
                          </button>

                          {/* Dropdown menu */}
                          {isInstrumentDropdownOpen && (
                            <div className="absolute z-50 mt-1 w-full rounded-xl border shadow-lg max-h-60 overflow-auto">
                              <div
                                className={cn("p-2", colors.backgroundMuted)}
                              >
                                {individualInstruments.map((instrument) => (
                                  <button
                                    key={instrument}
                                    type="button"
                                    onClick={() => {
                                      handleSelectChange(
                                        "category",
                                        instrument,
                                      );
                                      setIsInstrumentDropdownOpen(false);
                                    }}
                                    className={cn(
                                      "w-full px-4 py-3 text-left rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors",
                                      formValues?.category === instrument
                                        ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                                        : colors.text,
                                    )}
                                  >
                                    {instrument.charAt(0).toUpperCase() +
                                      instrument.slice(1)}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Show error if required */}
                      {isFieldRequired("category") && !formValues?.category && (
                        <p className="text-sm text-red-500 mt-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Please select an instrument
                        </p>
                      )}
                    </div>
                  )}

                  {/* Timeline Section */}
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${colors.text}`}>
                      Timeline
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label
                          className={cn(
                            "text-sm font-medium mb-2",
                            colors.text,
                          )}
                        >
                          Gig Type
                        </Label>
                        <Select
                          value={formValues?.gigtimeline || ""}
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

                      {/* Day of Week (for recurring events) */}
                      {formValues?.gigtimeline !== "once" &&
                        formValues?.gigtimeline !== "" && (
                          <div>
                            <Label
                              className={cn(
                                "text-sm font-medium mb-2",
                                colors.text,
                              )}
                            >
                              Day of Week
                            </Label>
                            <Select
                              value={formValues?.day || ""}
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
                                <SelectItem value="thursday">
                                  Thursday
                                </SelectItem>
                                <SelectItem value="friday">Friday</SelectItem>
                                <SelectItem value="saturday">
                                  Saturday
                                </SelectItem>
                                <SelectItem value="sunday">Sunday</SelectItem>
                              </SelectContent>
                            </Select>
                            <ErrorMessage error={fieldErrors.day} />
                          </div>
                        )}
                    </div>

                    {/* Event Date (for one-time events) */}
                    {formValues?.gigtimeline === "once" && (
                      <div className="mt-4">
                        <Label
                          className={cn(
                            "text-sm font-medium mb-2",
                            colors.text,
                          )}
                        >
                          Event Date
                        </Label>
                        <DatePicker
                          selected={selectedDate}
                          onChange={handleDate}
                          className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                            colors.border
                          } ${colors.background} ${colors.text} focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20`}
                          placeholderText="Select a date"
                          isClearable
                          minDate={new Date()}
                          dateFormat="MMMM d, yyyy"
                        />
                        <ErrorMessage error={fieldErrors.date} />
                      </div>
                    )}

                    {/* Custom Timeline Input */}
                    {formValues?.gigtimeline === "other" && (
                      <div className="mt-4">
                        <Label
                          className={cn(
                            "text-sm font-medium mb-2",
                            colors.text,
                          )}
                        >
                          Custom Schedule
                        </Label>
                        <MemoizedInput
                          value={formValues?.otherTimeline || ""}
                          onChange={handleInputChange}
                          name="otherTimeline"
                          placeholder="e.g., 'Every other Saturday' or 'First Friday of each month'"
                        />
                      </div>
                    )}
                  </div>

                  {/* Duration Section */}
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${colors.text}`}>
                      Duration
                    </h3>

                    <div
                      onClick={() => setDurationVisible((prev) => !prev)}
                      className={cn(
                        "flex justify-between items-center p-4 rounded-xl border cursor-pointer transition-all duration-200",
                        colors.border,
                        colors.backgroundMuted,
                        "hover:bg-gray-50 dark:hover:bg-gray-800",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5" />
                        <div>
                          <span className={cn("font-medium", colors.text)}>
                            {durationVisible ? "Hide Duration" : "Set Duration"}
                          </span>
                          {!durationVisible && (
                            <p className={cn("text-sm", colors.textMuted)}>
                              {formValues?.start && formValues?.end
                                ? `${formValues.start} ${formValues.durationfrom} - ${formValues.end} ${formValues.durationto}`
                                : "Click to set start and end times"}
                            </p>
                          )}
                        </div>
                      </div>
                      {durationVisible ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>

                    {durationVisible && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Start Time */}
                          <div>
                            <Label
                              className={cn(
                                "text-sm font-medium mb-2",
                                colors.text,
                              )}
                            >
                              Start Time
                            </Label>
                            <div className="flex gap-2">
                              <MemoizedInput
                                value={formValues?.start || ""}
                                onChange={handleInputChange}
                                name="start"
                                placeholder="e.g., 10"
                                className="flex-1"
                              />
                              <Select
                                value={formValues?.durationfrom || "am"}
                                onValueChange={(value) =>
                                  handleSelectChange("durationfrom", value)
                                }
                              >
                                <SelectTrigger
                                  className={cn("w-24", colors.border)}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className={colors.background}>
                                  <SelectItem value="am">AM</SelectItem>
                                  <SelectItem value="pm">PM</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* End Time */}
                          <div>
                            <Label
                              className={cn(
                                "text-sm font-medium mb-2",
                                colors.text,
                              )}
                            >
                              End Time
                            </Label>
                            <div className="flex gap-2">
                              <MemoizedInput
                                value={formValues?.end || ""}
                                onChange={handleInputChange}
                                name="end"
                                placeholder="e.g., 12"
                                className="flex-1"
                              />
                              <Select
                                value={formValues?.durationto || "pm"}
                                onValueChange={(value) =>
                                  handleSelectChange("durationto", value)
                                }
                              >
                                <SelectTrigger
                                  className={cn("w-24", colors.border)}
                                >
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
                      </motion.div>
                    )}
                  </div>

                  {/* Secret Passphrase */}
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${colors.text}`}>
                      Security
                    </h3>
                    <div>
                      <Label
                        className={cn("text-sm font-medium mb-2", colors.text)}
                      >
                        Secret Passphrase *
                      </Label>
                      <p className={cn("text-sm mb-3", colors.textMuted)}>
                        Required for gig security. This password protects access
                        to your gig details.
                      </p>
                      <div className="relative">
                        <MemoizedInput
                          type={secretpass ? "text" : "password"}
                          value={formValues?.secret || ""}
                          onChange={handleInputChange}
                          onBlur={() => handleInputBlur("secret")}
                          name="secret"
                          placeholder="Create a secure passphrase (minimum 4 characters)"
                          required={true}
                          error={fieldErrors.secret}
                        />
                        <button
                          type="button"
                          onClick={() => setSecretPass(!secretpass)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                        >
                          {secretpass ? (
                            <EyeOff className="w-4 h-4 text-gray-500" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                      </div>

                      {/* Password Strength Indicator */}
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className={cn("text-xs", colors.textMuted)}>
                            Password strength
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              !formValues?.secret
                                ? "text-gray-400"
                                : formValues.secret.length < 4
                                  ? "text-red-500"
                                  : formValues.secret.length < 8
                                    ? "text-amber-500"
                                    : formValues.secret.length < 12
                                      ? "text-blue-500"
                                      : "text-green-500"
                            }`}
                          >
                            {!formValues?.secret
                              ? "Empty"
                              : formValues.secret.length < 4
                                ? "Weak"
                                : formValues.secret.length < 8
                                  ? "Fair"
                                  : formValues.secret.length < 12
                                    ? "Good"
                                    : "Strong"}
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              !formValues?.secret
                                ? "w-0"
                                : formValues.secret.length < 4
                                  ? "w-1/4 bg-red-500"
                                  : formValues.secret.length < 8
                                    ? "w-1/2 bg-amber-500"
                                    : formValues.secret.length < 12
                                      ? "w-3/4 bg-blue-500"
                                      : "w-full bg-green-500"
                            }`}
                          />
                        </div>
                        <p className={cn("text-xs mt-1", colors.textMuted)}>
                          Use at least 4 characters. Longer is better.
                        </p>
                      </div>

                      {!fieldErrors.secret && formValues?.secret && (
                        <p
                          className={cn(
                            "text-xs mt-2 text-green-600 dark:text-green-400",
                          )}
                        >
                          ✓ Secure passphrase set
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Negotiable Switch */}
                  {formValues.bussinesscat !== "other" && (
                    <div className="flex items-center justify-between p-4 rounded-xl border">
                      <div>
                        <Label className={cn("font-medium", colors.text)}>
                          Price Negotiable
                        </Label>
                        <p className={cn("text-sm", colors.textMuted)}>
                          Allow applicants to negotiate the price
                        </p>
                      </div>
                      <Switch
                        checked={formValues?.negotiable ?? true}
                        onCheckedChange={(checked) => {
                          setFormValues((prev: any) => ({
                            ...prev,
                            negotiable: checked,
                          }));
                          setHasChanges(true); // Add this
                        }}
                      />
                    </div>
                  )}

                  <InterestWindowSection
                    formValues={formValues}
                    colors={colors}
                    onInterestWindowChange={handleInterestWindowChange} // Add this
                  />
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
              {hasChanges
                ? "Are you sure you want to save all changes to this gig?"
                : "No changes detected to save."}
            </DialogDescription>
          </DialogHeader>

          {/* Status indicators */}
          <div className="space-y-4 py-4">
            {/* Change status */}
            <div
              className={`p-3 rounded-lg ${hasChanges ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"}`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${hasChanges ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
                />
                <span
                  className={`text-sm font-medium ${hasChanges ? "text-green-700 dark:text-green-300" : "text-gray-600 dark:text-gray-400"}`}
                >
                  {hasChanges ? "Changes detected" : "No changes detected"}
                </span>
              </div>
              {hasChanges && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 ml-4">
                  Ready to save your modifications
                </p>
              )}
            </div>

            {/* Error status */}
            {Object.keys(fieldErrors).length > 0 && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">
                    Please fix {Object.keys(fieldErrors).length} error
                    {Object.keys(fieldErrors).length !== 1 ? "s" : ""} before
                    saving:
                  </p>
                </div>
                <ul className="mt-2 space-y-1 ml-6">
                  {Object.entries(fieldErrors).map(([field, error]) => (
                    <li key={field} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5" />
                      <span className="text-sm text-red-600 dark:text-red-400">
                        {error}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Save status */}
            {isSaving && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Saving changes...
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveConfirm(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                isSaving || Object.keys(fieldErrors).length > 0 || !hasChanges
              }
              className={cn(
                "transition-all duration-200",
                isSaving && "bg-blue-600 hover:bg-blue-700",
                !hasChanges &&
                  "bg-gray-400 hover:bg-gray-400 cursor-not-allowed",
                Object.keys(fieldErrors).length > 0 &&
                  "bg-red-400 hover:bg-red-400 cursor-not-allowed",
                hasChanges &&
                  Object.keys(fieldErrors).length === 0 &&
                  !isSaving &&
                  "bg-green-600 hover:bg-green-700 text-white",
              )}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : !hasChanges ? (
                "No Changes"
              ) : Object.keys(fieldErrors).length > 0 ? (
                "Fix Errors First"
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
