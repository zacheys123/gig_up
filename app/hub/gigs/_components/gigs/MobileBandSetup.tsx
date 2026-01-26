// app/gigs/_components/MobileBandSetupModal.tsx
import React, { useState, useMemo, useCallback } from "react";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  X,
  Plus,
  Minus,
  Music,
  Mic,
  Volume2,
  Guitar,
  Drum,
  Piano,
  Users,
  Search,
  Sparkles,
  ArrowRight,
  Check,
  DollarSign,
  Settings,
  Target,
  ChevronLeft,
  ChevronRight,
  Star,
  TrendingUp,
  Zap,
  Layers,
  UserPlus,
  Info,
  AlertCircle,
  Filter,
  Grid,
  List,
  Eye,
  EyeOff,
  Clock,
  Calendar,
  Edit3,
  Trash2,
  Lock,
  Unlock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BandRoleInput, BandSetupRole } from "@/types/gig";
import { useThemeColors } from "@/hooks/useTheme";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MobileBandSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roles: BandRoleInput[]) => void;
  initialRoles?: BandRoleInput[];
  isEditMode?: boolean;
}

const commonRoles = [
  {
    value: "Lead Vocalist",
    icon: Mic,
    color: "red",
    category: "vocal",
    popularity: 95,
  },
  {
    value: "Guitarist",
    icon: Guitar,
    color: "blue",
    category: "strings",
    popularity: 90,
  },
  {
    value: "Bassist",
    icon: Music,
    color: "green",
    category: "strings",
    popularity: 85,
  },
  {
    value: "Drummer",
    icon: Drum,
    color: "amber",
    category: "percussion",
    popularity: 88,
  },
  {
    value: "Pianist/Keyboardist",
    icon: Piano,
    color: "purple",
    category: "keys",
    popularity: 80,
  },
  {
    value: "Saxophonist",
    icon: Music,
    color: "pink",
    category: "brass",
    popularity: 70,
  },
  {
    value: "Trumpeter",
    icon: Music,
    color: "cyan",
    category: "brass",
    popularity: 65,
  },
  {
    value: "Violinist",
    icon: Music,
    color: "indigo",
    category: "strings",
    popularity: 75,
  },
  {
    value: "Backup Vocalist",
    icon: Mic,
    color: "rose",
    category: "vocal",
    popularity: 82,
  },
  {
    value: "Percussionist",
    icon: Drum,
    color: "orange",
    category: "percussion",
    popularity: 72,
  },
  {
    value: "DJ",
    icon: Volume2,
    color: "violet",
    category: "electronic",
    popularity: 88,
  },
  {
    value: "MC/Host",
    icon: Mic,
    color: "teal",
    category: "vocal",
    popularity: 78,
  },
];

const roleCategories = [
  { value: "all", label: "All Roles", icon: Layers },
  { value: "vocal", label: "Vocal", icon: Mic },
  { value: "strings", label: "Strings", icon: Guitar },
  { value: "keys", label: "Keys", icon: Piano },
  { value: "percussion", label: "Percussion", icon: Drum },
  { value: "brass", label: "Brass", icon: Music },
  { value: "electronic", label: "Electronic", icon: Volume2 },
];

const commonSkills = [
  "Jazz",
  "Rock",
  "Pop",
  "Blues",
  "Classical",
  "R&B",
  "Hip Hop",
  "Electronic",
  "Gospel",
  "Reggae",
  "Latin",
  "Fusion",
  "Metal",
  "Soul",
  "Funk",
  "Disco",
  "Country",
  "EDM",
  "House",
  "Techno",
];

