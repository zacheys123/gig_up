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
  ArrowRight,
  ChevronRight,
  Loader2,
  Clock as ClockIcon,
  Users as UsersIcon,
  Key,
  Shield as ShieldIcon,
  Palette as PaletteIcon,
  Settings,
  UserPlus,
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
  BandRoleInput,
  BandSetupRole,
  BusinessCategory,
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
import {
  deleteGigDraft,
  getGigDraftById,
  getGigDrafts,
  GigDraft,
  LocalGigInputs,
  saveGigDraft,
} from "@/drafts";
import { MemoizedSwitch } from "./MemoizedSwitch";
import BandSetupModal from "./BandSetUpModal";
import { GiTrumpet, GiViolin } from "react-icons/gi";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

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

// DraftsListModal Component
interface DraftsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDraft: (draftId: string) => void;
  onDeleteDraft: (draftId: string) => void;
  currentDraftId: string | null;
  drafts: GigDraft[];
  refreshDrafts: () => void;
}

const DraftsListModal = React.memo(
  ({
    isOpen,
    onClose,
    onLoadDraft,
    onDeleteDraft,
    currentDraftId,
    drafts,
    refreshDrafts,
  }: DraftsListModalProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState<string>("all");

    const filteredDrafts = useMemo(() => {
      return drafts
        .filter((draft) => {
          if (filterCategory === "all") return true;
          return draft.category === filterCategory;
        })
        .filter((draft) => {
          if (!searchQuery.trim()) return true;
          const query = searchQuery.toLowerCase();
          return (
            draft.title.toLowerCase().includes(query) ||
            draft.data.formValues.description?.toLowerCase().includes(query) ||
            draft.data.formValues.location?.toLowerCase().includes(query) ||
            (draft.isBandGig &&
              draft.data.bandRoles?.some((role) =>
                role.role.toLowerCase().includes(query)
              ))
          );
        });
    }, [drafts, searchQuery, filterCategory]);

    const getCategoryIcon = (category: string) => {
      switch (category) {
        case "full":
          return <Users className="w-4 h-4" />;
        case "personal":
          return <Music className="w-4 h-4" />;
        case "other":
          return <Zap className="w-4 h-4" />;
        case "mc":
          return <Mic className="w-4 h-4" />;
        case "dj":
          return <Volume2 className="w-4 h-4" />;
        case "vocalist":
          return <Music className="w-4 h-4" />;
        default:
          return <FileText className="w-4 h-4" />;
      }
    };

    const getCategoryLabel = (category: string) => {
      switch (category) {
        case "full":
          return "Full Band";
        case "personal":
          return "Individual";
        case "other":
          return "Create Band";
        case "mc":
          return "MC";
        case "dj":
          return "DJ";
        case "vocalist":
          return "Vocalist";
        default:
          return "Uncategorized";
      }
    };

    const getTimeAgo = (date: Date) => {
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    };

    const getFormattedTime = (date: Date) => {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    };

    if (!isOpen) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <FileText className="w-7 h-7 text-blue-600" />
                  Your Drafts
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {drafts.length} saved draft{drafts.length !== 1 ? "s" : ""}
                  {currentDraftId && " • Current draft is auto-saving"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search drafts by title, description, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl border-2 focus:border-blue-500"
                />
              </div>
              <Select
                value={filterCategory}
                onValueChange={(value) => setFilterCategory(value)}
              >
                <SelectTrigger className="w-[180px] rounded-xl">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent className={"bg-neutral-600"}>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="full">🎵 Full Band</SelectItem>
                  <SelectItem value="personal">👤 Individual</SelectItem>
                  <SelectItem value="other">🎭 Create Band</SelectItem>
                  <SelectItem value="mc">🎤 MC</SelectItem>
                  <SelectItem value="dj">🎧 DJ</SelectItem>
                  <SelectItem value="vocalist">🎤 Vocalist</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {filteredDrafts.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No drafts found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery || filterCategory !== "all"
                    ? "Try adjusting your search or filters"
                    : "Start creating a gig to save your first draft!"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDrafts.map((draft) => {
                  const draftDate = new Date(draft.updatedAt);
                  const timeAgo = getTimeAgo(draftDate);
                  const formattedTime = getFormattedTime(draftDate);

                  return (
                    <motion.div
                      key={draft.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border p-4 hover:shadow-lg transition-all duration-200 ${
                        draft.id === currentDraftId
                          ? "border-2 border-blue-500 ring-2 ring-blue-500/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-2 rounded-lg ${
                              draft.category === "full"
                                ? "bg-gradient-to-r from-orange-500/10 to-amber-500/10"
                                : draft.category === "personal"
                                  ? "bg-gradient-to-r from-blue-500/10 to-cyan-500/10"
                                  : draft.category === "other"
                                    ? "bg-gradient-to-r from-purple-500/10 to-pink-500/10"
                                    : "bg-gradient-to-r from-gray-500/10 to-gray-600/10"
                            }`}
                          >
                            {getCategoryIcon(draft.category)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              {getCategoryLabel(draft.category)}
                            </span>
                            {draft.isBandGig && (
                              <span className="text-xs text-purple-600 dark:text-purple-400">
                                Band Setup
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onLoadDraft(draft.id)}
                            className="group relative overflow-hidden px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white font-semibold text-sm tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                            title="Load Draft"
                          >
                            <div className="absolute inset-0">
                              {[...Array(3)].map((_, i) => (
                                <div
                                  key={i}
                                  className="absolute w-1 h-1 bg-white/40 rounded-full animate-ping"
                                  style={{
                                    top: `${20 + i * 30}%`,
                                    left: `${10 + i * 40}%`,
                                    animationDelay: `${i * 0.2}s`,
                                  }}
                                />
                              ))}
                            </div>
                            <div className="relative flex items-center justify-center gap-2">
                              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                              <span>Load Draft</span>
                            </div>
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000">
                              <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                            </div>
                          </button>
                          <button
                            onClick={() => onDeleteDraft(draft.id)}
                            className="p-1.5 rounded-md bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
                            title="Delete Draft"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {draft.title}
                        </h3>

                        {draft.data.formValues.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {draft.data.formValues.description}
                          </p>
                        )}

                        {draft.isBandGig && draft.bandRoleCount && (
                          <div className="flex items-center gap-2 text-xs text-purple-700 dark:text-purple-300">
                            <Users className="w-3 h-3" />
                            <span>
                              {draft.bandRoleCount} role
                              {draft.bandRoleCount !== 1 ? "s" : ""}
                            </span>
                            {draft.totalSlots && (
                              <>
                                <span>•</span>
                                <span>
                                  {draft.totalSlots} slot
                                  {draft.totalSlots !== 1 ? "s" : ""}
                                </span>
                              </>
                            )}
                          </div>
                        )}

                        <div className="space-y-1 text-xs text-gray-500 dark:text-gray-500">
                          {draft.data.formValues.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">
                                {draft.data.formValues.location}
                              </span>
                            </div>
                          )}

                          {draft.data.formValues.gigtimeline && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {draft.data.formValues.gigtimeline === "once"
                                  ? "One-time"
                                  : draft.data.formValues.gigtimeline}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600 dark:text-gray-400">
                              Progress
                            </span>
                            <span className="font-semibold">
                              {draft.progress}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${draft.progress}%` }}
                              transition={{ duration: 0.5 }}
                              className={`h-full rounded-full ${
                                draft.progress >= 75
                                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                  : draft.progress >= 50
                                    ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                                    : "bg-gradient-to-r from-orange-500 to-amber-500"
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-500">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span className="font-medium">{timeAgo}</span>
                            </div>
                            <div className="text-gray-400 dark:text-gray-600 text-[10px]">
                              {formattedTime}
                            </div>
                          </div>
                          {draft.id === currentDraftId && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium">
                              Current
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">
                  {filteredDrafts.length} draft
                  {filteredDrafts.length !== 1 ? "s" : ""}
                </span>
                <span className="mx-2">•</span>
                <span>
                  {drafts.filter((d) => d.isBandGig).length} band gig
                  {drafts.filter((d) => d.isBandGig).length !== 1 ? "s" : ""}
                </span>
              </div>
              <Button
                onClick={onClose}
                variant="outline"
                className="rounded-xl border-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Close
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }
);
DraftsListModal.displayName = "DraftsListModal";

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
            {formValues.vocalistGenre.map((genre: string) => (
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
});
TalentPreview.displayName = "TalentPreview";

// Band Setup Preview Component
const BandSetupPreview = React.memo(
  ({ bandRoles, bussinesscat, colors, setShowBandSetupModal }: any) => {
    if (bussinesscat !== "other" || bandRoles.length === 0) return null;

    const totalPositions = bandRoles.reduce(
      (sum: number, role: BandRoleInput) => sum + role.maxSlots,
      0
    );
    const totalMaxApplicants = bandRoles.reduce(
      (sum: number, role: BandRoleInput) => sum + (role.maxApplicants || 20),
      0
    );

    const totalCurrentApplicants = bandRoles.reduce(
      (sum: number, role: BandRoleInput) => sum + (role.currentApplicants || 0),
      0
    );

    const totalPrice = bandRoles.reduce((sum: number, role: BandRoleInput) => {
      const price = role.price || 0;
      return sum + price * role.maxSlots;
    }, 0);

    const hasPricedRoles = bandRoles.some(
      (role: BandRoleInput) => role.price && role.price > 0
    );
    const hasNegotiableRoles = bandRoles.some(
      (role: BandRoleInput) => role.negotiable
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
          "relative overflow-hidden"
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
                {totalPositions} position{totalPositions !== 1 ? "s" : ""},{" "}
                {totalMaxApplicants} max applications
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
            const maxApplicants = role.maxApplicants || 20;
            const currentApplicants = role.currentApplicants || 0;
            const applicantProgress = Math.min(
              (currentApplicants / maxApplicants) * 100,
              100
            );
            const roleCurrency = role.currency || "KES";

            return (
              <div
                key={index}
                className={cn(
                  "p-4 border rounded-lg hover:shadow-md transition-shadow",
                  colors.border,
                  colors.background,
                  "group"
                )}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "p-1.5 rounded-md",
                        getRoleColor(role.role)
                      )}
                    >
                      {getRoleIcon(role.role)}
                    </div>
                    <span className="font-medium text-sm">{role.role}</span>
                  </div>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-xs">
                      {role.maxSlots} slot{role.maxSlots > 1 ? "s" : ""}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      {maxApplicants} max
                    </Badge>
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
                        applicantProgress < 30
                          ? "bg-gradient-to-r from-green-500 to-emerald-500"
                          : applicantProgress < 70
                            ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                            : applicantProgress < 90
                              ? "bg-gradient-to-r from-orange-500 to-amber-500"
                              : "bg-gradient-to-r from-red-500 to-pink-500"
                      )}
                      style={{ width: `${applicantProgress}%` }}
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
              <div className="text-xs text-gray-500">Max Applications</div>
              <div className="text-lg font-bold text-blue-600">
                {totalMaxApplicants}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="text-xs text-gray-500">Total Positions</div>
              <div className="text-lg font-bold text-green-600">
                {totalPositions}
              </div>
            </div>
          </div>

          {hasPricedRoles && (
            <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className={cn("text-sm font-medium", colors.text)}>
                  Total Budget Estimate
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
                      (r: BandRoleInput) => r.price && r.price > 0
                    ).length
                  }{" "}
                  priced roles
                </div>
              </div>
            </div>
          )}

          {totalCurrentApplicants > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-2 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20"
            >
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium">
                  {totalCurrentApplicants} application
                  {totalCurrentApplicants !== 1 ? "s" : ""} received
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {Math.round(
                  (totalCurrentApplicants / totalMaxApplicants) * 100
                )}
                % of maximum capacity
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }
);
BandSetupPreview.displayName = "BandSetupPreview";
// Interest Window Section Component
const InterestWindowSection = React.memo(({ formValues, colors }: any) => {
  const [showInterestWindow, setShowInterestWindow] = useState(false);
  const [interestWindowType, setInterestWindowType] = useState<
    "dates" | "days"
  >("dates");

  const handleInterestWindowChange = useCallback(
    (field: string, value: any) => {
      // This would be handled by parent component
    },
    []
  );

  if (!showInterestWindow) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "rounded-xl p-6 border cursor-pointer transition-all group",
          colors.border,
          colors.backgroundMuted,
          "hover:shadow-lg hover:border-purple-500/50"
        )}
        onClick={() => setShowInterestWindow(true)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-3 rounded-lg transition-transform group-hover:scale-110",
                "bg-gradient-to-r from-purple-500/10 to-pink-500/10"
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
        colors.backgroundMuted
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
              colors.textMuted
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <label className={cn("block text-sm font-medium mb-3", colors.text)}>
            Interest Window Type
          </label>
          <div className="flex gap-3">
            <Button
              type="button"
              variant={interestWindowType === "dates" ? "default" : "outline"}
              onClick={() => setInterestWindowType("dates")}
              className={cn(
                "flex-1",
                interestWindowType === "dates" &&
                  "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              )}
            >
              Specific Dates
            </Button>
            <Button
              type="button"
              variant={interestWindowType === "days" ? "default" : "outline"}
              onClick={() => setInterestWindowType("days")}
              className={cn(
                "flex-1",
                interestWindowType === "days" &&
                  "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
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
                  className={cn("block text-sm font-medium mb-2", colors.text)}
                >
                  Interest Opens
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="datetime-local"
                    value={formValues.acceptInterestStartTime || ""}
                    onChange={(e) =>
                      handleInterestWindowChange(
                        "acceptInterestStartTime",
                        e.target.value
                      )
                    }
                    className="pl-10"
                  />
                </div>
                <p className={cn("text-xs mt-1", colors.textMuted)}>
                  When musicians can start showing interest
                </p>
              </div>

              <div>
                <label
                  className={cn("block text-sm font-medium mb-2", colors.text)}
                >
                  Interest Closes
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="datetime-local"
                    value={formValues.acceptInterestEndTime || ""}
                    onChange={(e) =>
                      handleInterestWindowChange(
                        "acceptInterestEndTime",
                        e.target.value
                      )
                    }
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
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const current = formValues.interestWindowDays || 7;
                    handleInterestWindowChange(
                      "interestWindowDays",
                      Math.max(1, current - 1)
                    );
                  }}
                  className="h-10 w-10"
                >
                  -
                </Button>
                <div className="relative">
                  <Input
                    type="number"
                    value={formValues.interestWindowDays || 7}
                    onChange={(e) =>
                      handleInterestWindowChange(
                        "interestWindowDays",
                        parseInt(e.target.value) || 7
                      )
                    }
                    min="1"
                    max="90"
                    className="w-20 text-center"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                    days
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const current = formValues.interestWindowDays || 7;
                    handleInterestWindowChange(
                      "interestWindowDays",
                      current + 1
                    );
                  }}
                  className="h-10 w-10"
                >
                  +
                </Button>
              </div>

              <div className="flex-1">
                <p className={cn("text-sm", colors.textMuted)}>
                  Musicians can show interest for{" "}
                  <span className="font-semibold">
                    {formValues.interestWindowDays || 7} days
                  </span>{" "}
                  after posting
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {[1, 3, 7, 14, 30].map((days) => (
                <Button
                  key={days}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleInterestWindowChange("interestWindowDays", days)
                  }
                  className={cn(
                    formValues.interestWindowDays === days &&
                      "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                  )}
                >
                  {days} {days === 1 ? "day" : "days"}
                </Button>
              ))}
            </div>
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
    </motion.div>
  );
});
InterestWindowSection.displayName = "InterestWindowSection";

// Validation Summary Component
// Validation Summary Component
const ValidationSummary = React.memo(({ fieldErrors }: any) => {
  if (Object.keys(fieldErrors).length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mb-6 p-4 border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-xl"
    >
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <h3 className="font-semibold text-red-700 dark:text-red-300">
          Missing Required Information
        </h3>
      </div>
      <ul className="space-y-1">
        {Object.entries(fieldErrors).map(([field, error]) => (
          <li key={field} className="text-sm text-red-600 dark:text-red-400">
            •{" "}
            {field === "bandRoles"
              ? "Band roles are required"
              : (error as string)}
          </li>
        ))}
      </ul>
    </motion.div>
  );
});
ValidationSummary.displayName = "ValidationSummary";
// Main NormalGigsForm Component
export default function NormalGigsForm() {
  const router = useRouter();
  const { colors, isDarkMode } = useThemeColors();
  const { user } = useCurrentUser();
  const isOnline = useNetworkStatus();
  const [drafts, setDrafts] = useState<GigDraft[]>([]);
  const [activeTab, setActiveTab] = useState<string>("basic");

  // Function to refresh drafts
  const refreshDrafts = useCallback(() => {
    const loadedDrafts = getGigDrafts();
    setDrafts(loadedDrafts);
  }, []);

  // Convex mutations
  const createGig = useMutation(api.controllers.gigs.createGig);

  // Refs for managing state without re-renders
  const fieldErrorsRef = useRef<Record<string, string>>({});
  const [showDraftsModal, setShowDraftsModal] = useState(false);
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
    durationfrom: "am",
    durationto: "pm",
    bussinesscat: null as BusinessCategory,
    otherTimeline: "",
    gigtimeline: "",
    day: "",
    date: "",
    pricerange: "",
    currency: "KES",
    negotiable: true,
    mcType: "",
    mcLanguages: "",
    djGenre: "",
    djEquipment: "",
    vocalistGenre: [],
    acceptInterestEndTime: "",
    acceptInterestStartTime: "",
    interestWindowDays: 7,
    enableInterestWindow: false,
    maxSlots: 1,
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

  // Form display state
  const [bussinesscat, setBussinessCategory] = useState<BusinessCategory>(null);
  const [showduration, setshowduration] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [userinfo, setUserInfo] = useState<UserInfo>({
    prefferences: [],
  });
  const [schedulingProcedure, setSchedulingProcedure] = useState({
    type: "",
    date: new Date(),
  });
  const [newRole, setNewRole] = useState({
    role: "",
    maxSlots: 1,
    requiredSkills: [] as string[],
    description: "",
  });
  const [skillInput, setSkillInput] = useState("");
  const [showCustomRoleForm, setShowCustomRoleForm] = useState(false);

  // Field errors state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [bandRoles, setBandRoles] = useState<BandRoleInput[]>([
    {
      role: "Lead Vocalist",
      maxSlots: 1,
      requiredSkills: ["Rock", "Pop"],
    },
    {
      role: "Guitarist",
      maxSlots: 1,
      requiredSkills: ["Electric", "Acoustic"],
    },
    {
      role: "Drummer",
      maxSlots: 1,
      requiredSkills: ["Jazz", "Rock"],
    },
    {
      role: "Backup Vocalist",
      maxSlots: 2,
      requiredSkills: [],
    },
  ]);
  const convertToBandSetupRole = (role: BandRoleInput): BandSetupRole => {
    return {
      role: role.role,
      maxSlots: role.maxSlots,
      maxApplicants: role.maxApplicants || 15, // Default to 20
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
  const [formValidationErrors, setFormValidationErrors] = useState<string[]>(
    []
  );
  const [isFormValid, setIsFormValid] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [showBandSetupModal, setShowBandSetupModal] = useState(false);

  // Business categories
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
      { value: "piano", label: "Piano", icon: MusicIcon },
      { value: "guitar", label: "Guitar", icon: MusicIcon },
      { value: "bass", label: "Bass Guitar", icon: MusicIcon },
      { value: "drums", label: "Drums", icon: Drum },
      { value: "sax", label: "Saxophone", icon: MusicIcon },
      { value: "violin", label: "Violin", icon: GiViolin },
      { value: "cello", label: "Cello", icon: MusicIcon },
      { value: "trumpet", label: "Trumpet", icon: GiTrumpet },
      { value: "percussion", label: "Percussion", icon: MusicIcon },
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

  const instrumentSuggestions = useMemo(
    () => [
      "Percussionist",
      "Keyboardist",
      "DJ",
      "Beatboxer",
      "Beatmaker",
      "Sound Engineer",
      "Conductor",
      "Composer",
      "Arranger",
      "Backing Vocalist",
      "Harmony Singer",
      "Rapper",
      "MC",
      "Violist",
      "Double Bassist",
      "Harpist",
      "Oboist",
      "Bassoonist",
      "French Horn",
      "Tuba Player",
    ],
    []
  );

  // Validate form
  const validateRequiredFields = useCallback(() => {
    const errors: Record<string, string> = {};
    const errorMessages: string[] = [];

    // Basic required fields for all categories
    if (!formValues.title?.trim()) {
      errors.title = "Title is required";
      errorMessages.push("Title is required");
    }
    if (!formValues.description?.trim()) {
      errors.description = "Description is required";
      errorMessages.push("Description is required");
    }
    if (!formValues.location?.trim()) {
      errors.location = "Location is required";
      errorMessages.push("Location is required");
    }
    if (!bussinesscat) {
      errors.bussinesscat = "Business category is required";
      errorMessages.push("Business category is required");
    }
    // Category-specific validations
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
    } else if (bussinesscat === "personal") {
      if (!formValues.category) errors.category = "Instrument is required";
      if (!formValues.price?.trim()) errors.price = "Price is required";
    } else if (bussinesscat === "full") {
      if (!formValues.price?.trim()) errors.price = "Price is required";
    } else if (bussinesscat === "other") {
      if (!bandRoles || bandRoles.length === 0) {
        errors.bandRoles = "At least one band role is required";
      }
    } // 🔐 ADD THIS: Secret is required
    if (!formValues.secret?.trim() || formValues.secret.length < 4) {
      errors.secret = "Secret passphrase is required (minimum 4 characters)";
      errorMessages.push("Secret passphrase is required");
    }

    // Timeline validations
    if (formValues.gigtimeline === "once" && !formValues.date) {
      errors.date = "Event date is required for one-time events";
    } else if (formValues.gigtimeline !== "once" && !formValues.day) {
      errors.day = "Day of week is required for recurring events";
    }

    fieldErrorsRef.current = errors;
    setFieldErrors(errors);
    setFormValidationErrors(errorMessages);

    const isValid = Object.keys(errors).length === 0;
    setIsFormValid(isValid);
    return isValid;
  }, [bussinesscat, formValues, bandRoles]);

  // Check form validity
  const checkFormValidity = useCallback(() => {
    return validateRequiredFields();
  }, [validateRequiredFields]);

  // Determine if field is required
  const isFieldRequired = useCallback(
    (fieldName: string) => {
      const baseRequiredFields = [
        "title",
        "description",
        "location",
        "phoneNo",
        "gigtimeline",
        "bussinesscat",
        "secret", // 🔐 ADD SECRET HERE
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
        formValues.gigtimeline === "once"
          ? ["date"]
          : formValues.gigtimeline !== "once" && formValues.gigtimeline !== ""
            ? ["day"]
            : [];

      const allRequiredFields = [
        ...baseRequiredFields,
        ...(bussinesscat ? categoryRequirements[bussinesscat] || [] : []),
        ...timelineRequirements,
      ];

      return allRequiredFields.includes(fieldName);
    },
    [bussinesscat, formValues.gigtimeline]
  );

  // Should show field condition
  const shouldShowField = useCallback(
    (fieldType: string) => {
      switch (fieldType) {
        case "priceInfo":
          return bussinesscat !== "other";
        case "slotsConfig":
          return bussinesscat !== "other";
        case "individualInstrument":
          return bussinesscat === "personal";
        case "negotiableSwitch":
          return bussinesscat !== "other";
        case "bandSetup":
          return bussinesscat === "other";
        default:
          return true;
      }
    },
    [bussinesscat]
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
        setFormValues((prev) => ({
          ...prev,
          [name]: checked,
        }));
      } else {
        setFormValues((prev) => ({
          ...prev,
          [name]: value,
        }));
      }

      // Clear error
      if (fieldErrorsRef.current[name]) {
        delete fieldErrorsRef.current[name];
        setFieldErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    []
  );
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, text: "Empty", color: "text-gray-400" };
    if (password.length < 4)
      return { score: 1, text: "Weak", color: "text-red-500" };
    if (password.length < 8)
      return { score: 2, text: "Fair", color: "text-amber-500" };
    if (password.length < 12)
      return { score: 3, text: "Good", color: "text-blue-500" };
    return { score: 4, text: "Strong", color: "text-green-500" };
  };
  const passwordStrength = getPasswordStrength(formValues.secret);
  // Handle input blur
  const handleInputBlur = useCallback(
    (fieldName: string) => {
      const value = formValues[fieldName as keyof LocalGigInputs];

      if (!value && fieldName === "title") {
        fieldErrorsRef.current[fieldName] = "Title is required";
        setFieldErrors((prev) => ({
          ...prev,
          [fieldName]: "Title is required",
        }));
      }

      // 🔐 ADD SECRET VALIDATION
      if (fieldName === "secret") {
        // Type-safe check: ensure value is a string before calling trim
        if (typeof value === "string") {
          if (!value.trim() || value.trim().length < 4) {
            fieldErrorsRef.current[fieldName] =
              "Secret passphrase is required (minimum 4 characters)";
            setFieldErrors((prev) => ({
              ...prev,
              [fieldName]:
                "Secret passphrase is required (minimum 4 characters)",
            }));
          }
        } else {
          // Handle non-string case (though secret should always be string)
          fieldErrorsRef.current[fieldName] =
            "Secret passphrase is required (minimum 4 characters)";
          setFieldErrors((prev) => ({
            ...prev,
            [fieldName]: "Secret passphrase is required (minimum 4 characters)",
          }));
        }
      }
    },
    [formValues]
  );
  // Handle select change
  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

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

    if (value === "other") {
      setShowBandSetupModal(true);
    } else if (!["mc", "dj", "vocalist"].includes(value || "")) {
      setActiveTalentType(null);
    } else {
      const newTalentType = value as Exclude<TalentType, null>;
      setActiveTalentType(newTalentType);
      setShowTalentModal(true);
    }
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

  // Handle talent submit
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

  const handleBandSetupSubmit = useCallback((roles: BandRoleInput[]) => {
    setBandRoles(roles);
    toast.success(
      `Band setup complete! ${roles.length} role${roles.length !== 1 ? "s" : ""} selected.`
    );
  }, []);

  // Handle scheduling data
  const getSchedulingData = useCallback((type: string, date?: Date) => {
    setSchedulingProcedure({
      type,
      date: date ?? new Date(),
    });
  }, []);

  // Save as draft
  const saveAsDraft = useCallback(async () => {
    try {
      setIsSavingDraft(true);

      const draftData = {
        formValues: {
          ...formValues,
          mcType: formValues.mcType,
          mcLanguages: formValues.mcLanguages,
          djGenre: formValues.djGenre,
          djEquipment: formValues.djEquipment,
          vocalistGenre: formValues.vocalistGenre,
        },
        bandRoles: bussinesscat === "other" ? bandRoles : [],
        customization: gigcustom,
        imageUrl,
        schedulingProcedure,
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
  }, [
    formValues,
    bandRoles,
    gigcustom,
    imageUrl,
    schedulingProcedure,
    draftId,
    bussinesscat,
  ]);

  // Handle load draft
  const handleLoadDraft = useCallback((draftId: string) => {
    const draft = getGigDraftById(draftId);
    if (draft) {
      setDraftId(draft.id);

      const draftData = draft.data.formValues as Partial<LocalGigInputs>;
      const mergedData: LocalGigInputs = {
        title: "",
        description: "",
        phoneNo: "",
        price: "",
        category: "",
        location: "",
        secret: "",
        end: "",
        start: "",
        durationfrom: "am",
        durationto: "pm",
        bussinesscat: null,
        otherTimeline: "",
        gigtimeline: "",
        day: "",
        date: "",
        pricerange: "",
        currency: "KES",
        negotiable: true,
        mcType: "",
        mcLanguages: "",
        djGenre: "",
        djEquipment: "",
        vocalistGenre: [],
        acceptInterestEndTime: "",
        acceptInterestStartTime: "",
        interestWindowDays: 7,
        enableInterestWindow: false,
        maxSlots: 1,
        ...draftData,
      };

      setFormValues(mergedData);

      if (draft.data.formValues.bussinesscat) {
        setBussinessCategory(draft.data.formValues.bussinesscat);
      }

      if (draft.data.bandRoles) {
        setBandRoles(draft.data.bandRoles);
      }

      if (draft.data.customization) {
        setGigCustom(draft.data.customization);
      }

      if (draft.data.imageUrl) {
        setUrl(draft.data.imageUrl);
      }

      if (draft.data.schedulingProcedure) {
        setSchedulingProcedure(draft.data.schedulingProcedure);
      }

      toast.success("Draft loaded successfully!", {
        description: `"${draft.title}" has been loaded.`,
        duration: 3000,
      });

      setShowDraftsModal(false);
    }
  }, []);

  // Handle delete draft
  const handleDeleteDraft = useCallback(
    (draftIdToDelete: string) => {
      if (
        window.confirm(
          "Are you sure you want to delete this draft? This action cannot be undone."
        )
      ) {
        const success = deleteGigDraft(draftIdToDelete);

        if (success) {
          if (draftIdToDelete === draftId) {
            setDraftId(null);
          }

          refreshDrafts();

          toast.success("Draft deleted successfully", {
            duration: 3000,
          });
        } else {
          toast.error("Failed to delete draft. Please try again.", {
            duration: 3000,
          });
        }
      }
    },
    [draftId, refreshDrafts]
  );

  // Handle form submit
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (bussinesscat === "other" && (!bandRoles || bandRoles.length === 0)) {
        setFieldErrors((prev) => ({
          ...prev,
          bandRoles: "At least one band role is required",
        }));
        setIsVisible(true);
        setError(true);
        setEditMessage("Please add at least one band role");
        return;
      }

      const isValid = validateRequiredFields();

      if (!isValid) {
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
          {
            type: schedulingProcedure.type || "create",
            date: schedulingProcedure.date || new Date(),
          },
          bandRoles,
          formValues.durationfrom,
          formValues.durationto
        );

        if (!submissionData.bussinesscat) {
          throw new Error("Business category is required");
        }

        await createGig(submissionData);

        setEditMessage("Gig created successfully!");
        setError(false);
        setIsVisible(true);
        setRefetchData(true);

        setBandRoles([]);

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
      validateRequiredFields,
      user,
      gigcustom,
      imageUrl,
      schedulingProcedure,
      createGig,
      router,
      setRefetchData,
      formValues,
      bandRoles,
      bussinesscat,
    ]
  );

  // Auto-save draft
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (formValues.title || formValues.description) {
        saveAsDraft();
      }
    }, 30000);

    return () => clearTimeout(autoSaveTimer);
  }, [formValues, saveAsDraft]);

  // Load drafts on mount
  useEffect(() => {
    refreshDrafts();
  }, [refreshDrafts]);

  // Load draft from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const draftIdParam = params.get("draft");

    if (draftIdParam) {
      const draft = getGigDraftById(draftIdParam);
      if (draft) {
        setDraftId(draft.id);

        const draftData = draft.data.formValues as Partial<LocalGigInputs>;
        const mergedData: LocalGigInputs = {
          title: "",
          description: "",
          phoneNo: "",
          price: "",
          category: "",
          location: "",
          secret: "",
          end: "",
          start: "",
          durationfrom: "am",
          durationto: "pm",
          bussinesscat: null,
          otherTimeline: "",
          gigtimeline: "",
          day: "",
          date: "",
          pricerange: "",
          currency: "KES",
          negotiable: true,
          mcType: "",
          mcLanguages: "",
          djGenre: "",
          djEquipment: "",
          vocalistGenre: [],
          acceptInterestEndTime: "",
          acceptInterestStartTime: "",
          interestWindowDays: 7,
          enableInterestWindow: false,
          maxSlots: 1,
          ...draftData,
        };

        setFormValues(mergedData);

        if (draft.data.bandRoles) {
          setBandRoles(draft.data.bandRoles);
        }

        toast.success("Draft loaded", {
          description: "Your draft has been loaded successfully.",
          duration: 3000,
        });
      }
    }
  }, []);

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
    const currentSlots = formValues.maxSlots || getDefaultSlots();

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "rounded-xl p-6 border",
          colors.border,
          colors.backgroundMuted,
          "relative overflow-hidden"
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
                      setFormValues((prev) => ({
                        ...prev,
                        maxSlots: Math.max(
                          1,
                          (prev.maxSlots || getDefaultSlots()) - 1
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
                        setFormValues((prev) => ({
                          ...prev,
                          maxSlots: Math.max(
                            1,
                            parseInt(e.target.value) || getDefaultSlots()
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
                      setFormValues((prev) => ({
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
                        onClick={() =>
                          setFormValues((prev) => ({
                            ...prev,
                            maxSlots: num,
                          }))
                        }
                        className={cn(
                          "px-3",
                          currentSlots === num &&
                            "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
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
                        "border border-blue-500/30"
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
  }, [bussinesscat, formValues.maxSlots, colors]);

  // Price Information Component
  const renderPriceInformation = useCallback(() => {
    if (!shouldShowField("priceInfo")) return null;

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
                value={formValues.currency}
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
                value={formValues.price}
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
                value={formValues.pricerange}
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

        {(formValues.price || formValues.pricerange !== "0") && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "rounded-xl p-4 border",
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
                  {formValues.pricerange !== "0" && formValues.pricerange && (
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
  ]);

  return (
    <>
      <div className="relative min-h-screen">
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

        {/* Auto-save indicator */}
        {draftId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed bottom-4 right-4 z-40"
          >
            <div className="px-3 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium flex items-center gap-2 shadow-lg">
              <Save className="w-3 h-3" />
              Auto-saving draft...
            </div>
          </motion.div>
        )}

        {/* Offline Notification */}
        {showOfflineNotification && !isOnline && (
          <OfflineNotification
            onClose={() => setShowOfflineNotification(false)}
          />
        )}

        {/* Header */}
        <div
          className={cn(
            "sticky top-0 z-40 border-b backdrop-blur-sm",
            colors.navBackground,
            colors.navBorder
          )}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <div>
                  <h1 className={cn("text-2xl font-bold", colors.text)}>
                    Create New Gig
                  </h1>
                  <p className={cn("text-sm", colors.textMuted)}>
                    Fill in the details to create an amazing gig opportunity
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={cn("animate-pulse", colors.primary)}
                >
                  Step 1 of 3
                </Badge>
                <Button
                  type="button"
                  variant="outline"
                  onClick={saveAsDraft}
                  disabled={isSavingDraft}
                  className="py-6 rounded-xl font-medium"
                >
                  {isSavingDraft ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Save Draft
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList
              className={cn(
                "grid grid-cols-4 mb-6",
                colors.backgroundSecondary
              )}
            >
              <TabsTrigger value="basic">
                <Type className="w-4 h-4 mr-2" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="details">
                <Settings className="w-4 h-4 mr-2" />
                Details
              </TabsTrigger>
              <TabsTrigger value="customize">
                <PaletteIcon className="w-4 h-4 mr-2" />
                Customize
              </TabsTrigger>
              <TabsTrigger value="security">
                <ShieldIcon className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card className={colors.cardBorder}>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Business Category */}
                    <div>
                      <Label
                        className={cn(
                          "text-lg font-semibold mb-4",
                          colors.text
                        )}
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

                    {/* Talent Preview */}
                    <TalentPreview formValues={formValues} colors={colors} />

                    {/* Band Setup Preview */}
                    <BandSetupPreview
                      bandRoles={bandRoles}
                      bussinesscat={bussinesscat}
                      colors={colors}
                      setShowBandSetupModal={setShowBandSetupModal}
                    />

                    {/* Title */}
                    <div>
                      <Label
                        htmlFor="title"
                        className={cn(
                          "text-lg font-semibold mb-4",
                          colors.text
                        )}
                      >
                        Gig Title
                      </Label>
                      <MemoizedInput
                        id="title"
                        value={formValues.title}
                        onChange={handleInputChange}
                        onBlur={() => handleInputBlur("title")}
                        name="title"
                        placeholder="e.g., 'Live Jazz Band Needed for Wedding Reception'"
                        error={fieldErrors.title}
                        required={isFieldRequired("title")}
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <Label
                        htmlFor="description"
                        className={cn(
                          "text-lg font-semibold mb-4",
                          colors.text
                        )}
                      >
                        Description
                      </Label>
                      <MemoizedTextarea
                        id="description"
                        value={formValues.description}
                        onChange={handleInputChange}
                        onBlur={() => handleInputBlur("description")}
                        name="description"
                        placeholder="We're looking for a professional jazz band for our wedding reception..."
                        rows={6}
                        error={fieldErrors.description}
                        required={isFieldRequired("description")}
                      />
                      <div className="flex justify-between items-center mt-2">
                        <div />
                        <span className={cn("text-xs", colors.textMuted)}>
                          {formValues.description.length}/500 characters
                        </span>
                      </div>
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
                    {/* Location */}
                    <div>
                      <Label
                        htmlFor="location"
                        className={cn(
                          "text-lg font-semibold mb-4",
                          colors.text
                        )}
                      >
                        Location
                      </Label>
                      <MemoizedInput
                        id="location"
                        value={formValues.location}
                        onChange={handleInputChange}
                        onBlur={() => handleInputBlur("location")}
                        name="location"
                        placeholder="e.g., 'Nairobi City Center' or 'Sarova Stanley Hotel'"
                        error={fieldErrors.location}
                        icon={MapPin}
                        required={isFieldRequired("location")}
                      />
                    </div>

                    {/* Timeline Section */}
                    <div>
                      <Label
                        className={cn(
                          "text-lg font-semibold mb-4",
                          colors.text
                        )}
                      >
                        Event Details
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Gig Type */}
                        <div>
                          <Label
                            className={cn(
                              "text-sm font-medium mb-2",
                              colors.text
                            )}
                          >
                            Gig Type
                          </Label>
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
                              <SelectItem value="once">
                                🎯 One-time event
                              </SelectItem>
                              <SelectItem value="weekly">
                                🔄 Weekly recurring
                              </SelectItem>
                              <SelectItem value="monthly">
                                📅 Monthly recurring
                              </SelectItem>
                              <SelectItem value="other">
                                ✨ Custom schedule
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Day of Week */}
                        {formValues.gigtimeline !== "once" && (
                          <div>
                            <Label
                              className={cn(
                                "text-sm font-medium mb-2",
                                colors.text
                              )}
                            >
                              Day of Week
                            </Label>
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
                                {days.map((day) => (
                                  <SelectItem key={day.id} value={day.val}>
                                    {day.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      {/* Date for one-time events */}
                      {formValues.gigtimeline === "once" && (
                        <div className="mt-4">
                          <Label
                            className={cn(
                              "text-sm font-medium mb-2",
                              colors.text
                            )}
                          >
                            Event Date
                          </Label>
                          <DatePicker
                            selected={selectedDate}
                            onChange={handleDate}
                            className={cn(
                              "w-full px-4 py-3 border rounded-xl transition-all duration-200",
                              colors.border,
                              colors.background,
                              colors.text,
                              "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                            )}
                            placeholderText="Select a date"
                            isClearable
                            minDate={new Date()}
                            dateFormat="MMMM d, yyyy"
                          />
                        </div>
                      )}

                      {/* Duration */}
                      <div className="mt-4">
                        <div
                          onClick={() => setshowduration(!showduration)}
                          className={cn(
                            "flex justify-between items-center p-4 rounded-xl border cursor-pointer",
                            colors.border,
                            colors.backgroundMuted
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <ClockIcon className="w-5 h-5" />
                            <span className={cn("font-medium", colors.text)}>
                              {showduration ? "Hide Duration" : "Set Duration"}
                            </span>
                          </div>
                          {showduration ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>

                        {showduration && (
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label
                                className={cn(
                                  "text-sm font-medium mb-2",
                                  colors.text
                                )}
                              >
                                Start Time
                              </Label>
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
                              <Label
                                className={cn(
                                  "text-sm font-medium mb-2",
                                  colors.text
                                )}
                              >
                                End Time
                              </Label>
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
                        )}
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div>
                      <Label
                        htmlFor="phoneNo"
                        className={cn(
                          "text-lg font-semibold mb-4",
                          colors.text
                        )}
                      >
                        Contact Information
                      </Label>
                      <MemoizedInput
                        id="phoneNo"
                        type="tel"
                        value={formValues.phoneNo || ""}
                        onChange={handleInputChange}
                        onBlur={() => handleInputBlur("phoneNo")}
                        name="phoneNo"
                        placeholder="+254 7XX XXX XXX"
                        icon={Phone}
                      />
                    </div>

                    {/* Price Information - Conditionally shown */}
                    {renderPriceInformation()}

                    {/* Slots Configuration */}
                    <SlotsConfiguration />

                    {/* Individual Instrument Selection */}
                    {shouldShowField("individualInstrument") && (
                      <div>
                        <Label
                          className={cn(
                            "text-lg font-semibold mb-4",
                            colors.text
                          )}
                        >
                          Instrument Selection
                        </Label>
                        <div className="relative">
                          <Guitar
                            className={cn(
                              "absolute left-3 top-1/2 transform -translate-y-1/2",
                              colors.textMuted
                            )}
                          />
                          <Select
                            value={formValues.category}
                            onValueChange={(value) =>
                              handleSelectChange("category", value)
                            }
                          >
                            <SelectTrigger
                              className={cn(
                                "pl-12 py-3 rounded-xl transition-all duration-200",
                                colors.border,
                                colors.background,
                                colors.text,
                                "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                              )}
                            >
                              <SelectValue placeholder="Select your instrument" />
                            </SelectTrigger>
                            <SelectContent
                              className={cn(
                                colors.backgroundMuted,
                                colors.border,
                                "backdrop-blur-sm"
                              )}
                            >
                              {individualInstruments.map((instrument) => (
                                <SelectItem key={instrument} value={instrument}>
                                  {instrument.charAt(0).toUpperCase() +
                                    instrument.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Customize Tab */}
            <TabsContent value="customize" className="space-y-6">
              <Card className={colors.cardBorder}>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3
                          className={cn("text-lg font-semibold", colors.text)}
                        >
                          Customize Gig Card
                        </h3>
                        <p className={cn("text-sm", colors.textMuted)}>
                          Add your branding and styling
                        </p>
                      </div>
                      <Button
                        onClick={() => setShowCustomization(true)}
                        variant="outline"
                        className="gap-2"
                      >
                        <Palette className="w-4 h-4" />
                        Customize
                      </Button>
                    </div>

                    {/* Current Preview */}
                    <div className={cn("rounded-lg p-4 border", colors.border)}>
                      <h4 className={cn("font-medium mb-3", colors.text)}>
                        Current Styling
                      </h4>
                      <div className="space-y-2">
                        {imageUrl && (
                          <div className="flex items-center gap-2">
                            <img
                              src={imageUrl}
                              alt="Logo"
                              className="w-8 h-8 rounded"
                            />
                            <span className={cn("text-sm", colors.text)}>
                              Logo uploaded
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded border"
                            style={{
                              backgroundColor:
                                gigcustom.backgroundColor || "transparent",
                            }}
                          />
                          <span className={cn("text-sm", colors.text)}>
                            Background: {gigcustom.backgroundColor || "Default"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded border"
                            style={{
                              backgroundColor:
                                gigcustom.fontColor || "transparent",
                            }}
                          />
                          <span className={cn("text-sm", colors.text)}>
                            Text Color: {gigcustom.fontColor || "Default"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card className={colors.cardBorder}>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Secret Passphrase */}
                    {/* Secret Passphrase - NOW REQUIRED */}
                    <div>
                      <Label
                        htmlFor="secret"
                        className={cn(
                          "text-lg font-semibold mb-4",
                          colors.text
                        )}
                      >
                        Secret Passphrase *
                      </Label>
                      <p className={cn("text-sm mb-4", colors.textMuted)}>
                        Required for gig security. This password protects access
                        to your gig details.
                      </p>
                      <div className="relative">
                        <MemoizedInput
                          id="secret"
                          type={secretpass ? "text" : "password"}
                          value={formValues.secret}
                          onChange={handleInputChange}
                          onBlur={() => handleInputBlur("secret")} // Add blur validation
                          name="secret"
                          placeholder="Create a secure passphrase (minimum 4 characters)"
                          required={true}
                          error={fieldErrors.secret} // Show error if empty
                        />
                        <button
                          type="button"
                          onClick={() => setSecretPass(!secretpass)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5"
                        >
                          {secretpass ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>{" "}
                        {/* Password Strength Indicator */}
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className={cn("text-xs", colors.textMuted)}>
                              Password strength
                            </span>
                            <span
                              className={`text-xs font-medium ${passwordStrength.color}`}
                            >
                              {passwordStrength.text}
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                passwordStrength.score === 1
                                  ? "w-1/4 bg-red-500"
                                  : passwordStrength.score === 2
                                    ? "w-1/2 bg-amber-500"
                                    : passwordStrength.score === 3
                                      ? "w-3/4 bg-blue-500"
                                      : passwordStrength.score === 4
                                        ? "w-full bg-green-500"
                                        : "w-0"
                              }`}
                            />
                          </div>
                          <p className={cn("text-xs mt-1", colors.textMuted)}>
                            Use at least 4 characters. Longer is better.
                          </p>
                        </div>
                      </div>
                      {!fieldErrors.secret && (
                        <p className={cn("text-xs mt-2", colors.textMuted)}>
                          🔒 Keep this safe - needed for editing and managing
                          your gig
                        </p>
                      )}
                    </div>

                    {/* Negotiable Switch */}
                    {shouldShowField("negotiableSwitch") && (
                      <MemoizedSwitch
                        checked={formValues.negotiable}
                        onChange={(checked) =>
                          setFormValues((prev) => ({
                            ...prev,
                            negotiable: checked,
                          }))
                        }
                        label="Price Negotiable"
                        description="Allow applicants to negotiate the price"
                        icon={DollarSign}
                        colors={colors}
                      />
                    )}

                    {/* Interest Window Section */}
                    <InterestWindowSection
                      formValues={formValues}
                      colors={colors}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Validation Summary */}
          <ValidationSummary fieldErrors={fieldErrors} />

          {/* Action Buttons - Fixed at bottom */}
          <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent pt-8 pb-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  type="button"
                  onClick={() => setisSchedulerOpen(true)}
                  className={cn(
                    "flex-1 py-6 rounded-xl font-semibold text-lg",
                    "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600",
                    "text-white shadow-xl"
                  )}
                >
                  <span className="flex items-center justify-center gap-3">
                    <Calendar className="w-5 h-5" />
                    Finalize & Schedule Gig
                  </span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowDraftsModal(true)}
                  className="gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Choose Drafts
                </Button>
              </div>

              <p className={cn("text-center text-sm mt-4", colors.textMuted)}>
                By creating this gig, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>

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
          isFormValid={isFormValid}
          validationErrors={formValidationErrors}
          formValidationCheck={checkFormValidity}
        />
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {showBandSetupModal && (
          <BandSetupModal
            isOpen={showBandSetupModal}
            onClose={() => setShowBandSetupModal(false)}
            onSubmit={handleBandSetupSubmit}
            initialRoles={bandRoles.map(convertToBandSetupRole)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {showDraftsModal && (
          <DraftsListModal
            isOpen={showDraftsModal}
            onClose={() => setShowDraftsModal(false)}
            onLoadDraft={handleLoadDraft}
            onDeleteDraft={handleDeleteDraft}
            currentDraftId={draftId}
            drafts={drafts}
            refreshDrafts={refreshDrafts}
          />
        )}
      </AnimatePresence>
    </>
  );
}
