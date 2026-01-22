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
  Guitar as GuitarIcon,
  Music as MusicIcon,
  Mic as MicIcon,
  Volume2 as Volume2Icon,
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

// In your EditGigForm, update the convert functions
const convertToBandSetupRole = (role: BandRoleInput): BandSetupRole => {
  return {
    role: role.role,
    maxSlots: role.maxSlots || 1,
    maxApplicants: role.maxApplicants || 20,
    currentApplicants: role.currentApplicants || 0,
    requiredSkills: role.requiredSkills || [],
    description: role.description || "",
    price: role.price?.toString() || "",
    currency: role.currency || "KES",
    negotiable: role.negotiable ?? true,
    filledSlots: role.filledSlots || 0,
    isLocked: role.isLocked || false,
  };
};

const convertFromBandSetupRole = (role: BandSetupRole): BandRoleInput => {
  return {
    role: role.role,
    maxSlots: role.maxSlots,
    maxApplicants: role.maxApplicants,
    currentApplicants: role.currentApplicants,
    requiredSkills: role.requiredSkills,
    description: role.description,
    price: role.price ? parseFloat(role.price) : undefined,
    currency: role.currency,
    negotiable: role.negotiable,
    filledSlots: role.filledSlots,
    isLocked: role.isLocked,
  };
};

// Add these utility functions for conversion between types
const convertBandRoleInputToSetup = (role: BandRoleInput): BandSetupRole => {
  return {
    role: role.role,
    maxSlots: role.maxSlots || 1,
    maxApplicants: role.maxApplicants || 20,
    currentApplicants: role.currentApplicants || 0,
    requiredSkills: role.requiredSkills || [],
    description: role.description || "",
    price: role.price?.toString() || "",
    currency: role.currency || "KES",
    negotiable: role.negotiable ?? true,
    filledSlots: role.filledSlots || 0,
    isLocked: role.isLocked || false,
  };
};

const convertBandSetupRoleToInput = (role: BandSetupRole): BandRoleInput => {
  return {
    role: role.role,
    maxSlots: role.maxSlots,
    maxApplicants: role.maxApplicants,
    currentApplicants: role.currentApplicants,
    requiredSkills: role.requiredSkills || [],
    description: role.description,
    price: role.price ? parseFloat(role.price) : undefined,
    currency: role.currency,
    negotiable: role.negotiable,
    filledSlots: role.filledSlots,
    isLocked: role.isLocked,
  };
};

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

