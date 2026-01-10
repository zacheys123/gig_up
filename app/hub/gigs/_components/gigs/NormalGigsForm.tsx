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
import { Id } from "@/convex/_generated/dataModel";

interface DraftsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDraft: (draftId: string) => void;
  onDeleteDraft: (draftId: string) => void;
  currentDraftId: string | null;
  drafts: GigDraft[]; // Add this
  refreshDrafts: () => void; // Add this
}
// Update LocalGigInputs type to include duration fields
// Add this component definition after your imports
const DraftsListModal = React.memo(
  ({
    isOpen,
    onClose,
    onLoadDraft,
    onDeleteDraft,
    currentDraftId,
    drafts, // Receive drafts as prop
    refreshDrafts, // Receive refresh function
  }: DraftsListModalProps) => {
    // Remove the local state and useEffect that loads drafts
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState<string>("all");

    // Update filteredDrafts to use prop instead of state
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
    }, [drafts, searchQuery, filterCategory]); // Use drafts prop
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

    // Format time ago
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

      // Return date if older than a week
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    };

    // Format time (e.g., "2:30 PM")
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
          {/* Header */}
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

          {/* Filters and Search */}
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

          {/* Drafts List */}
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
                      {/* Header */}
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
                            {/* Sparkle particles */}
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

                            {/* Button content */}
                            <div className="relative flex items-center justify-center gap-2">
                              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                              <span>Load Draft</span>
                            </div>

                            {/* Hover shine effect */}
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

                      {/* Content */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {draft.title}
                        </h3>

                        {draft.data.formValues.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {draft.data.formValues.description}
                          </p>
                        )}

                        {/* Band Role Summary */}
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

                        {/* Location and Date */}
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

                        {/* Progress Bar */}
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

                      {/* Footer with TIME */}
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

          {/* Footer */}
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
// Remove the standalone ValidationSummary component above and add it inside NormalGigsForm:

