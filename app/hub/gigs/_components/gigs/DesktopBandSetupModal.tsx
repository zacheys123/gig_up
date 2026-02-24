import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Users as UsersIcon,
  Info,
  AlertCircle,
  Grid,
  List,
  Filter,
  Eye,
  EyeOff,
  Clock,
  Calendar,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { getBackendValue, getDisplayName } from "../../utils";
// Add these imports if not already present

interface DesktopBandSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roles: BandRoleInput[]) => void;
  initialRoles?: BandRoleInput[];
  isEditMode?: boolean;
}

const commonRoles = [
  {
    id: "vocalist",
    value: "Lead Vocalist",
    icon: Mic,
    color: "red",
    category: "vocal",
    popularity: 95,
  },
  {
    id: "guitar",
    value: "Guitarist",
    icon: Guitar,
    color: "blue",
    category: "strings",
    popularity: 90,
  },
  {
    id: "bass",
    value: "Bassist",
    icon: Music,
    color: "green",
    category: "strings",
    popularity: 85,
  },
  {
    id: "drums",
    value: "Drummer",
    icon: Drum,
    color: "amber",
    category: "percussion",
    popularity: 88,
  },
  {
    id: "piano",
    value: "Pianist/Keyboardist",
    icon: Piano,
    color: "purple",
    category: "keys",
    popularity: 80,
  },
  {
    id: "sax",
    value: "Saxophonist",
    icon: Music,
    color: "pink",
    category: "brass",
    popularity: 70,
  },
  {
    id: "trumpet",
    value: "Trumpeter",
    icon: Music,
    color: "cyan",
    category: "brass",
    popularity: 65,
  },
  {
    id: "violin",
    value: "Violinist",
    icon: Music,
    color: "indigo",
    category: "strings",
    popularity: 75,
  },
  {
    id: "backups",
    value: "Backup Vocalist",
    icon: Mic,
    color: "rose",
    category: "vocal",
    popularity: 82,
  },
  {
    id: "percussion",
    value: "Percussionist",
    icon: Drum,
    color: "orange",
    category: "percussion",
    popularity: 72,
  },
  {
    id: "dj",
    value: "DJ",
    icon: Volume2,
    color: "violet",
    category: "electronic",
    popularity: 88,
  },
  {
    id: "mc",
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
  "Acoustic",
  "Orchestral",
  "Experimental",
];

const maxApplicantsPresets = [10, 15, 20, 30, 50, 75, 100, 150, 200];

const SlimRoleCard = React.memo(
  ({
    role,
    onRoleUpdate,
    onRemoveRole,
  }: {
    role: BandSetupRole;
    onRoleUpdate: (role: BandSetupRole) => void;
    onRemoveRole: (roleName: string) => void;
  }) => {
    const { isDarkMode } = useThemeColors();
    // LOOKUP: Find the pretty name using the ID stored in role.role
    const roleInfo = commonRoles.find((r) => r.id === role.role);
    const Icon = roleInfo?.icon || Music;
    const displayLabel = roleInfo ? roleInfo.value : role.role;
    const handleUpdate = (field: keyof BandSetupRole, value: any) => {
      onRoleUpdate({ ...role, [field]: value });
    };

    return (
      <div
        className={cn(
          "group relative flex items-center gap-6 p-4 rounded-2xl border transition-all duration-300",
          isDarkMode
            ? "bg-zinc-900/40 border-zinc-800/50 hover:border-orange-500/30 hover:bg-zinc-900/60"
            : "bg-white border-zinc-200 hover:border-orange-500/30 hover:shadow-xl shadow-zinc-200/50",
        )}
      >
        {/* 1. Identity */}
        <div className="flex items-center gap-4 min-w-[160px]">
          <div className={cn("p-3 rounded-xl ...")}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            {/* Display the pretty label: "Pianist/Keyboardist" */}
            <h4 className="font-black text-sm uppercase tracking-tight leading-none mb-1">
              {displayLabel}
            </h4>
            {/* Optional: Show the DB key for clarity during testing */}
            <p className="text-[9px] font-bold text-zinc-500 uppercase">
              {role.role}
            </p>
          </div>
        </div>

        {/* 2. Positions & Applicants */}
        <div className="flex items-center gap-6 px-6 border-x border-zinc-100 dark:border-zinc-800">
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase text-zinc-400 tracking-tighter">
              Qty
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  handleUpdate("maxSlots", Math.max(1, role.maxSlots - 1))
                }
                className="p-1 hover:text-orange-500"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-sm font-black min-w-[12px] text-center">
                {role.maxSlots}
              </span>
              <button
                onClick={() => handleUpdate("maxSlots", role.maxSlots + 1)}
                className="p-1 hover:text-orange-500"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase text-zinc-400 tracking-tighter">
              Max Apps
            </p>
            <Select
              value={role.maxApplicants?.toString()}
              onValueChange={(v) => handleUpdate("maxApplicants", parseInt(v))}
            >
              <SelectTrigger className="h-7 w-16 text-xs font-bold bg-zinc-100 dark:bg-zinc-800 border-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* 3. PRICING (THE FOCUS) */}
        <div className="flex-1 space-y-1.5">
          <p className="text-[9px] font-black uppercase text-zinc-400 tracking-tighter">
            Rate per head
          </p>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 group/input">
              <span
                className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold transition-colors",
                  isDarkMode
                    ? "text-zinc-500 group-focus-within/input:text-orange-500"
                    : "text-zinc-400 group-focus-within/input:text-orange-600",
                )}
              >
                {role.currency}
              </span>
              <Input
                type="number"
                value={role.price}
                onChange={(e) => handleUpdate("price", e.target.value)}
                className={cn(
                  "pl-10 h-10 bg-zinc-100/50 dark:bg-zinc-800/50 border-none text-sm font-black transition-all",
                  "focus-visible:ring-1 focus-visible:ring-orange-500/50 focus-visible:bg-white dark:focus-visible:bg-zinc-800",
                )}
                placeholder="0.00"
              />
            </div>

            {/* CUSTOM STYLED NEGO SWITCH */}
            <div
              className={cn(
                "flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all border",
                role.negotiable
                  ? "bg-orange-500/5 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]"
                  : "bg-transparent border-zinc-200 dark:border-zinc-800 opacity-60",
              )}
            >
              <span
                className={cn(
                  "text-[8px] font-black uppercase tracking-widest mb-1 transition-colors",
                  role.negotiable ? "text-orange-500" : "text-zinc-500",
                )}
              >
                {role.negotiable ? "Open" : "Fixed"}
              </span>
              <Switch
                checked={role.negotiable}
                onCheckedChange={(v) => handleUpdate("negotiable", v)}
                className={cn(
                  "scale-75 transition-all",
                  // The "Track" styling
                  "data-[state=checked]:bg-orange-500 data-[state=unchecked]:bg-zinc-300 dark:data-[state=unchecked]:bg-zinc-700",
                  // Add a glow when active
                  "role.negotiable && shadow-[0_0_10px_rgba(249,115,22,0.4)]",
                )}
              />
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemoveRole(role.role)}
          className="opacity-0 group-hover:opacity-100 rounded-full hover:bg-red-50 hover:text-red-500"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  },
);
SlimRoleCard.displayName = "SlimRoleCard";