// Band Setup Preview Component
const BandSetupPreview = React.memo(
  ({ bandRoles, bussinesscat, colors, setShowBandSetupModal }: any) => {
    if (bussinesscat !== "other" || !bandRoles || bandRoles.length === 0)
      return null;

    const totalPositions = bandRoles.reduce(
      (sum: number, role: BandRoleInput) => sum + (role.maxSlots || 1),
      0,
    );

    const totalMaxApplicants = bandRoles.reduce(
      (sum: number, role: BandRoleInput) => sum + (role.maxApplicants || 20),
      0,
    );

    const totalCurrentApplicants = bandRoles.reduce(
      (sum: number, role: BandRoleInput) => sum + (role.currentApplicants || 0),
      0,
    );

    const totalFilledSlots = bandRoles.reduce(
      (sum: number, role: BandRoleInput) => sum + (role.filledSlots || 0),
      0,
    );

    const totalPrice = bandRoles.reduce((sum: number, role: BandRoleInput) => {
      const price = role.price || 0;
      return sum + price * (role.maxSlots || 1);
    }, 0);

    const hasPricedRoles = bandRoles.some(
      (role: BandRoleInput) => role.price && role.price > 0,
    );

    const hasNegotiableRoles = bandRoles.some(
      (role: BandRoleInput) => role.negotiable,
    );

    // Get role icon based on role name
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

    // Get color for role badge
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
        Saxophonist:
          "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
        Trumpeter:
          "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
        Violinist:
          "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
        "Backup Vocalist":
          "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
        Percussionist:
          "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
        DJ: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
        "MC/Host":
          "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
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
          "rounded-xl p-4 border mt-4",
          colors.border,
          colors.backgroundMuted,
          "relative overflow-hidden",
        )}
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full -translate-y-12 translate-x-12 blur-2xl" />

        <div className="flex justify-between items-center mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10">
              <Users className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className={cn("font-semibold", colors.text)}>Band Setup</h3>
              <p className={cn("text-sm", colors.textMuted)}>
                {bandRoles.length} role{bandRoles.length !== 1 ? "s" : ""},{" "}
                {totalPositions} position{totalPositions !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={cn("text-sm", colors.hoverBg, "hover:text-purple-600")}
            onClick={() => setShowBandSetupModal(true)}
          >
            Edit
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
          {bandRoles.map((role: BandRoleInput, index: number) => {
            const maxSlots = role.maxSlots || 1;
            const filledSlots = role.filledSlots || 0;
            const maxApplicants = role.maxApplicants || 20;
            const currentApplicants = role.currentApplicants || 0;
            const filledPercentage =
              maxSlots > 0 ? (filledSlots / maxSlots) * 100 : 0;
            const applicantPercentage =
              maxApplicants > 0 ? (currentApplicants / maxApplicants) * 100 : 0;
            const roleCurrency = role.currency || "KES";

            return (
              <div
                key={index}
                className={cn(
                  "p-4 border rounded-lg hover:shadow-md transition-shadow",
                  colors.border,
                  colors.background,
                  "group",
                )}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "p-1.5 rounded-md",
                        getRoleColor(role.role),
                      )}
                    >
                      {getRoleIcon(role.role)}
                    </div>
                    <span className="font-medium text-sm">{role.role}</span>
                  </div>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-xs">
                      {maxSlots} slot{maxSlots > 1 ? "s" : ""}
                    </Badge>
                    {filledSlots > 0 && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      >
                        {filledSlots} filled
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Slot Filling Progress */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                      Filled Slots
                    </span>
                    <span className="font-medium">
                      {filledSlots}/{maxSlots}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        filledPercentage < 30
                          ? "bg-gradient-to-r from-green-500 to-emerald-500"
                          : filledPercentage < 70
                            ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                            : filledPercentage < 90
                              ? "bg-gradient-to-r from-orange-500 to-amber-500"
                              : "bg-gradient-to-r from-red-500 to-pink-500",
                      )}
                      style={{ width: `${filledPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Applicant Progress */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                      Applications
                    </span>
                    <span className="font-medium">
                      {currentApplicants}/{maxApplicants}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        applicantPercentage < 30
                          ? "bg-gradient-to-r from-green-500 to-emerald-500"
                          : applicantPercentage < 70
                            ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                            : applicantPercentage < 90
                              ? "bg-gradient-to-r from-orange-500 to-amber-500"
                              : "bg-gradient-to-r from-red-500 to-pink-500",
                      )}
                      style={{ width: `${applicantPercentage}%` }}
                    />
                  </div>
                </div>

                {role?.requiredSkills && role.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {role.requiredSkills.slice(0, 3).map((skill) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="text-xs px-2 py-0.5"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {role.requiredSkills.length > 3 && (
                      <Badge
                        variant="secondary"
                        className="text-xs px-2 py-0.5"
                      >
                        +{role.requiredSkills.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                {role.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                    {role.description}
                  </p>
                )}

                {/* Price Info */}
                {role.price && role.price > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3 h-3 text-green-500" />
                        <span className="text-xs font-medium">
                          {roleCurrency} {role.price.toLocaleString()}
                        </span>
                      </div>
                      {role.negotiable && (
                        <Badge
                          variant="outline"
                          className="text-xs px-2 py-0.5 text-green-600 border-green-200"
                        >
                          Negotiable
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 relative z-10">
          <div className="grid grid-cols-3 gap-2 text-center mb-3">
            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
              <div className="text-xs text-gray-500">Total Roles</div>
              <div className="text-lg font-bold text-orange-600">
                {bandRoles.length}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="text-xs text-gray-500">Total Positions</div>
              <div className="text-lg font-bold text-blue-600">
                {totalPositions}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="text-xs text-gray-500">Filled Positions</div>
              <div className="text-lg font-bold text-green-600">
                {totalFilledSlots}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center mb-3">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <div className="text-xs text-gray-500">Max Applicants</div>
              <div className="text-lg font-bold text-purple-600">
                {totalMaxApplicants}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/20">
              <div className="text-xs text-gray-500">Current Applicants</div>
              <div className="text-lg font-bold text-cyan-600">
                {totalCurrentApplicants}
              </div>
            </div>
          </div>

          {hasPricedRoles && (
            <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className={cn("text-sm font-medium", colors.text)}>
                  Total Budget
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  {bandRoles[0]?.currency || "KES"}{" "}
                  {totalPrice.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  Across{" "}
                  {
                    bandRoles.filter(
                      (r: BandRoleInput) => r.price && r.price > 0,
                    ).length
                  }{" "}
                  priced roles
                </div>
              </div>
            </div>
          )}

          {totalFilledSlots > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-2 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium">
                  {totalFilledSlots} position
                  {totalFilledSlots !== 1 ? "s" : ""} filled
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {Math.round((totalFilledSlots / totalPositions) * 100)}% of
                total positions
              </div>
            </motion.div>
          )}

          {totalCurrentApplicants > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-2 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium">
                  {totalCurrentApplicants} application
                  {totalCurrentApplicants !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {Math.round(
                  (totalCurrentApplicants / totalMaxApplicants) * 100,
                )}
                % of maximum applicants
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  },
);
BandSetupPreview.displayName = "BandSetupPreview";

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

  // Band setup state
  const [showBandSetupModal, setShowBandSetupModal] = useState(false);
  const [durationVisible, setDurationVisible] = useState(false);

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

      // Initialize band roles from gig data
      const bandRolesFromGig =
        gig.bandCategory?.map((role: any) => ({
          role: role.role,
          maxSlots: role.maxSlots || 1,
          maxApplicants: role.maxApplicants || 20,
          currentApplicants: role.currentApplicants || 0,
          filledSlots: role.filledSlots || 0,
          requiredSkills: role.requiredSkills || [],
          description: role.description || "",
          price: role.price || undefined,
          currency: role.currency || "KES",
          negotiable: role.negotiable ?? true,
          isLocked: role.isLocked || false,
        })) || [];

      setBandRoles(bandRolesFromGig);

      if (gig.date) {
        setSelectedDate(new Date(gig.date));
      }

      setIsLoading(false);
    }
  }, [gig, initialCustomization, initialLogo]);

  // Check for changes
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
        minimalUser,
      );
    },
    [imageUrl, user],
  );

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

    if (!formValues?.title?.trim()) {
      errors.title = "Title is required";
    }
    if (!formValues?.description?.trim()) {
      errors.description = "Description is required";
    }
    if (!formValues?.location?.trim()) {
      errors.location = "Location is required";
    }
    if (!formValues?.bussinesscat) {
      errors.bussinesscat = "Business category is required";
    }

    // Category-specific validations
    if (formValues?.bussinesscat === "mc") {
      if (!formValues.mcType) errors.mcType = "MC type is required";
      if (!formValues.mcLanguages)
        errors.mcLanguages = "Languages are required";
    } else if (formValues?.bussinesscat === "dj") {
      if (!formValues.djGenre) errors.djGenre = "DJ genre is required";
      if (!formValues.djEquipment) errors.djEquipment = "Equipment is required";
    } else if (formValues?.bussinesscat === "vocalist") {
      if (!formValues.vocalistGenre || formValues.vocalistGenre.length === 0) {
        errors.vocalistGenre = "At least one genre is required";
      }
    }

    // Band roles validation for "other" category
    if (
      formValues?.bussinesscat === "other" &&
      (!bandRoles || bandRoles.length === 0)
    ) {
      errors.bandRoles = "At least one band role is required";
    }

    // Timeline validations
    if (formValues?.gigtimeline === "once" && !formValues.date) {
      errors.date = "Event date is required for one-time events";
    } else if (formValues?.gigtimeline !== "once" && !formValues.day) {
      errors.day = "Day of week is required for recurring events";
    }

    // Secret validation
    if (!formValues?.secret?.trim() || formValues.secret.length < 4) {
      errors.secret = "Secret passphrase is required (minimum 4 characters)";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formValues, bandRoles]);

  const { updateGig } = useGigUpdate();

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
      // Format band roles properly before sending
      const formattedBandRoles =
        bussinesscat === "other" && bandRoles.length > 0
          ? bandRoles.map((role) => ({
              role: role.role,
              maxSlots: role.maxSlots || 1,
              maxApplicants: role.maxApplicants || 20,
              currentApplicants: role.currentApplicants || 0,
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
          : undefined;

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
        secret: formValues.secret,
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
          maxSlots: role.maxSlots || 1,
          maxApplicants: role.maxApplicants || 20,
          currentApplicants: role.currentApplicants || 0,
          filledSlots: role.filledSlots || 0,
          requiredSkills: role.requiredSkills || [],
          description: role.description || "",
          price: role.price || undefined,
          currency: role.currency || "KES",
          negotiable: role.negotiable ?? true,
          isLocked: role.isLocked || false,
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

  // Add the Instrument Input component in the Details tab
  const renderInstrumentInput = () => {
    if (bussinesscat !== "personal") return null;

    return (
      <div>
        <Label className={cn("text-lg font-semibold mb-4", colors.text)}>
          Instrument Selection
        </Label>

        <div className="relative">
          <GuitarIcon
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
                setIsInstrumentDropdownOpen(!isInstrumentDropdownOpen)
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
                <div className={cn("p-2", colors.backgroundMuted)}>
                  {individualInstruments.map((instrument) => (
                    <button
                      key={instrument}
                      type="button"
                      onClick={() => {
                        handleSelectChange("category", instrument);
                        setIsInstrumentDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full px-4 py-3 text-left rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors",
                        formValues?.category === instrument
                          ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                          : colors.text,
                      )}
                    >
                      {instrument.charAt(0).toUpperCase() + instrument.slice(1)}
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
    );
  };

  return (
    <div className={`min-h-screen ${colors.background}`}>
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
      // Update the BandSetupModal call
      <AnimatePresence>
        {showBandSetupModal && (
          <BandSetupModal
            isOpen={showBandSetupModal}
            onClose={() => setShowBandSetupModal(false)}
            onSubmit={handleBandSetupSubmit}
            initialRoles={bandRoles} // Pass directly as BandRoleInput[]
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
                    <Label htmlFor="title" className={colors.text}>
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
                    <Label htmlFor="description" className={colors.text}>
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
                    <Label htmlFor="location" className={colors.text}>
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
                  {renderInstrumentInput()}
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
                        <SelectItem value="full">🎵 Full Band</SelectItem>
                        <SelectItem value="personal">👤 Individual</SelectItem>
                        <SelectItem value="other">🎭 Create Band</SelectItem>
                        <SelectItem value="mc">🎤 MC</SelectItem>
                        <SelectItem value="dj">🎧 DJ</SelectItem>
                        <SelectItem value="vocalist">🎤 Vocalist</SelectItem>
                      </SelectContent>
                    </Select>
                    <ErrorMessage error={fieldErrors.bussinesscat} />
                  </div>

                  {/* Band Setup Preview */}
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

                  {/* Price Info */}
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${colors.text}`}>
                      Price Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className={colors.text}>Currency</Label>
                        <Select
                          value={formValues?.currency || "KES"}
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
                          value={formValues?.price || ""}
                          onChange={handleInputChange}
                          name="price"
                          placeholder="Amount"
                          icon={DollarSign}
                        />
                      </div>
                      <div>
                        <Label className={colors.text}>Price Range</Label>
                        <Select
                          value={formValues?.pricerange || ""}
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
                        <GuitarIcon
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
                              setIsInstrumentDropdownOpen(
                                !isInstrumentDropdownOpen,
                              )
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
                      onClick={() => setDurationVisible(!durationVisible)}
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
                        setHasChanges(true);
                      }}
                    />
                  </div>

                  {/* Max Slots (only show for non-band categories) */}
                  {bussinesscat !== "other" && (
                    <div>
                      <Label
                        className={cn(
                          "text-lg font-semibold mb-4",
                          colors.text,
                        )}
                      >
                        Capacity
                      </Label>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setFormValues((prev: any) => ({
                                ...prev,
                                maxSlots: Math.max(1, (prev.maxSlots || 1) - 1),
                              }))
                            }
                            className="h-10 w-10 rounded-xl text-lg"
                            disabled={(formValues?.maxSlots || 1) <= 1}
                          >
                            -
                          </Button>

                          <div className="relative">
                            <MemoizedInput
                              type="number"
                              value={formValues?.maxSlots?.toString() || "1"}
                              onChange={handleInputChange}
                              name="maxSlots"
                              placeholder="Slots"
                              min="1"
                              max={bussinesscat === "full" ? "20" : "10"}
                              className="w-24 text-center"
                            />
                          </div>

                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setFormValues((prev: any) => ({
                                ...prev,
                                maxSlots: (prev.maxSlots || 1) + 1,
                              }))
                            }
                            className="h-10 w-10 rounded-xl text-lg"
                            disabled={
                              (bussinesscat === "full" &&
                                (formValues?.maxSlots || 1) >= 20) ||
                              (bussinesscat !== "full" &&
                                (formValues?.maxSlots || 1) >= 10)
                            }
                          >
                            +
                          </Button>
                        </div>

                        <div>
                          <p className={cn("font-medium", colors.text)}>
                            {formValues?.maxSlots || 1} position
                            {(formValues?.maxSlots || 1) !== 1 ? "s" : ""}
                          </p>
                          <p className={cn("text-sm", colors.textMuted)}>
                            {bussinesscat === "full"
                              ? "Number of band members needed"
                              : bussinesscat === "personal"
                                ? "Number of individual musicians needed"
                                : "Available positions"}
                          </p>
                        </div>
                      </div>

                      {/* Quick selection buttons for full band */}
                      {bussinesscat === "full" && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {[3, 4, 5, 6, 7, 8].map((num) => (
                            <Button
                              key={num}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setFormValues((prev: any) => ({
                                  ...prev,
                                  maxSlots: num,
                                }))
                              }
                              className={cn(
                                "px-3",
                                (formValues?.maxSlots || 1) === num &&
                                  "bg-gradient-to-r from-blue-500 to-purple-500 text-white",
                              )}
                            >
                              {num}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
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