// Memoized Input Component - FIXED VERSION
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
    required = false, // Add default value
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
    required?: boolean; // Make it optional with default
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
  const [drafts, setDrafts] = useState<GigDraft[]>([]);

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

    // Talent-specific fields
    mcType: "",
    mcLanguages: "",
    djGenre: "",
    djEquipment: "",
    vocalistGenre: [],
    acceptInterestEndTime: "",
    acceptInterestStartTime: "",
    interestWindowDays: 7,
    enableInterestWindow: false,
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
  const [newRole, setNewRole] = useState({
    role: "",
    maxSlots: 1,
    requiredSkills: [] as string[],
    description: "",
  });
  const [skillInput, setSkillInput] = useState("");
  const [showCustomRoleForm, setShowCustomRoleForm] = useState(false);

  // Field errors state - only for display
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [bandRoles, setBandRoles] = useState<BandRoleInput[]>([
    { role: "Lead Vocalist", maxSlots: 1, requiredSkills: ["Rock", "Pop"] },
    {
      role: "Guitarist",
      maxSlots: 1,
      requiredSkills: ["Electric", "Acoustic"],
    },
    { role: "Drummer", maxSlots: 1, requiredSkills: ["Jazz", "Rock"] },
    { role: "Backup Vocalist", maxSlots: 2, requiredSkills: [] },
  ]);
  const [formValidationErrors, setFormValidationErrors] = useState<string[]>(
    []
  );
  const [isFormValid, setIsFormValid] = useState(false);

  // Basic required fields for all categories
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
      // Band creation: price is NOT required, but band roles are
      if (!bandRoles || bandRoles.length === 0) {
        errors.bandRoles = "At least one band role is required";
      }
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
  // CHECKING FORM VALIDITY
  const checkFormValidity = useCallback(() => {
    return validateRequiredFields();
  }, [validateRequiredFields]);
  // Add this helper function to determine if a field is required
  const isFieldRequired = useCallback(
    (fieldName: string) => {
      // Base required fields
      const baseRequiredFields = [
        "title",
        "description",
        "location",
        "phoneNo",
        "gigtimeline",
        "bussinesscat",
      ];

      // Category-specific requirements - IMPORTANT: "other" doesn't need price
      const categoryRequirements: Record<string, string[]> = {
        mc: ["mcType", "mcLanguages"],
        dj: ["djGenre", "djEquipment"],
        vocalist: ["vocalistGenre"],
        personal: ["category", "price", "maxSlots"],
        full: ["price", "maxSlots"],
        other: ["bandRoles"], // No price required for band creation
      };

      // Timeline requirements
      const timelineRequirements =
        formValues.gigtimeline === "once"
          ? ["date"]
          : formValues.gigtimeline !== "once" && formValues.gigtimeline !== ""
            ? ["day"]
            : [];

      // Combine all requirements
      const allRequiredFields = [
        ...baseRequiredFields,
        ...(bussinesscat ? categoryRequirements[bussinesscat] || [] : []),
        ...timelineRequirements,
      ];

      return allRequiredFields.includes(fieldName);
    },
    [bussinesscat, formValues.gigtimeline]
  );
  const ValidationSummary = useCallback(() => {
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
              • {field === "bandRoles" ? "Band roles are required" : error}
            </li>
          ))}
        </ul>
      </motion.div>
    );
  }, [fieldErrors]);

  const [draftId, setDraftId] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

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

  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (formValues.title || formValues.description) {
        saveAsDraft(); // Save silently without notification
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

        // Type assertion for draft data
        const draftData = draft.data.formValues as Partial<LocalGigInputs>;

        // Merge with defaults to ensure all fields exist
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
          ...draftData,
        };

        setFormValues(mergedData);

        // Handle band roles if they exist
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

  // Common instrument suggestions for quick selection
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
      const { name, value, type } = e.target;

      // Handle checkbox separately
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

  // Add custom role handler
  const handleAddCustomRole = useCallback(() => {
    if (!newRole.role.trim()) {
      toast.error("Please enter a role name");
      return;
    }

    const newCustomRole: BandRoleInput = {
      role: newRole.role.trim(),
      maxSlots: newRole.maxSlots,
      requiredSkills: newRole.requiredSkills,
      description: newRole.description.trim() || undefined,
    };

    setBandRoles([...bandRoles, newCustomRole]);
    setNewRole({
      role: "",
      maxSlots: 1,
      requiredSkills: [],
      description: "",
    });
    setSkillInput("");
    setShowCustomRoleForm(false);

    toast.success(`Added "${newRole.role}" role`);
  }, [newRole, bandRoles]);

  // Remove role handler
  const handleRemoveRole = useCallback(
    (index: number) => {
      const updatedRoles = [...bandRoles];
      updatedRoles.splice(index, 1);
      setBandRoles(updatedRoles);
      toast.success("Role removed");
    },
    [bandRoles]
  );

  // Add skill handler
  const handleAddSkill = useCallback(() => {
    if (skillInput.trim()) {
      setNewRole({
        ...newRole,
        requiredSkills: [...newRole.requiredSkills, skillInput.trim()],
      });
      setSkillInput("");
    }
  }, [newRole, skillInput]);

  // Remove skill handler
  const handleRemoveSkill = useCallback(
    (index: number) => {
      const updatedSkills = [...newRole.requiredSkills];
      updatedSkills.splice(index, 1);
      setNewRole({
        ...newRole,
        requiredSkills: updatedSkills,
      });
    },
    [newRole]
  );

  // Quick add instrument handler
  const handleQuickAddInstrument = useCallback(
    (instrument: string) => {
      setNewRole({
        ...newRole,
        role: instrument,
        maxSlots: 1,
        requiredSkills: [],
        description: "",
      });
    },
    [newRole]
  );

  // In your NormalGigsForm component, add:
  const [showBandSetupModal, setShowBandSetupModal] = useState(false);

  // Update handleBussinessChange:
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
      // Show band setup modal
      setShowBandSetupModal(true);
    } else if (!["mc", "dj", "vocalist"].includes(value || "")) {
      setActiveTalentType(null);
    } else {
      const newTalentType = value as Exclude<TalentType, null>;
      setActiveTalentType(newTalentType);
      setShowTalentModal(true);
    }
  }, []);

  // Handle band setup submission
  const handleBandSetupSubmit = useCallback((roles: BandRoleInput[]) => {
    setBandRoles(roles);
    toast.success(
      `Band setup complete! ${roles.length} role${roles.length !== 1 ? "s" : ""} selected.`
    );
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
  // Add these functions in your NormalGigsForm component:

  const handleLoadDraft = useCallback((draftId: string) => {
    const draft = getGigDraftById(draftId);
    if (draft) {
      setDraftId(draft.id);

      // Merge draft data with defaults
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
        ...draftData,
      };

      // Set all form values
      setFormValues(mergedData);

      // Set business category
      if (draft.data.formValues.bussinesscat) {
        setBussinessCategory(draft.data.formValues.bussinesscat);
      }

      // Set band roles if they exist
      if (draft.data.bandRoles) {
        setBandRoles(draft.data.bandRoles);
      }

      // Set customization if it exists
      if (draft.data.customization) {
        setGigCustom(draft.data.customization);
      }

      // Set image URL if it exists
      if (draft.data.imageUrl) {
        setUrl(draft.data.imageUrl);
      }

      // Set scheduling procedure if it exists
      if (draft.data.schedulingProcedure) {
        setSchedulingProcedure(draft.data.schedulingProcedure);
      }

      toast.success("Draft loaded successfully!", {
        description: `"${draft.title}" has been loaded.`,
        duration: 3000,
      });

      // Close the drafts modal
      setShowDraftsModal(false);
    }
  }, []);

  const handleDeleteDraft = useCallback(
    (draftIdToDelete: string) => {
      if (
        window.confirm(
          "Are you sure you want to delete this draft? This action cannot be undone."
        )
      ) {
        const success = deleteGigDraft(draftIdToDelete);

        if (success) {
          // If we're deleting the current draft, clear the draft ID
          if (draftIdToDelete === draftId) {
            setDraftId(null);
          }

          // Refresh the drafts list
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
  // Load drafts when component mounts
  useEffect(() => {
    refreshDrafts();
  }, [refreshDrafts]);
  // Handle scheduling data
  const getSchedulingData = useCallback((type: string, date?: Date) => {
    setSchedulingProcedure({
      type,
      date: date ?? new Date(),
    });
  }, []);

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
      // Use the comprehensive validation function
      const isValid = validateRequiredFields();

      if (!isValid) {
        setIsVisible(true);
        setError(true);
        setEditMessage("Please fill in all required fields");
        return;
      }

      // Check if user is logged in
      if (!user?._id) {
        toast.error("You must be logged in to create a gig");
        return;
      }

      try {
        setIsLoading(true);

        // Prepare submission data
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

        // Ensure bussinesscat is not null
        if (!submissionData.bussinesscat) {
          throw new Error("Business category is required");
        }

        await createGig(submissionData);

        setEditMessage("Gig created successfully!");
        setError(false);
        setIsVisible(true);
        setRefetchData(true);

        // Clear band roles after submission
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
      validateRequiredFields, // Use the new validation function
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

  // Add this component in NormalGigsForm after TalentPreview
  const BandSetupPreview = useCallback(() => {
    if (bussinesscat !== "other" || bandRoles.length === 0) return null;

    const totalPositions = bandRoles.reduce(
      (sum, role) => sum + role.maxSlots,
      0
    );

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
          {bandRoles.map((role, index) => (
            <div key={index} className="p-3 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium">{role.role}</span>
                <Badge variant="outline" className="text-xs">
                  {role.maxSlots} slot{role.maxSlots > 1 ? "s" : ""}
                </Badge>
              </div>

              {role?.requiredSkills && role.requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {role.requiredSkills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {role.requiredSkills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{role.requiredSkills.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              {role.description && (
                <p className="text-xs text-gray-600 line-clamp-2">
                  {role.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    );
  }, [bandRoles, bussinesscat, colors]);

  // Custom Role Form Component
  const CustomRoleForm = useCallback(
    () => (
      <div className="mb-6 p-4 border rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Custom Role
        </h3>

        <div className="space-y-3">
          <Input
            placeholder="e.g., Percussionist, Keyboardist, DJ, etc."
            value={newRole.role}
            onChange={(e) => setNewRole({ ...newRole, role: e.target.value })}
            className="border-2"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Slots Needed</label>
              <div className="flex items-center gap-2 mt-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setNewRole({
                      ...newRole,
                      maxSlots: Math.max(1, newRole.maxSlots - 1),
                    })
                  }
                >
                  -
                </Button>
                <span className="font-semibold px-2">{newRole.maxSlots}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setNewRole({ ...newRole, maxSlots: newRole.maxSlots + 1 })
                  }
                >
                  +
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Add Skills</label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="e.g., Jazz, Classical"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && skillInput.trim()) {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className="border-2"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddSkill}
                  disabled={!skillInput.trim()}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          <Textarea
            placeholder="Role description (optional)"
            value={newRole.description}
            onChange={(e) =>
              setNewRole({ ...newRole, description: e.target.value })
            }
            className="border-2"
            rows={2}
          />

          {/* Skills preview */}
          {newRole.requiredSkills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {newRole.requiredSkills.map((skill, idx) => (
                <Badge key={idx} variant="secondary" className="gap-1">
                  {skill}
                  <button
                    onClick={() => handleRemoveSkill(idx)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <Button
            type="button"
            onClick={handleAddCustomRole}
            disabled={!newRole.role.trim()}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Role
          </Button>
        </div>
      </div>
    ),
    [
      newRole,
      skillInput,
      handleAddSkill,
      handleAddCustomRole,
      handleRemoveSkill,
    ]
  );

  // Quick Add Instrument Suggestions Component
  const QuickAddInstruments = useCallback(
    () => (
      <div className="mb-4">
        <h4 className="font-medium mb-2">Quick Add Common Instruments:</h4>
        <div className="flex flex-wrap gap-2">
          {instrumentSuggestions.map((instrument) => (
            <Button
              key={instrument}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickAddInstrument(instrument)}
              className="text-xs"
            >
              {instrument}
            </Button>
          ))}
        </div>
      </div>
    ),
    [instrumentSuggestions, handleQuickAddInstrument]
  );
  // Slots Configuration Component
  // Slots Configuration Component
  const SlotsConfiguration = useCallback(() => {
    if (!bussinesscat) return null;

    // ⭐ FIX: Explicitly check for 'other' first
    if (bussinesscat === "other") {
      return null; // Don't show slots config for band creation
    }

    // ⭐ FIX: Now TypeScript knows bussinesscat can't be "other" here
    // So we can safely use it in the switch statement
    const getDefaultSlots = () => {
      switch (bussinesscat) {
        case "full":
          return 5; // Full band default
        case "personal":
          return 1; // Individual default
        case "mc":
        case "dj":
        case "vocalist":
          return 1; // Talent default
        default:
          return 1; // Fallback (should never happen)
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
            {/* Slots Input */}
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

                {/* Quick selection for full band */}
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

            {/* Visual representation */}
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

          {/* Helper text */}
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
  // Add this component in your NormalGigsForm component, after the duration section:

  const InterestWindowSection = useCallback(() => {
    const [showInterestWindow, setShowInterestWindow] = useState(false);
    const [interestWindowType, setInterestWindowType] = useState<
      "dates" | "days"
    >("dates");

    const handleInterestWindowChange = (field: string, value: any) => {
      setFormValues((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    // If user doesn't want to use interest window
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

    // If user wants to set interest window
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
          {/* Header */}
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

          {/* Window Type Selection */}
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

          {/* Specific Dates Input */}
          {interestWindowType === "dates" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className={cn(
                      "block text-sm font-medium mb-2",
                      colors.text
                    )}
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
                    className={cn(
                      "block text-sm font-medium mb-2",
                      colors.text
                    )}
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
                      min={formValues.acceptInterestStartTime || undefined}
                    />
                  </div>
                  <p className={cn("text-xs mt-1", colors.textMuted)}>
                    When interest period ends
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Days Duration Input */}
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

          {/* Summary */}
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

          {/* Help text */}
          <div className="mt-4 pt-4 border-t">
            <p className={cn("text-xs", colors.textMuted)}>
              <strong>Tip:</strong> Setting an interest window helps manage
              application flow and prevents last-minute applications.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }, [formValues, colors]);
  const shouldShowField = useCallback(
    (fieldType: string) => {
      switch (fieldType) {
        case "priceInfo":
          // Show price info for ALL categories EXCEPT "other"
          return bussinesscat !== "other";
        case "slotsConfig":
          // Show slots config for ALL categories EXCEPT "other"
          return bussinesscat !== "other";
        case "individualInstrument":
          // Show instrument selection ONLY for "personal"
          return bussinesscat === "personal";
        case "negotiableSwitch":
          // Show negotiable switch for ALL categories EXCEPT "other"
          return bussinesscat !== "other";
        case "bandSetup":
          // Show band setup ONLY for "other"
          return bussinesscat === "other";
        default:
          return true;
      }
    },
    [bussinesscat]
  ); // Conditional sections render
  const renderPriceInformation = useCallback(() => {
    if (!shouldShowField("priceInfo")) return null;

    return (
      <div>
        <label className={cn("block text-sm font-medium mb-4", colors.text)}>
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
              className={cn("block text-xs font-medium mb-2", colors.textMuted)}
            >
              Currency
            </label>
            <Select
              value={formValues.currency}
              onValueChange={(value) => handleSelectChange("currency", value)}
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
              className={cn("block text-xs font-medium mb-2", colors.textMuted)}
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
              className={cn("block text-xs font-medium mb-2", colors.textMuted)}
            >
              Price Range
            </label>
            <Select
              value={formValues.pricerange}
              onValueChange={(value) => handleSelectChange("pricerange", value)}
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
  const { isDarkMode } = useThemeColors();
  return (
    <>
      <div className="relative max-w-4xl mx-auto pb-24">
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
        {/* Auto-save indicator - ADD THIS */}
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
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <h2
                className={cn(
                  "text-2xl font-bold",
                  !isDarkMode ? "text-white" : "text-gray-900"
                )}
              >
                Create Your Gig
              </h2>
              <p
                className={cn(
                  "text-sm",
                  !isDarkMode ? "text-neutral-400" : "text-gray-900"
                )}
              >
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
          {/* Business Type Section - ALWAYS SHOW */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <label
                  className={cn("block text-lg font-semibold", colors.text)}
                >
                  Who do you need for your gig?
                </label>
                <Tag className={cn("w-5 h-5", colors.primary)} />
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
                    "py-3 rounded-xl border-2 transition-all duration-200",
                    colors.border,
                    colors.background,
                    colors.text,
                    "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20",
                    fieldErrors.bussinesscat &&
                      "border-red-500 ring-2 ring-red-500/20"
                  )}
                >
                  <SelectValue placeholder="Select business category" />
                </SelectTrigger>
                <SelectContent
                  className={cn(
                    "rounded-xl border-2 shadow-lg backdrop-blur-sm",
                    colors.backgroundMuted,
                    colors.border,
                    "max-h-[300px]"
                  )}
                >
                  {businessCategories.map((category) => {
                    const Icon = category.icon;
                    const gradientClass = isDarkMode
                      ? {
                          orange:
                            "bg-gradient-to-r from-orange-600 to-amber-600",
                          blue: "bg-gradient-to-r from-blue-600 to-cyan-600",
                          purple:
                            "bg-gradient-to-r from-purple-600 to-pink-600",
                          red: "bg-gradient-to-r from-red-600 to-orange-600",
                          pink: "bg-gradient-to-r from-pink-600 to-rose-600",
                          green:
                            "bg-gradient-to-r from-green-600 to-emerald-600",
                        }[category.color]
                      : {
                          orange:
                            "bg-gradient-to-r from-orange-500 to-amber-500",
                          blue: "bg-gradient-to-r from-blue-500 to-cyan-500",
                          purple:
                            "bg-gradient-to-r from-purple-500 to-pink-500",
                          red: "bg-gradient-to-r from-red-500 to-orange-500",
                          pink: "bg-gradient-to-r from-pink-500 to-rose-500",
                          green:
                            "bg-gradient-to-r from-green-500 to-emerald-500",
                        }[category.color];

                    return (
                      <SelectItem
                        key={category.value}
                        value={category.value}
                        className={cn(
                          "py-3 rounded-lg my-1 mx-1 transition-all duration-200",
                          bussinesscat === category.value
                            ? `${gradientClass} text-white shadow-lg`
                            : cn(colors.hoverBg, "hover:scale-[1.02]")
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "p-2 rounded-lg transition-all duration-200",
                              bussinesscat === category.value
                                ? "bg-white/20 backdrop-blur-sm"
                                : cn(
                                    isDarkMode
                                      ? "bg-gray-700/30 border-gray-600"
                                      : "bg-orange-500/10 border-orange-500/20",
                                    "border"
                                  )
                            )}
                          >
                            <Icon
                              className={cn(
                                "w-5 h-5 transition-colors duration-200",
                                bussinesscat === category.value
                                  ? "text-white"
                                  : colors.primary
                              )}
                            />
                          </div>
                          <span className={cn("font-medium", colors.text)}>
                            {category.label}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              <ErrorMessage error={fieldErrors.bussinesscat} />
            </div>

            <TalentPreview />
            <BandSetupPreview />

            {/* ⭐ CONDITIONAL: Show slots config ONLY for non-band gigs */}
            {shouldShowField("slotsConfig") && <SlotsConfiguration />}
            {/* Interest Window Section - OPTIONAL */}
            <InterestWindowSection />
          </div>

          {/* Customize Button - ALWAYS SHOW */}
          <div className="flex justify-between items-center">
            <Button
              onClick={() => setShowCustomization(true)}
              type="button"
              variant="outline"
              className={cn(
                "flex items-center gap-3 border-2 group px-6 py-6 rounded-xl transition-all duration-300",
                colors.border,
                colors.background,
                "hover:border-orange-500 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              <Palette
                className={cn(
                  "w-5 h-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12",
                  colors.primary
                )}
              />
              <div className="text-left">
                <span className={cn("block font-semibold", colors.text)}>
                  Customize Gig Card
                </span>
                <span className={cn("text-xs block", colors.textMuted)}>
                  Add your logo, colors, and branding
                </span>
              </div>
            </Button>
          </div>

          {/* Title Section - ALWAYS SHOW */}
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
                    <Shield className={cn("w-4 h-4", colors.primary)} />
                    <span>Secret Passphrase (Optional)</span>
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
                    className={cn(
                      "pl-12 pr-12 transition-all duration-200",
                      colors.border,
                      colors.background,
                      colors.text,
                      "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setSecretPass(!secretpass)}
                    className={cn(
                      "absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors duration-200",
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
                    <Tag className={cn("w-4 h-4", colors.primary)} />
                    <span>Gig Title *</span>
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
                  required={isFieldRequired("title")}
                  className={cn(
                    "transition-all duration-200",
                    colors.border,
                    colors.background,
                    colors.text,
                    "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  )}
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* Description Section - ALWAYS SHOW */}
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
                  <FileText className={cn("w-4 h-4", colors.primary)} />
                  <span>Gig Description *</span>
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
                placeholder="We're looking for a professional jazz band for our wedding reception..."
                rows={6}
                error={fieldErrors.description}
                className={cn(
                  "transition-all duration-200 resize-none",
                  colors.border,
                  colors.background,
                  colors.text,
                  "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                )}
              />
              <div className="flex justify-between items-center mt-2">
                <div />
                <span className={cn("text-xs", colors.textMuted)}>
                  {formValues.description.length}/500 characters
                </span>
              </div>
            </div>
          </CollapsibleSection>

          {/* Business Information Section - ALWAYS SHOW */}
          <CollapsibleSection
            title="Business Information"
            icon={Briefcase}
            isOpen={showCategories.business}
            onToggle={() =>
              setshowCategories((prev) => ({
                ...prev,
                business: !prev.business,
              }))
            }
            badge="Required"
          >
            <div className="space-y-6">
              {/* Contact Information - ALWAYS SHOW */}
              <div>
                <label
                  className={cn("block text-sm font-medium mb-3", colors.text)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Phone className={cn("w-4 h-4", colors.primary)} />
                    <span>Contact Information</span>
                  </div>
                  <span className={cn("text-xs", colors.textMuted)}>
                    Your phone number for inquiries
                  </span>
                </label>
                <MemoizedInput
                  type="tel"
                  value={formValues.phoneNo ? formValues.phoneNo : ""}
                  onChange={handleInputChange}
                  onBlur={() => handleInputBlur("phoneNo")}
                  name="phoneNo"
                  placeholder="+254 7XX XXX XXX"
                  icon={Phone}
                  className={cn(
                    "transition-all duration-200",
                    colors.border,
                    colors.background,
                    colors.text,
                    "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  )}
                />
              </div>

              {/* ⭐ CONDITIONAL: Show price information ONLY for non-band gigs */}
              {shouldShowField("priceInfo") && renderPriceInformation()}
            </div>
          </CollapsibleSection>

          {/* ⭐ CONDITIONAL: Show negotiable switch ONLY for non-band gigs */}
          {shouldShowField("negotiableSwitch") && (
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
          )}

          {/* Gig Timeline Section - ALWAYS SHOW */}
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
                    <MapPin className={cn("w-4 h-4", colors.primary)} />
                    <span>Location *</span>
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
                  required={isFieldRequired("location")}
                  className={cn(
                    "transition-all duration-200",
                    colors.border,
                    colors.background,
                    colors.text,
                    "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  )}
                />
              </div>

              {/* Timeline Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gig Type */}
                <div>
                  <label
                    className={cn(
                      "block text-sm font-medium mb-3",
                      colors.text
                    )}
                  >
                    Gig Type
                  </label>
                  <Select
                    value={formValues.gigtimeline}
                    onValueChange={(value) =>
                      handleSelectChange("gigtimeline", value)
                    }
                  >
                    <SelectTrigger
                      className={cn(
                        "rounded-xl py-3 transition-all duration-200",
                        colors.border,
                        colors.background,
                        colors.text,
                        "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                      )}
                    >
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent
                      className={cn(
                        colors.backgroundMuted,
                        colors.border,
                        "backdrop-blur-sm"
                      )}
                    >
                      <SelectItem value="once">🎯 One-time event</SelectItem>
                      <SelectItem value="weekly">
                        🔄 Weekly recurring
                      </SelectItem>
                      <SelectItem value="monthly">
                        📅 Monthly recurring
                      </SelectItem>
                      <SelectItem value="other">✨ Custom schedule</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Day of Week */}
                {formValues.gigtimeline !== "once" && (
                  <div>
                    <label
                      className={cn(
                        "block text-sm font-medium mb-3",
                        colors.text
                      )}
                    >
                      Day of Week
                    </label>
                    <Select
                      value={formValues.day}
                      onValueChange={(value) =>
                        handleSelectChange("day", value)
                      }
                    >
                      <SelectTrigger
                        className={cn(
                          "rounded-xl py-3 transition-all duration-200",
                          colors.border,
                          colors.background,
                          colors.text,
                          "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                        )}
                      >
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent
                        className={cn(
                          colors.backgroundMuted,
                          colors.border,
                          "backdrop-blur-sm"
                        )}
                      >
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

              {/* Custom Timeline */}
              {formValues.gigtimeline === "other" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="overflow-hidden"
                >
                  <label
                    className={cn(
                      "block text-sm font-medium mb-3",
                      colors.text
                    )}
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
                    className={cn(
                      "transition-all duration-200",
                      colors.border,
                      colors.background,
                      colors.text,
                      "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    )}
                  />
                </motion.div>
              )}

              {/* Event Date for one-time events */}
              {formValues.gigtimeline === "once" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="overflow-hidden"
                >
                  <label
                    className={cn(
                      "block text-sm font-medium mb-3",
                      colors.text
                    )}
                  >
                    Event Date
                  </label>
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
                </motion.div>
              )}
            </div>
          </CollapsibleSection>

          {/* Duration Section - ALWAYS SHOW */}
          <div>
            {showduration ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className={cn(
                  "rounded-xl border overflow-hidden transition-all duration-300",
                  colors.border,
                  colors.backgroundMuted,
                  "shadow-lg"
                )}
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-lg transition-all duration-300",
                          isDarkMode
                            ? "bg-orange-500/20 border-orange-500/30"
                            : "bg-orange-500/10 border-orange-500/20",
                          "border"
                        )}
                      >
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
                        "p-2 rounded-lg transition-colors duration-200",
                        colors.hoverBg,
                        "hover:scale-110"
                      )}
                    >
                      <X className={cn("w-5 h-5", colors.textMuted)} />
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
                          className={cn(
                            "transition-all duration-200",
                            colors.border,
                            colors.background,
                            colors.text,
                            "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                          )}
                        />
                        <Select
                          value={formValues.durationfrom}
                          onValueChange={(value) =>
                            handleSelectChange("durationfrom", value)
                          }
                        >
                          <SelectTrigger
                            className={cn(
                              "w-24 rounded-xl py-3 transition-all duration-200",
                              colors.border,
                              colors.background,
                              colors.text,
                              "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                            )}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent
                            className={cn(
                              colors.backgroundMuted,
                              colors.border,
                              "backdrop-blur-sm"
                            )}
                          >
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
                          className={cn(
                            "transition-all duration-200",
                            colors.border,
                            colors.background,
                            colors.text,
                            "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                          )}
                        />
                        <Select
                          value={formValues.durationto}
                          onValueChange={(value) =>
                            handleSelectChange("durationto", value)
                          }
                        >
                          <SelectTrigger
                            className={cn(
                              "w-24 rounded-xl py-3 transition-all duration-200",
                              colors.border,
                              colors.background,
                              colors.text,
                              "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                            )}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent
                            className={cn(
                              colors.backgroundMuted,
                              colors.border,
                              "backdrop-blur-sm"
                            )}
                          >
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
                  "flex justify-between items-center p-6 rounded-xl border cursor-pointer transition-all duration-300 group",
                  colors.border,
                  colors.backgroundMuted,
                  "hover:shadow-xl hover:border-orange-500 hover:scale-[1.02]",
                  "active:scale-[0.98]"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-3 rounded-lg transition-all duration-300 group-hover:scale-110",
                      isDarkMode
                        ? "bg-orange-500/20 border-orange-500/30"
                        : "bg-orange-500/10 border-orange-500/20",
                      "border"
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
                    "p-2 rounded-lg transition-all duration-300",
                    colors.hoverBg,
                    "group-hover:bg-orange-500/10 group-hover:scale-110"
                  )}
                >
                  <ChevronDown className={cn("w-5 h-5", colors.textMuted)} />
                </div>
              </div>
            )}
          </div>

          {/* ⭐ CONDITIONAL: Show individual instrument ONLY for "personal" */}
          {shouldShowField("individualInstrument") && (
            <div>
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

          {/* ⭐ CONDITIONAL: Show band setup ONLY for "other" */}
          {shouldShowField("bandSetup") && (
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

                {/* Quick Add Instruments */}
                <QuickAddInstruments />

                {/* Custom Role Form Toggle */}
                <div className="mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCustomRoleForm(!showCustomRoleForm)}
                    className={cn(
                      "w-full mb-3 transition-all duration-200",
                      colors.border,
                      colors.background,
                      colors.text,
                      "hover:border-orange-500 hover:shadow-lg"
                    )}
                  >
                    {showCustomRoleForm ? (
                      <>
                        <X className={cn("w-4 h-4 mr-2", colors.text)} />
                        Close Custom Role Form
                      </>
                    ) : (
                      <>
                        <Plus className={cn("w-4 h-4 mr-2", colors.text)} />
                        Add Custom Role
                      </>
                    )}
                  </Button>

                  {/* Custom Role Form */}
                  <AnimatePresence>
                    {showCustomRoleForm && <CustomRoleForm />}
                  </AnimatePresence>
                </div>

                {/* Current Roles */}
                {bandRoles.length > 0 && (
                  <div className="mb-6">
                    <h4 className={cn("font-medium mb-3", colors.text)}>
                      Current Band Roles:
                    </h4>
                    <div className="space-y-3">
                      {bandRoles.map((role, index) => (
                        <div
                          key={index}
                          className={cn(
                            "p-3 border rounded-lg transition-all duration-200",
                            colors.border,
                            colors.background,
                            "hover:border-orange-500 hover:shadow-md"
                          )}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className={cn("font-medium", colors.text)}>
                                {role.role}
                              </span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "ml-2 text-xs",
                                  colors.border,
                                  colors.textMuted
                                )}
                              >
                                {role.maxSlots} slot
                                {role.maxSlots > 1 ? "s" : ""}
                              </Badge>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveRole(index)}
                              className={cn(
                                "text-red-500 hover:text-red-700 hover:bg-red-500/10",
                                "transition-colors duration-200"
                              )}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          {role?.requiredSkills &&
                            role.requiredSkills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {role.requiredSkills.map((skill) => (
                                  <Badge
                                    key={skill}
                                    variant="secondary"
                                    className={cn(
                                      "text-xs",
                                      colors.backgroundMuted,
                                      colors.textMuted
                                    )}
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            )}

                          {role.description && (
                            <p
                              className={cn(
                                "text-xs line-clamp-2",
                                colors.textMuted
                              )}
                            >
                              {role.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Band Instruments Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {bandInstruments.map((instrument) => (
                    <div
                      key={instrument.value}
                      className={cn(
                        "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-200",
                        colors.border,
                        colors.background,
                        "hover:scale-105 hover:shadow-lg hover:border-orange-500",
                        userinfo.prefferences.includes(instrument.value) &&
                          cn(
                            "border-orange-500",
                            isDarkMode ? "bg-orange-500/10" : "bg-orange-500/5",
                            "shadow-orange-500/20"
                          )
                      )}
                      onClick={() => handleInstrumentChange(instrument.value)}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center transition-all duration-200",
                          userinfo.prefferences.includes(instrument.value)
                            ? "bg-gradient-to-r from-orange-500 to-red-500 border-transparent shadow-inner"
                            : colors.border
                        )}
                      >
                        {userinfo.prefferences.includes(instrument.value) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <label
                        className={cn(
                          "text-sm cursor-pointer flex-1 transition-colors duration-200",
                          colors.text,
                          userinfo.prefferences.includes(instrument.value) &&
                            cn("font-semibold", colors.primary)
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

          <ValidationSummary />

          {/* Submit Button - ALWAYS SHOW */}
          <div className="pt-8 border-t">
            <div className="flex flex-col sm:flex-row gap-4 mb-10 -mt-4">
              <Button
                type="button"
                onClick={() => setisSchedulerOpen(true)}
                className={cn(
                  "flex-1 py-6 rounded-xl font-semibold text-lg transition-all duration-300",
                  "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600",
                  "text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95",
                  "focus:ring-2 focus:ring-orange-500/30"
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
                onClick={() => setShowDraftsModal(true)}
                className={cn(
                  "py-6 rounded-xl font-medium transition-all duration-300 border-2",
                  colors.border,
                  colors.background,
                  colors.text,
                  "hover:border-blue-500 hover:shadow-lg hover:scale-105 active:scale-95",
                  "flex items-center justify-center gap-2"
                )}
              >
                <FileText className={cn("w-5 h-5", colors.primary)} />
                View Drafts
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={saveAsDraft}
                disabled={isSavingDraft}
                className={cn(
                  "py-6 rounded-xl font-medium transition-all duration-300",
                  colors.border,
                  colors.background,
                  colors.text,
                  "hover:border-orange-500 hover:shadow-lg hover:scale-105 active:scale-95",
                  isSavingDraft && "opacity-50 cursor-not-allowed"
                )}
              >
                <Save className={cn("w-5 h-5", colors.primary)} />
              </Button>
            </div>

            <p className={cn("text-center text-sm mt-4", colors.textMuted)}>
              By creating this gig, you agree to our terms and conditions
            </p>
          </div>
        </form>
      </div>{" "}
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
          // Add these new props:
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
            initialRoles={bandRoles}
          />
        )}
      </AnimatePresence>
      {/* Add this modal at the end of your return statement */}
      <AnimatePresence initial={false}>
        {showDraftsModal && (
          <DraftsListModal
            isOpen={showDraftsModal}
            onClose={() => setShowDraftsModal(false)}
            onLoadDraft={handleLoadDraft}
            onDeleteDraft={handleDeleteDraft}
            currentDraftId={draftId}
            drafts={drafts} // Pass drafts
            refreshDrafts={refreshDrafts} // Pass refresh function
          />
        )}
      </AnimatePresence>{" "}
    </>
  );
}