const DesktopBandSetupModal: React.FC<DesktopBandSetupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialRoles = [],
}) => {
  const { colors, isDarkMode } = useThemeColors();
  const [selectedRoles, setSelectedRoles] = useState<BandSetupRole[]>(
    initialRoles.map((role) => {
      // Convert backend value to display name
      const displayName = getDisplayName(role.role);

      return {
        role: role.role, // Store as display name
        maxSlots: role.maxSlots,
        maxApplicants: role.maxApplicants || 20,
        requiredSkills: role.requiredSkills || [],
        description: role.description || "",
        price: role.price?.toString() || "",
        currency: role.currency || "KES",
        negotiable: role.negotiable ?? true,
        isLocked: role.isLocked || false,
        filledSlots: role.filledSlots || 0,
      };
    }),
  );
  const [customRole, setCustomRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<"select" | "configure">("select");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showMaxApplicantsInfo, setShowMaxApplicantsInfo] = useState(false);

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

  const toggleRole = useCallback((roleLabel: string) => {
    // Find the role object by its display label
    const roleInfo = commonRoles.find((r) => r.value === roleLabel);
    // Use the ID for the DB, or the raw label if it's a custom role
    const dbValue = roleInfo ? roleInfo.id : roleLabel.toLowerCase();

    setSelectedRoles((prev) => {
      const existing = prev.find((r) => r.role === dbValue);
      if (existing) {
        return prev.filter((r) => r.role !== dbValue);
      } else {
        return [
          ...prev,
          {
            role: dbValue, // Stores "piano"
            maxSlots: 1,
            maxApplicants: 20,
            currentApplicants: 0,
            requiredSkills: [],
            description: "",
            currency: "KES",
            negotiable: true,
            isLocked: false,
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
          currency: "KES",
          negotiable: true,
          isLocked: false,
        },
      ]);
      setCustomRole("");
    }
  }, [customRole]);

  const removeRole = useCallback((roleId: string) => {
    setSelectedRoles((prev) => prev.filter((r) => r.role !== roleId));
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

      const formattedRole: BandRoleInput = {
        role: role.role, // This converts display name to backend value
        maxSlots: role.maxSlots,
        maxApplicants: role.maxApplicants || 20,
        requiredSkills:
          role.requiredSkills.length > 0 ? role.requiredSkills : undefined,
        description: role.description || undefined,
        price: price && !isNaN(price) ? price : undefined,
        currency: role.currency,
        negotiable: role.negotiable,
        isLocked: role.isLocked || false,
        filledSlots: role.filledSlots || 0,
      };

      // Remove undefined values
      Object.keys(formattedRole).forEach((key) => {
        if (formattedRole[key as keyof BandRoleInput] === undefined) {
          delete formattedRole[key as keyof BandRoleInput];
        }
      });

      return formattedRole;
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

  // Role Configuration Card Component
  const RoleConfigCard = ({ role }: { role: BandSetupRole }) => {
    const maxApplicants = role.maxApplicants || 20;

    return (
      <Card
        className={cn(
          "overflow-hidden border-2 h-full transition-all hover:shadow-lg",
          colors.border,
          "hover:border-orange-500/50",
        )}
      >
        {/* Card Header with Role Info */}
        <div className={cn("p-4 border-b", colors.border)}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", colors.backgroundMuted)}>
                {commonRoles.find((r) => r.value === role.role)?.icon ? (
                  React.createElement(
                    commonRoles.find((r) => r.value === role.role)!.icon,
                    {
                      className: "w-5 h-5",
                    },
                  )
                ) : (
                  <Music className="w-5 h-5" />
                )}
              </div>
              <div>
                <h4 className={cn("font-bold text-lg", colors.text)}>
                  {role.role}
                </h4>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {role.maxSlots} position{role.maxSlots > 1 ? "s" : ""}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      isDarkMode
                        ? "bg-blue-900/30 text-blue-300"
                        : "bg-blue-100 text-blue-700",
                    )}
                  >
                    {maxApplicants} max apps
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeRole(role.role)}
              className={cn(
                "text-gray-400 hover:text-red-500 hover:bg-red-50",
                colors.hoverBg,
              )}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Card Content with Configuration */}
        <CardContent className="p-5">
          {/* Positions & Applicants in grid */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            {/* Positions Column */}
            <div>
              <Label
                className={cn("text-sm font-medium mb-2 block", colors.text)}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Positions Needed
                </div>
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
                  className={cn(
                    "rounded-lg h-10 w-10",
                    colors.border,
                    colors.hoverBg,
                  )}
                  disabled={role.maxSlots <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <div className="flex-1 text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {role.maxSlots}
                  </div>
                  <div className={cn("text-xs", colors.textMuted)}>
                    position{role.maxSlots > 1 ? "s" : ""}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateRole(role.role, { maxSlots: role.maxSlots + 1 })
                  }
                  className={cn(
                    "rounded-lg h-10 w-10",
                    colors.border,
                    colors.hoverBg,
                  )}
                  disabled={role.maxSlots >= 10}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Max Applicants Column */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label
                  className={cn(
                    "text-sm font-medium flex items-center gap-2",
                    colors.text,
                  )}
                >
                  <UserPlus className="w-4 h-4" />
                  Max Applicants
                </Label>
                <div
                  className={cn("text-xs", {
                    "text-red-500": maxApplicants < role.maxSlots,
                    "text-yellow-500":
                      maxApplicants < role.maxSlots * 5 &&
                      maxApplicants >= role.maxSlots,
                    "text-green-500": maxApplicants >= role.maxSlots * 5,
                  })}
                >
                  {maxApplicants < role.maxSlots
                    ? "⚠️ Too low"
                    : maxApplicants < role.maxSlots * 5
                      ? "✓ Balanced"
                      : "✓ Good range"}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateRole(role.role, {
                        maxApplicants: Math.max(
                          1,
                          (role.maxApplicants || 20) - 5,
                        ),
                      })
                    }
                    className={cn(
                      "rounded-lg h-10 w-10",
                      colors.border,
                      colors.hoverBg,
                    )}
                    disabled={(role.maxApplicants || 20) <= 5}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <div className="flex-1 text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {maxApplicants}
                    </div>
                    <div className={cn("text-xs", colors.textMuted)}>
                      applications
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateRole(role.role, {
                        maxApplicants: (role.maxApplicants || 20) + 5,
                      })
                    }
                    className={cn(
                      "rounded-lg h-10 w-10",
                      colors.border,
                      colors.hoverBg,
                    )}
                    disabled={(role.maxApplicants || 20) >= 200}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Slider */}
                <div className="pt-2">
                  <Slider
                    value={[maxApplicants]}
                    min={1}
                    max={200}
                    step={5}
                    onValueChange={([value]) =>
                      updateRole(role.role, { maxApplicants: value })
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Validation Warning */}
          {maxApplicants < role.maxSlots && (
            <div
              className={cn(
                "p-3 rounded-lg mb-4",
                "bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800",
              )}
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">
                  <strong>Recommendation:</strong> Max applicants (
                  {maxApplicants}) should be at least {role.maxSlots * 3} for
                  better selection quality.
                </p>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mb-4">
            <Label
              className={cn("text-sm font-medium mb-2 block", colors.text)}
            >
              Description (Optional)
            </Label>
            <Textarea
              placeholder="Responsibilities, style preferences, experience level..."
              value={role.description || ""}
              onChange={(e) =>
                updateRole(role.role, { description: e.target.value })
              }
              rows={2}
              className={cn(
                "resize-none text-sm",
                colors.border,
                colors.background,
              )}
            />
          </div>

          {/* Compensation Section */}
          <div className="mb-4">
            <Label
              className={cn("text-sm font-medium mb-2 block", colors.text)}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Compensation
              </div>
            </Label>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-3">
                <Select
                  value={role.currency || "KES"}
                  onValueChange={(value) =>
                    updateRole(role.role, { currency: value })
                  }
                >
                  <SelectTrigger className={cn("h-9 text-sm", colors.border)}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={colors.background}>
                    <SelectItem value="KES">KES</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-6">
                <Input
                  type="number"
                  placeholder="Amount per position"
                  value={role.price || ""}
                  onChange={(e) =>
                    updateRole(role.role, { price: e.target.value })
                  }
                  min="0"
                  className={cn(
                    "h-9 text-sm",
                    colors.border,
                    colors.background,
                  )}
                />
              </div>
              <div className="col-span-3">
                <div className="flex items-center h-9 px-3 rounded-md border bg-gray-50 dark:bg-gray-800 justify-center">
                  <Switch
                    checked={role.negotiable ?? true}
                    onCheckedChange={(checked) =>
                      updateRole(role.role, { negotiable: checked })
                    }
                    className="mr-2"
                  />
                  <span className={cn("text-sm", colors.text)}>
                    {role.negotiable ? "Negotiable" : "Fixed"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <Label
              className={cn("text-sm font-medium mb-2 block", colors.text)}
            >
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Required Skills
              </div>
            </Label>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {commonSkills.slice(0, 8).map((skill) => (
                <Badge
                  key={skill}
                  variant={
                    role.requiredSkills.includes(skill) ? "default" : "outline"
                  }
                  className={cn(
                    "cursor-pointer transition-all text-xs",
                    role.requiredSkills.includes(skill) &&
                      "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
                  )}
                  onClick={() => toggleSkill(role.role, skill)}
                >
                  {skill}
                </Badge>
              ))}
              {role.requiredSkills.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  +{role.requiredSkills.length} more
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Add custom skill..."
                className={cn(
                  "flex-1 h-9 text-sm",
                  colors.border,
                  colors.background,
                )}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.currentTarget.value.trim()) {
                    const skill = e.currentTarget.value.trim();
                    if (!role.requiredSkills.includes(skill)) {
                      updateRole(role.role, {
                        requiredSkills: [...role.requiredSkills, skill],
                      });
                    }
                    e.currentTarget.value = "";
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const input = document.querySelector(
                    `input[placeholder="Add custom skill..."]`,
                  ) as HTMLInputElement;
                  if (input?.value.trim()) {
                    const skill = input.value.trim();
                    if (!role.requiredSkills.includes(skill)) {
                      updateRole(role.role, {
                        requiredSkills: [...role.requiredSkills, skill],
                      });
                    }
                    input.value = "";
                  }
                }}
                className={cn("h-9", colors.hoverBg)}
              >
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }; // Add expanded state for each role in the parent component
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>(
    {},
  );

  // Add this function to handle expanding/collapsing
  const toggleExpanded = useCallback((roleName: string) => {
    setExpandedRoles((prev) => ({
      ...prev,
      [roleName]: !prev[roleName],
    }));
  }, []);

  // Add these refs at the top of DesktopBandSetupModal component
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastCardRef = useRef<HTMLDivElement>(null);

  // Add this useEffect to scroll to bottom when roles change
  useEffect(() => {
    if (
      selectedRoles.length > 0 &&
      scrollContainerRef.current &&
      lastCardRef.current
    ) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        if (scrollContainerRef.current && lastCardRef.current) {
          // Scroll to the last card
          lastCardRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }
      }, 100);
    }
  }, [selectedRoles.length]); // Scroll when number of roles changes
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [selectedRoles.length]);
  const EmptyState = () => (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      {/* Sleek animated icon */}
      <div className="relative mb-8">
        <div className="relative w-40 h-40">
          {/* Outer glow ring */}
          <div
            className={cn(
              "absolute inset-0 rounded-full animate-[spin_3s_linear_infinite] blur-xl",
              isDarkMode
                ? "bg-gradient-to-r from-orange-500/10 via-red-500/10 to-purple-500/10"
                : "bg-gradient-to-r from-orange-500/15 via-red-500/15 to-purple-500/15",
            )}
          ></div>

          {/* Main icon container */}
          <div
            className={cn(
              "absolute inset-4 rounded-full flex items-center justify-center",
              "backdrop-blur-sm border",
              isDarkMode
                ? "bg-gray-800/90 border-gray-700/40 shadow-2xl shadow-black/20"
                : "bg-white/90 border-white/40 shadow-2xl shadow-gray-500/10",
            )}
          >
            {/* Icon with gradient */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-red-500 blur-xl opacity-20 animate-pulse"></div>
              <div className="relative p-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500 shadow-lg shadow-orange-500/30">
                <Users className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          {/* Floating dots */}
          {[
            { color: "blue", top: "10%", left: "10%" },
            { color: "purple", top: "10%", right: "10%" },
            { color: "green", bottom: "10%", left: "10%" },
            { color: "amber", bottom: "10%", right: "10%" },
            { color: "cyan", top: "50%", left: "0" },
          ].map((dot, i) => (
            <div
              key={i}
              className={cn(
                "absolute w-3 h-3 rounded-full",
                isDarkMode
                  ? `bg-${dot.color}-500/30`
                  : `bg-${dot.color}-500/20`,
                "animate-bounce",
              )}
              style={{
                top: dot.top,
                left: dot.left,
                right: dot.right,
                bottom: dot.bottom,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Message */}
      <div className="max-w-md mb-8">
        <h3
          className={cn(
            "text-xl font-bold mb-3",
            isDarkMode ? "text-white" : "text-gray-900",
          )}
        >
          No Roles Selected Yet
        </h3>

        <p
          className={cn(
            "text-base",
            isDarkMode ? "text-gray-300" : "text-gray-600",
          )}
        >
          Start building your band by selecting roles from the left panel. Each
          role will appear here where you can configure requirements,
          compensation, and application limits.
        </p>
      </div>

      {/* Action Button */}
      <Button
        onClick={() => setActiveTab("select")}
        className={cn(
          "gap-2 px-6 py-3 mb-8",
          "bg-gradient-to-r from-orange-500 to-red-500",
          "hover:from-orange-600 hover:to-red-600",
          "text-white font-semibold",
          "shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30",
          "transition-all duration-300",
        )}
      >
        <ChevronLeft className="w-5 h-5" />
        Browse Available Roles
      </Button>

      {/* Quick Tips */}
      <div
        className={cn(
          "w-full max-w-2xl pt-8 border-t",
          isDarkMode ? "border-gray-700" : "border-gray-200",
        )}
      >
        <h4
          className={cn(
            "text-sm font-semibold mb-4",
            isDarkMode ? "text-gray-300" : "text-gray-700",
          )}
        >
          Quick Tips
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tip 1 */}
          <div
            className={cn(
              "flex items-start gap-3 p-4 rounded-xl",
              "transition-all duration-300 hover:scale-[1.02]",
              isDarkMode
                ? "bg-gray-800/50 hover:bg-gray-800 border border-gray-700"
                : "bg-white hover:bg-gray-50 border border-gray-200",
            )}
          >
            <div
              className={cn(
                "p-2 rounded-lg",
                isDarkMode ? "bg-blue-900/30" : "bg-blue-100",
              )}
            >
              <Music className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-left">
              <div
                className={cn(
                  "font-medium mb-1",
                  isDarkMode ? "text-blue-300" : "text-blue-700",
                )}
              >
                Essential Roles
              </div>
              <div
                className={cn(
                  "text-sm",
                  isDarkMode ? "text-blue-400/80" : "text-blue-600/80",
                )}
              >
                Start with lead vocalist, guitarist, drummer
              </div>
            </div>
          </div>

          {/* Tip 2 */}
          <div
            className={cn(
              "flex items-start gap-3 p-4 rounded-xl",
              "transition-all duration-300 hover:scale-[1.02]",
              isDarkMode
                ? "bg-gray-800/50 hover:bg-gray-800 border border-gray-700"
                : "bg-white hover:bg-gray-50 border border-gray-200",
            )}
          >
            <div
              className={cn(
                "p-2 rounded-lg",
                isDarkMode ? "bg-purple-900/30" : "bg-purple-100",
              )}
            >
              <UserPlus className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-left">
              <div
                className={cn(
                  "font-medium mb-1",
                  isDarkMode ? "text-purple-300" : "text-purple-700",
                )}
              >
                Application Limits
              </div>
              <div
                className={cn(
                  "text-sm",
                  isDarkMode ? "text-purple-400/80" : "text-purple-600/80",
                )}
              >
                Set realistic max applicants per role
              </div>
            </div>
          </div>

          {/* Tip 3 */}
          <div
            className={cn(
              "flex items-start gap-3 p-4 rounded-xl",
              "transition-all duration-300 hover:scale-[1.02]",
              isDarkMode
                ? "bg-gray-800/50 hover:bg-gray-800 border border-gray-700"
                : "bg-white hover:bg-gray-50 border border-gray-200",
            )}
          >
            <div
              className={cn(
                "p-2 rounded-lg",
                isDarkMode ? "bg-emerald-900/30" : "bg-emerald-100",
              )}
            >
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-left">
              <div
                className={cn(
                  "font-medium mb-1",
                  isDarkMode ? "text-emerald-300" : "text-emerald-700",
                )}
              >
                Budget Planning
              </div>
              <div
                className={cn(
                  "text-sm",
                  isDarkMode ? "text-emerald-400/80" : "text-emerald-600/80",
                )}
              >
                Add compensation to attract quality talent
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "max-w-7xl p-0 overflow-hidden border-none shadow-2xl",
          isDarkMode ? "bg-[#09090b] text-zinc-100" : "bg-white text-zinc-900",
          "h-[85vh] flex flex-col",
        )}
      >
        <div className="flex flex-1 min-h-0">
          {/* ================= LEFT PANEL: QUIET SELECTION ================= */}
          <div
            className={cn(
              "w-[30%] flex flex-col border-r transition-all duration-300",
              isDarkMode
                ? "border-zinc-800/50 bg-[#09090b]"
                : "border-zinc-100 bg-zinc-50/30",
            )}
          >
            {/* Subtle Header */}
            <div className="p-6 pb-2 shrink-0">
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-0.5">
                  <DialogTitle className="text-lg font-bold tracking-tight">
                    Roles
                  </DialogTitle>
                  <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
                    {selectedRoles.length} selected
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 rounded-full opacity-50 hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Quiet Search */}
              <div className="relative group mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <Input
                  placeholder="Search instruments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "pl-9 h-10 text-sm bg-transparent border-zinc-200 dark:border-zinc-800 rounded-xl",
                    "focus-visible:ring-1 focus-visible:ring-orange-500/50 focus-visible:border-orange-500/50 transition-all",
                  )}
                />
              </div>

              {/* Category Pills - More compact */}
              <div className="flex gap-1.5 overflow-x-auto pb-4 no-scrollbar">
                {roleCategories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border",
                      selectedCategory === category.value
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-black border-transparent"
                        : "bg-transparent text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400",
                    )}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Role List - Refined hover states */}
            <div className="flex-1 overflow-y-auto px-4 space-y-1.5 no-scrollbar">
              {filteredRoles.map((role) => {
                // Check if this specific role ID is currently in our selected list
                const isSelected = selectedRoles.some(
                  (r) => r.role === role.id,
                );

                return (
                  <button
                    key={role.id}
                    onClick={() => toggleRole(role.value)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl transition-all border w-full text-left",
                      isSelected
                        ? "bg-orange-500/10 border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.1)]"
                        : "bg-transparent border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800",
                    )}
                  >
                    <div
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        isSelected
                          ? "bg-orange-500 text-white"
                          : "bg-zinc-100 dark:bg-zinc-800",
                      )}
                    >
                      <role.icon className="w-4 h-4" />
                    </div>
                    <span
                      className={cn(
                        "text-sm font-bold",
                        isSelected
                          ? "text-orange-600 dark:text-orange-400"
                          : "text-zinc-600 dark:text-zinc-400",
                      )}
                    >
                      {role.value}
                    </span>
                    {isSelected && (
                      <Check className="w-3 h-3 ml-auto text-orange-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Input Section */}
            <div className="p-4 mt-auto border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
              <div className="flex gap-2">
                <Input
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="Other role..."
                  className="h-9 text-xs bg-background border-zinc-200 dark:border-zinc-800"
                />
                <Button
                  onClick={addCustomRole}
                  size="sm"
                  className="bg-zinc-900 dark:bg-zinc-100 dark:text-black h-9"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* ================= RIGHT PANEL: CONFIGURATION ================= */}
          <div
            className={cn(
              "w-[70%] flex flex-col relative",
              isDarkMode ? "bg-[#09090b]" : "bg-[#fcfcfc]",
            )}
          >
            {/* Main Header */}
            <div
              className={cn(
                "p-8 border-b shrink-0 z-10 backdrop-blur-xl bg-opacity-90",
                isDarkMode
                  ? "border-zinc-800 bg-[#09090b]/80"
                  : "border-zinc-100 bg-white/80",
              )}
            >
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter">
                    Configuration
                  </h3>
                  <div className="flex gap-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-bold uppercase tracking-widest border-orange-500/30 text-orange-600"
                    >
                      Live Ensemble
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-8">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      Total Budget
                    </p>
                    <p className="text-xl font-black text-green-500">
                      <span className="text-xs mr-1 opacity-50 font-medium">
                        KES
                      </span>
                      {totalBudget.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      Positions
                    </p>
                    <p className="text-xl font-black">{totalPositions}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Config Content Area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-8 scroll-smooth no-scrollbar"
            >
              {selectedRoles.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-zinc-400 flex items-center justify-center">
                    <Music className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium">
                    Add roles from the left to configure your setup
                  </p>
                </div>
              ) : (
                <div
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-8 space-y-4 no-scrollbar"
                >
                  <AnimatePresence>
                    {selectedRoles.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center opacity-20">
                        <Music className="w-12 h-12 mb-2" />
                        <p className="text-sm font-bold">Add roles to begin</p>
                      </div>
                    ) : (
                      selectedRoles.map((role) => (
                        <motion.div
                          key={role.role}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                        >
                          <SlimRoleCard
                            role={role}
                            onRemoveRole={toggleRole}
                            onRoleUpdate={(updated) =>
                              setSelectedRoles((prev) =>
                                prev.map((r) =>
                                  r.role === updated.role ? updated : r,
                                ),
                              )
                            }
                          />
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                  <div className="h-32" />
                </div>
              )}
            </div>

            {/* Floating Action Footer */}
            {selectedRoles.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 p-8 pointer-events-none">
                <div
                  className={cn(
                    "max-w-xl mx-auto p-4 rounded-3xl border shadow-2xl pointer-events-auto flex items-center justify-between",
                    isDarkMode
                      ? "bg-zinc-900/95 border-zinc-700 backdrop-blur-xl"
                      : "bg-white/95 border-zinc-200 backdrop-blur-xl",
                  )}
                >
                  <div className="pl-4">
                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-tighter">
                      Ready to post
                    </p>
                    <p className="font-bold text-sm leading-none">
                      {selectedRoles.length} Roles Defined
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={onClose}
                      className="rounded-2xl font-bold text-xs h-10 px-5"
                    >
                      Discard
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl px-8 font-black text-xs h-10 shadow-lg shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-95"
                    >
                      CONFIRM SETUP
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DesktopBandSetupModal;