const MobileBandSetupModal: React.FC<MobileBandSetupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialRoles = [],
}) => {
  const { colors, isDarkMode } = useThemeColors();
  const [selectedRoles, setSelectedRoles] = useState<BandSetupRole[]>(
    initialRoles.map((role) => ({
      role: role.role,
      maxSlots: role.maxSlots,
      maxApplicants: role.maxApplicants || 20,
      currentApplicants: role.currentApplicants || 0,
      requiredSkills: role.requiredSkills || [],
      description: role.description || "",
      price: role.price?.toString() || "",
      currency: role.currency || "KES",
      negotiable: role.negotiable ?? true,
      isLocked: role.isLocked || false,
      filledSlots: role.filledSlots || 0,
      bookedPrice: role.bookedPrice ? role.bookedPrice.toString() : "",
    })),
  );
  const [customRole, setCustomRole] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<"roles" | "skills" | "budget">(
    "roles",
  );
  const [view, setView] = useState<"selection" | "configuration">("selection");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [showBudgetDetails, setShowBudgetDetails] = useState(false);

  // Memoized calculations
  const { totalPositions, totalBudget, totalMaxApplicants, totalPricedRoles } =
    useMemo(() => {
      const positions = selectedRoles.reduce(
        (sum, role) => sum + role.maxSlots,
        0,
      );
      const budget = selectedRoles.reduce((total, role) => {
        const price = role.price ? parseFloat(role.price) : 0;
        return total + (isNaN(price) ? 0 : price) * role.maxSlots;
      }, 0);
      const maxApplicants = selectedRoles.reduce(
        (sum, role) => sum + (role.maxApplicants || 20),
        0,
      );
      const pricedRoles = selectedRoles.filter(
        (r) => r.price && parseFloat(r.price) > 0,
      ).length;

      return {
        totalPositions: positions,
        totalBudget: budget,
        totalMaxApplicants: maxApplicants,
        totalPricedRoles: pricedRoles,
      };
    }, [selectedRoles]);

  const filteredRoles = useMemo(() => {
    return commonRoles.filter((role) => {
      const matchesSearch = role.value
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || role.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const progressPercentage = useMemo(() => {
    const baseProgress = Math.min(selectedRoles.length * 15, 60);
    const configuredProgress =
      selectedRoles.filter(
        (role) => role.maxSlots > 0 && role.requiredSkills.length > 0,
      ).length * 5;
    const budgetProgress =
      selectedRoles.filter((role) => role.price && parseFloat(role.price) > 0)
        .length * 3;
    return Math.min(baseProgress + configuredProgress + budgetProgress, 100);
  }, [selectedRoles]);

  const toggleRole = useCallback((roleName: string) => {
    setSelectedRoles((prev) => {
      const existing = prev.find((r) => r.role === roleName);
      if (existing) {
        return prev.filter((r) => r.role !== roleName);
      } else {
        return [
          ...prev,
          {
            role: roleName,
            maxSlots: 1,
            maxApplicants: 20,
            currentApplicants: 0,
            requiredSkills: [],
            description: "",
            currency: "KES",
            negotiable: true,
            isLocked: false,
            filledSlots: 0,
            bookedPrice: "",
          },
        ];
      }
    });
  }, []);

  const updateRole = useCallback(
    (roleName: string, updates: Partial<BandSetupRole>) => {
      setSelectedRoles((prev) =>
        prev.map((role) =>
          role.role === roleName ? { ...role, ...updates } : role,
        ),
      );
    },
    [],
  );

  const addCustomRole = useCallback(() => {
    if (customRole.trim()) {
      setSelectedRoles((prev) => [
        ...prev,
        {
          role: customRole.trim(),
          maxSlots: 1,
          maxApplicants: 20,
          currentApplicants: 0,
          requiredSkills: [],
          description: "",
          price: "",
          currency: "KES",
          negotiable: true,
          isLocked: false,
          filledSlots: 0,
          bookedPrice: "",
        },
      ]);
      setCustomRole("");
      setShowCustomForm(false);
    }
  }, [customRole]);

  const removeRole = useCallback((roleName: string) => {
    setSelectedRoles((prev) => prev.filter((r) => r.role !== roleName));
  }, []);

  const toggleSkill = useCallback((roleName: string, skill: string) => {
    setSelectedRoles((prev) =>
      prev.map((role) => {
        if (role.role === roleName) {
          const hasSkill = role.requiredSkills.includes(skill);
          return {
            ...role,
            requiredSkills: hasSkill
              ? role.requiredSkills.filter((s) => s !== skill)
              : [...role.requiredSkills, skill],
          };
        }
        return role;
      }),
    );
  }, []);

  const prepareForSubmission = useCallback(
    (role: BandSetupRole): BandRoleInput => {
      const price = role.price ? parseFloat(role.price) : undefined;
      const bookedPrice = role.bookedPrice
        ? parseFloat(role.bookedPrice)
        : undefined;

      return {
        role: role.role,
        maxSlots: role.maxSlots,
        maxApplicants: role.maxApplicants || 20,
        currentApplicants: role.currentApplicants || 0,
        requiredSkills:
          role.requiredSkills.length > 0 ? role.requiredSkills : undefined,
        description: role.description || undefined,
        price: price && !isNaN(price) ? price : undefined,
        currency: role.currency,
        negotiable: role.negotiable,
        isLocked: role.isLocked || false,
        filledSlots: role.filledSlots || 0,
        bookedPrice:
          bookedPrice && !isNaN(bookedPrice) ? bookedPrice : undefined,
        applicants: undefined,
        bookedUsers: undefined,
      };
    },
    [],
  );

  const handleSubmit = useCallback(() => {
    if (selectedRoles.length > 0) {
      const rolesToSubmit = selectedRoles.map(prepareForSubmission);
      onSubmit(rolesToSubmit);
      onClose();
    }
  }, [selectedRoles, prepareForSubmission, onSubmit, onClose]);

  // Selection View
  const SelectionView = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={cn("p-4 border-b", colors.border)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h2 className={cn("text-xl font-bold", colors.text)}>
              Select Roles
            </h2>
            <p className={cn("text-sm", colors.textMuted)}>
              Choose band members needed
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className={cn("rounded-full", colors.hoverBg)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search and Controls */}
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn("pl-10 rounded-full", colors.background)}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className={cn("rounded-full", colors.border, colors.hoverBg)}
          >
            {viewMode === "grid" ? (
              <List className="w-4 h-4" />
            ) : (
              <Grid className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Category Filters */}
        <ScrollArea className="pb-2">
          <div className="flex gap-2">
            {roleCategories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-full whitespace-nowrap transition-all shrink-0",
                    selectedCategory === category.value
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25"
                      : cn(
                          "border bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm",
                          colors.border,
                          colors.hoverBg,
                        ),
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{category.label}</span>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Role Selection Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 gap-3">
              {filteredRoles.map((role) => {
                const isSelected = selectedRoles.some(
                  (r) => r.role === role.value,
                );
                const Icon = role.icon;

                return (
                  <motion.button
                    key={role.value}
                    onClick={() => toggleRole(role.value)}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "relative p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all",
                      colors.border,
                      isSelected
                        ? "bg-gradient-to-br from-orange-500/10 to-red-500/10 ring-2 ring-orange-500/50"
                        : cn("hover:shadow-lg", colors.hoverBg),
                    )}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <Check className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                    <div
                      className={cn(
                        "p-3 rounded-xl transition-transform",
                        isSelected
                          ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                          : cn(colors.backgroundMuted, colors.primary),
                        "group-hover:scale-110",
                      )}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <span
                        className={cn(
                          "text-sm font-medium block mb-1",
                          colors.text,
                        )}
                      >
                        {role.value}
                      </span>
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs text-gray-500">
                          {role.popularity}%
                        </span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRoles.map((role) => {
                const isSelected = selectedRoles.some(
                  (r) => r.role === role.value,
                );
                const Icon = role.icon;

                return (
                  <button
                    key={role.value}
                    onClick={() => toggleRole(role.value)}
                    className={cn(
                      "w-full p-4 rounded-xl border flex items-center gap-3 transition-all",
                      colors.border,
                      isSelected
                        ? "bg-gradient-to-r from-orange-500/10 to-red-500/10 ring-1 ring-orange-500/30"
                        : cn(colors.hoverBg),
                    )}
                  >
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        isSelected
                          ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                          : cn(colors.backgroundMuted),
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <span className={cn("text-sm font-medium", colors.text)}>
                        {role.value}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 capitalize">
                          {role.category}
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">
                          {role.popularity}% popular
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-orange-500" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Custom Role Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <div
              className={cn(
                "p-4 rounded-2xl border bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm",
                colors.border,
              )}
            >
              <button
                onClick={() => setShowCustomForm(!showCustomForm)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                    <Plus className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="text-left">
                    <h3 className={cn("font-semibold", colors.text)}>
                      Add Custom Role
                    </h3>
                    <p className={cn("text-sm", colors.textMuted)}>
                      Can't find what you're looking for?
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={cn("w-5 h-5 transition-transform", {
                    "rotate-90": showCustomForm,
                  })}
                />
              </button>

              <AnimatePresence>
                {showCustomForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3 pt-4">
                      <Input
                        value={customRole}
                        onChange={(e) => setCustomRole(e.target.value)}
                        placeholder="e.g., Harpist, Beatboxer..."
                        className={cn(
                          "w-full rounded-xl",
                          colors.background,
                          "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20",
                        )}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowCustomForm(false)}
                          className="flex-1 rounded-xl"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={addCustomRole}
                          disabled={!customRole.trim()}
                          className="flex-1 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Role
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </ScrollArea>

      {/* Bottom Action Bar */}
      <div
        className={cn(
          "sticky bottom-0 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 p-4 border-t",
          colors.border,
        )}
      >
        <div className="space-y-3">
          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className={cn("font-medium", colors.text)}>
                Setup Progress
              </span>
              <span className="font-bold text-orange-600">
                {progressPercentage}%
              </span>
            </div>
            <Progress
              value={progressPercentage}
              className={cn("h-2", {
                "bg-gray-200 dark:bg-gray-700": true,
              })}
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
              <div className="text-xs text-gray-500">Roles</div>
              <div className="text-xl font-bold text-orange-600">
                {selectedRoles.length}
              </div>
            </div>
            <div className="text-center p-2 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
              <div className="text-xs text-gray-500">Positions</div>
              <div className="text-xl font-bold text-blue-600">
                {totalPositions}
              </div>
            </div>
            <div className="text-center p-2 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <div className="text-xs text-gray-500">Budget</div>
              <div className="text-xl font-bold text-green-600">
                {selectedRoles.find((r) => r.price)?.currency || "KES"}{" "}
                {totalBudget.toLocaleString()}
              </div>
            </div>
          </div>

          <Button
            onClick={() => setView("configuration")}
            disabled={selectedRoles.length === 0}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold shadow-lg shadow-orange-500/25"
          >
            Configure {selectedRoles.length} Role
            {selectedRoles.length !== 1 ? "s" : ""}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );

  // Role Configuration Component - Compact Version
  const RoleConfiguration = ({ role }: { role: BandSetupRole }) => {
    const maxApplicants = role.maxApplicants || 20;
    const isExpanded = expandedRole === role.role;

    return (
      <motion.div
        layout
        className={cn(
          "rounded-2xl border overflow-hidden",
          colors.border,
          "bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50",
          "backdrop-blur-sm",
        )}
      >
        {/* Header - Always visible */}
        <div
          className={cn("p-4", colors.border, {
            "border-b": isExpanded,
          })}
        >
          <div className="flex items-start justify-between">
            {/* Left: Role Info */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div
                className={cn(
                  "p-2 rounded-lg flex-shrink-0",
                  isDarkMode ? "bg-gray-700/50" : "bg-gray-100/80",
                )}
              >
                {commonRoles.find((r) => r.value === role.role)?.icon ? (
                  React.createElement(
                    commonRoles.find((r) => r.value === role.role)!.icon,
                    { className: "w-5 h-5" },
                  )
                ) : (
                  <Music className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4
                    className={cn(
                      "font-bold truncate",
                      colors.text,
                      isExpanded ? "text-lg" : "text-base",
                    )}
                  >
                    {role.role}
                  </h4>
                  {role.isLocked && <Lock className="w-3 h-3 text-amber-500" />}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className="text-xs font-medium bg-white/50 dark:bg-gray-800/50"
                  >
                    {role.maxSlots} position{role.maxSlots > 1 ? "s" : ""}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  >
                    {maxApplicants} max apps
                  </Badge>
                  {role.price && parseFloat(role.price) > 0 && (
                    <Badge className="text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      {role.currency || "KES"}{" "}
                      {parseFloat(role.price).toLocaleString()}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedRole(isExpanded ? null : role.role)}
                className="p-1 h-8 w-8"
              >
                <Settings
                  className={cn("w-4 h-4", {
                    "text-orange-500": isExpanded,
                  })}
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeRole(role.role)}
                className="p-1 h-8 w-8 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Expanded Configuration */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-4">
                {/* Compact Controls */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Positions */}
                  <div>
                    <Label
                      className={cn("text-sm font-medium mb-2", colors.text)}
                    >
                      Positions
                    </Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateRole(role.role, {
                            maxSlots: Math.max(1, role.maxSlots - 1),
                          })
                        }
                        className="h-8 w-8 p-0 rounded-lg"
                        disabled={role.maxSlots <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <div className="flex-1 text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {role.maxSlots}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateRole(role.role, { maxSlots: role.maxSlots + 1 })
                        }
                        className="h-8 w-8 p-0 rounded-lg"
                        disabled={role.maxSlots >= 10}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Max Applicants */}
                  <div>
                    <Label
                      className={cn("text-sm font-medium mb-2", colors.text)}
                    >
                      Max Apps
                    </Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateRole(role.role, {
                            maxApplicants: Math.max(1, maxApplicants - 5),
                          })
                        }
                        className="h-8 w-8 p-0 rounded-lg"
                        disabled={maxApplicants <= 5}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <div className="flex-1 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {maxApplicants}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateRole(role.role, {
                            maxApplicants: maxApplicants + 5,
                          })
                        }
                        className="h-8 w-8 p-0 rounded-lg"
                        disabled={maxApplicants >= 100}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Price Input */}
                <div>
                  <Label
                    className={cn("text-sm font-medium mb-2", colors.text)}
                  >
                    Compensation
                  </Label>
                  <div className="flex gap-2">
                    <Select
                      value={role.currency || "KES"}
                      onValueChange={(value) =>
                        updateRole(role.role, { currency: value })
                      }
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="KES">KES</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={role.price || ""}
                      onChange={(e) =>
                        updateRole(role.role, { price: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Skills Preview */}
                <div>
                  <Label
                    className={cn("text-sm font-medium mb-2", colors.text)}
                  >
                    Skills ({role.requiredSkills.length})
                  </Label>
                  <div className="flex flex-wrap gap-1">
                    {role.requiredSkills.slice(0, 4).map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {role.requiredSkills.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{role.requiredSkills.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // Configuration View
  const ConfigurationView = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={cn("p-4 border-b", colors.border)}>
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setView("selection");
              setExpandedRole(null);
            }}
            className={cn("rounded-full", colors.hoverBg)}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <h2 className={cn("text-xl font-bold", colors.text)}>
              Configure Roles
            </h2>
            <p className={cn("text-sm", colors.textMuted)}>
              Fine-tune your band setup
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className={cn("rounded-full", colors.hoverBg)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 w-full rounded-xl">
            <TabsTrigger value="roles" className="rounded-lg">
              <Settings className="w-4 h-4 mr-2" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="skills" className="rounded-lg">
              <Target className="w-4 h-4 mr-2" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="budget" className="rounded-lg">
              <DollarSign className="w-4 h-4 mr-2" />
              Budget
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <TabsContent value="roles" className="mt-0 space-y-4">
            {selectedRoles.length === 0 ? (
              <div className="text-center py-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-orange-500/10 to-red-500/10 flex items-center justify-center"
                >
                  <Users className="w-8 h-8 text-orange-500" />
                </motion.div>
                <h3 className={cn("text-lg font-semibold mb-2", colors.text)}>
                  No Roles Selected
                </h3>
                <p className={cn("text-sm mb-4", colors.textMuted)}>
                  Go back and select roles to configure
                </p>
                <Button
                  onClick={() => setView("selection")}
                  variant="outline"
                  className="rounded-xl"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Browse Roles
                </Button>
              </div>
            ) : (
              selectedRoles.map((role) => (
                <RoleConfiguration key={role.role} role={role} />
              ))
            )}
          </TabsContent>

          <TabsContent value="skills" className="mt-0 space-y-4">
            {selectedRoles.map((role) => (
              <div
                key={role.role}
                className={cn("rounded-2xl border p-4", colors.border)}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
                    <Target className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className={cn("font-bold", colors.text)}>
                      {role.role}
                    </h4>
                    <p className={cn("text-sm", colors.textMuted)}>
                      Required skills
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {commonSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant={
                          role.requiredSkills.includes(skill)
                            ? "default"
                            : "outline"
                        }
                        className={cn(
                          "cursor-pointer transition-all",
                          role.requiredSkills.includes(skill) &&
                            "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
                        )}
                        onClick={() => toggleSkill(role.role, skill)}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="budget" className="mt-0">
            <div className="space-y-4">
              {/* Budget Summary Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "rounded-2xl border p-4 bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50",
                  colors.border,
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className={cn("font-bold", colors.text)}>
                        Budget Summary
                      </h3>
                      <p className={cn("text-sm", colors.textMuted)}>
                        Total estimated cost
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBudgetDetails(!showBudgetDetails)}
                  >
                    {showBudgetDetails ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
                      <div className="text-sm text-gray-500">Roles</div>
                      <div className="text-2xl font-bold text-orange-600">
                        {selectedRoles.length}
                      </div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                      <div className="text-sm text-gray-500">Positions</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {totalPositions}
                      </div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                      <div className="text-sm text-gray-500">Max Apps</div>
                      <div className="text-2xl font-bold text-purple-600">
                        {totalMaxApplicants}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                    <div>
                      <div className="font-medium">Total Budget</div>
                      <div className="text-sm text-gray-500">
                        {totalPricedRoles} priced roles
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-600">
                        {selectedRoles.find((r) => r.price)?.currency || "KES"}{" "}
                        {totalBudget.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {showBudgetDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 mt-4 border-t">
                        <h4 className={cn("font-semibold mb-3", colors.text)}>
                          Budget Breakdown
                        </h4>
                        <div className="space-y-2">
                          {selectedRoles
                            .filter(
                              (role) =>
                                role.price && parseFloat(role.price) > 0,
                            )
                            .map((role) => {
                              const price = parseFloat(role.price!);
                              const total = price * role.maxSlots;
                              return (
                                <div
                                  key={role.role}
                                  className={cn(
                                    "flex items-center justify-between p-3 rounded-lg",
                                    "bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900",
                                  )}
                                >
                                  <div>
                                    <span
                                      className={cn("font-medium", colors.text)}
                                    >
                                      {role.role}
                                    </span>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {role.maxSlots} pos
                                      </Badge>
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-blue-100 text-blue-700"
                                      >
                                        {role.maxApplicants || 20} apps
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-lg font-bold text-green-600">
                                      {role.currency || "KES"}{" "}
                                      {total.toLocaleString()}
                                    </div>
                                    <div
                                      className={cn(
                                        "text-xs",
                                        colors.textMuted,
                                      )}
                                    >
                                      {role.currency || "KES"}{" "}
                                      {price.toLocaleString()} each
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </TabsContent>
        </div>
      </ScrollArea>

      {/* Bottom Action Bar */}
      <div
        className={cn(
          "sticky bottom-0 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 p-4 border-t",
          colors.border,
        )}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="font-medium">
                {selectedRoles.length} role
                {selectedRoles.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{totalPositions} positions</span>
              <span>•</span>
              <span>{totalMaxApplicants} max applications</span>
            </div>
          </div>
          {totalBudget > 0 && (
            <div className="text-right">
              <div className="text-lg font-bold text-green-600">
                {selectedRoles.find((r) => r.price)?.currency || "KES"}{" "}
                {totalBudget.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Total budget</div>
            </div>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={selectedRoles.length === 0}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold shadow-lg shadow-orange-500/25"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          {selectedRoles.length === 0
            ? "Select Roles First"
            : `Create Band (${selectedRoles.length})`}
        </Button>
      </div>
    </div>
  );

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent
        className={cn(
          "h-[90vh] max-h-[90vh] rounded-t-3xl overflow-hidden",
          colors.background,
        )}
      >
        <TooltipProvider>
          {view === "selection" ? <SelectionView /> : <ConfigurationView />}
        </TooltipProvider>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileBandSetupModal;
