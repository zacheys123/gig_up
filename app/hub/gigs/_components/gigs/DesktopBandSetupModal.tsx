import React, { useState, useMemo, useCallback } from "react";
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
  Edit3,
  EyeOff,
  Clock,
  Calendar,
  ChevronUp,
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

interface DesktopBandSetupModalProps {
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
  "Acoustic",
  "Orchestral",
  "Experimental",
];

const maxApplicantsPresets = [10, 15, 20, 30, 50, 75, 100, 150, 200];

const DesktopBandSetupModal: React.FC<DesktopBandSetupModalProps> = ({
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
      // Fix: Ensure bookedPrice is properly handled
      bookedPrice: role.bookedPrice ? role.bookedPrice.toString() : "",
    })),
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
        // These are optional - you might want to handle them if needed
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
  };
  const SlimRoleCard = ({ role }: { role: BandSetupRole }) => {
    const maxApplicants = role.maxApplicants || 20;
    const price = role.price ? parseFloat(role.price) : undefined;
    const [showFullDescription, setShowFullDescription] = useState(false);

    return (
      <div
        className={cn(
          "rounded-2xl border transition-all duration-300 hover:shadow-xl",
          colors.border,
          colors.background,
          "hover:scale-[1.002] bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50",
          "backdrop-blur-sm group",
        )}
      >
        <div className="p-6">
          {/* Header with role info and actions */}
          <div className="flex items-start justify-between mb-6">
            {/* Left: Role Icon and Basic Info */}
            <div className="flex items-start gap-4 flex-1">
              <div
                className={cn(
                  "p-3 rounded-xl transition-transform group-hover:scale-105 shadow-md",
                  isDarkMode ? "bg-gray-700/50" : "bg-gray-100/80",
                )}
              >
                {commonRoles.find((r) => r.value === role.role)?.icon ? (
                  React.createElement(
                    commonRoles.find((r) => r.value === role.role)!.icon,
                    { className: "w-6 h-6" },
                  )
                ) : (
                  <Music className="w-6 h-6" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h4
                    className={cn(
                      "font-bold text-xl",
                      colors.text,
                      "group-hover:text-orange-600 transition-colors",
                    )}
                  >
                    {role.role}
                  </h4>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-sm font-medium bg-white/50 dark:bg-gray-800/50"
                    >
                      {role.maxSlots} position{role.maxSlots > 1 ? "s" : ""}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-sm font-medium",
                        isDarkMode
                          ? "bg-blue-900/30 text-blue-300"
                          : "bg-blue-100 text-blue-700",
                      )}
                    >
                      {maxApplicants} max apps
                    </Badge>
                  </div>
                </div>

                {/* Quick Stats Row */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {role.currentApplicants || 0} current applicants
                    </span>
                  </div>
                  {role.isLocked && (
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-500" />
                      <span className="text-sm text-amber-600 dark:text-amber-400">
                        Locked
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Price and Delete */}
            <div className="flex flex-col items-end gap-3">
              {price && price > 0 && (
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-sm px-3 py-1 font-semibold",
                        isDarkMode
                          ? "text-emerald-300 border-emerald-700 bg-emerald-900/20"
                          : "text-emerald-600 border-emerald-200 bg-emerald-50",
                      )}
                    >
                      <DollarSign className="w-3 h-3 mr-1 inline" />
                      {role.currency || "KES"} {price.toLocaleString()}
                    </Badge>
                    {role.negotiable && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      >
                        Negotiable
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    per position • {role.maxSlots} × {role.currency || "KES"}{" "}
                    {price.toLocaleString()}
                  </p>
                </div>
              )}
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
                Remove
              </Button>
            </div>
          </div>

          {/* MAIN CONTENT: Two-column layout with description on left */}
          <div className="grid grid-cols-12 gap-8">
            {/* LEFT COLUMN: Description Section */}
            <div className="col-span-5 space-y-6">
              {/* Role Expectations Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  <Label className={cn("text-base font-semibold", colors.text)}>
                    What's Expected
                  </Label>
                </div>

                <div
                  className={cn(
                    "p-4 rounded-xl border min-h-[120px]",
                    colors.border,
                    "bg-white/50 dark:bg-gray-800/30",
                  )}
                >
                  {role.description ? (
                    <>
                      <Textarea
                        value={role.description}
                        onChange={(e) =>
                          updateRole(role.role, { description: e.target.value })
                        }
                        placeholder="Describe specific expectations, responsibilities, and requirements for this role..."
                        rows={4}
                        className={cn(
                          "resize-none text-sm border-0 bg-transparent p-0 focus-visible:ring-0",
                          colors.text,
                          "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                        )}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {role.description.length}/500 characters
                        </span>
                        <button
                          onClick={() =>
                            setShowFullDescription(!showFullDescription)
                          }
                          className="text-xs text-blue-500 hover:text-blue-600"
                        >
                          {showFullDescription ? "Show less" : "Show more"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <Edit3 className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
                      <p className={cn("text-sm mb-3", colors.textMuted)}>
                        Describe what you expect from this role
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateRole(role.role, {
                            description: "Describe expectations here...",
                          })
                        }
                        className="gap-2"
                      >
                        <Edit3 className="w-4 h-4" />
                        Add Description
                      </Button>
                    </div>
                  )}
                </div>

                {/* Description Tips */}
                {!role.description && (
                  <div
                    className={cn(
                      "p-3 rounded-lg text-xs",
                      "bg-blue-50/50 dark:bg-blue-900/10",
                      "border border-blue-100 dark:border-blue-800",
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">
                          Tips for a good description:
                        </p>
                        <ul className="space-y-1 text-blue-600 dark:text-blue-400">
                          <li>• Specific responsibilities and duties</li>
                          <li>• Required experience level</li>
                          <li>• Musical style preferences</li>
                          <li>• Practice schedule expectations</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Skills Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label
                    className={cn(
                      "text-base font-semibold flex items-center gap-2",
                      colors.text,
                    )}
                  >
                    <Star className="w-5 h-5 text-amber-500" />
                    Required Skills ({role.requiredSkills.length})
                  </Label>
                  {role.requiredSkills.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {role.requiredSkills.length} selected
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 min-h-[60px]">
                  {role.requiredSkills.length > 0 ? (
                    <>
                      {role.requiredSkills.slice(0, 6).map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className={cn(
                            "text-sm px-3 py-1.5 cursor-pointer transition-all hover:scale-105",
                            "border-blue-200 text-blue-700 dark:border-blue-700 dark:text-blue-300",
                            "hover:bg-blue-50 dark:hover:bg-blue-900/30",
                          )}
                          onClick={() => toggleSkill(role.role, skill)}
                        >
                          {skill}
                          <X className="w-3 h-3 ml-1.5 opacity-50 hover:opacity-100" />
                        </Badge>
                      ))}
                      {role.requiredSkills.length > 6 && (
                        <Badge
                          variant="secondary"
                          className="text-sm px-3 py-1.5"
                        >
                          +{role.requiredSkills.length - 6} more
                        </Badge>
                      )}
                    </>
                  ) : (
                    <div className="w-full text-center py-4">
                      <p className={cn("text-sm", colors.textMuted)}>
                        No skills added yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Configuration Controls */}
            <div className="col-span-7">
              <div className="grid grid-cols-12 gap-6">
                {/* Positions Section */}
                <div className="col-span-6">
                  <div
                    className={cn(
                      "p-5 rounded-xl border",
                      colors.border,
                      "bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-orange-900/10 dark:to-red-900/10",
                    )}
                  >
                    <Label
                      className={cn(
                        "text-base font-semibold mb-4 block flex items-center gap-2",
                        colors.text,
                      )}
                    >
                      <Users className="w-5 h-5 text-orange-500" />
                      Positions Needed
                    </Label>

                    <div className="flex items-center justify-between mb-4">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-orange-600">
                          {role.maxSlots}
                        </div>
                        <div className={cn("text-sm mt-1", colors.textMuted)}>
                          position{role.maxSlots > 1 ? "s" : ""}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateRole(role.role, {
                              maxSlots: Math.max(1, role.maxSlots - 1),
                            })
                          }
                          className={cn(
                            "h-10 w-10 rounded-lg",
                            colors.border,
                            colors.hoverBg,
                          )}
                          disabled={role.maxSlots <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateRole(role.role, {
                              maxSlots: role.maxSlots + 1,
                            })
                          }
                          className={cn(
                            "h-10 w-10 rounded-lg",
                            colors.border,
                            colors.hoverBg,
                          )}
                          disabled={role.maxSlots >= 10}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <Button
                          key={num}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateRole(role.role, { maxSlots: num })
                          }
                          className={cn(
                            "flex-1",
                            role.maxSlots === num &&
                              "bg-gradient-to-r from-orange-500 to-red-500 text-white border-transparent",
                          )}
                        >
                          {num}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Max Applicants Section */}
                <div className="col-span-6">
                  <div
                    className={cn(
                      "p-5 rounded-xl border",
                      colors.border,
                      "bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-900/10 dark:to-cyan-900/10",
                    )}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Label
                        className={cn(
                          "text-base font-semibold flex items-center gap-2",
                          colors.text,
                        )}
                      >
                        <UserPlus className="w-5 h-5 text-blue-500" />
                        Max Applicants
                      </Label>
                      <div
                        className={cn("text-sm font-medium", {
                          "text-red-500": maxApplicants < role.maxSlots * 3,
                          "text-yellow-500":
                            maxApplicants >= role.maxSlots * 3 &&
                            maxApplicants < role.maxSlots * 5,
                          "text-green-500": maxApplicants >= role.maxSlots * 5,
                        })}
                      >
                        {maxApplicants < role.maxSlots * 3
                          ? "Low"
                          : maxApplicants < role.maxSlots * 5
                            ? "Good"
                            : "High"}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-center flex-1">
                          <div className="text-5xl font-bold text-blue-600">
                            {maxApplicants}
                          </div>
                          <div className={cn("text-sm mt-1", colors.textMuted)}>
                            applications
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateRole(role.role, {
                                maxApplicants: Math.max(5, maxApplicants - 5),
                              })
                            }
                            className={cn(
                              "h-10 w-10 rounded-lg",
                              colors.border,
                              colors.hoverBg,
                            )}
                            disabled={maxApplicants <= 5}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateRole(role.role, {
                                maxApplicants: maxApplicants + 5,
                              })
                            }
                            className={cn(
                              "h-10 w-10 rounded-lg",
                              colors.border,
                              colors.hoverBg,
                            )}
                            disabled={maxApplicants >= 200}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Slider */}
                      <div className="pt-4">
                        <Slider
                          value={[maxApplicants]}
                          min={5}
                          max={200}
                          step={5}
                          onValueChange={([value]) =>
                            updateRole(role.role, { maxApplicants: value })
                          }
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>Few (5)</span>
                          <span>Standard (20)</span>
                          <span>Many (50+)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compensation Section */}
                <div className="col-span-8">
                  <div
                    className={cn(
                      "p-5 rounded-xl border",
                      colors.border,
                      "bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/10 dark:to-emerald-900/10",
                    )}
                  >
                    <Label
                      className={cn(
                        "text-base font-semibold mb-4 block flex items-center gap-2",
                        colors.text,
                      )}
                    >
                      <DollarSign className="w-5 h-5 text-green-500" />
                      Compensation
                    </Label>

                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-3">
                        <Select
                          value={role.currency || "KES"}
                          onValueChange={(value) =>
                            updateRole(role.role, { currency: value })
                          }
                        >
                          <SelectTrigger className={cn("h-12", colors.border)}>
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
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            type="number"
                            placeholder="Amount per position"
                            value={role.price || ""}
                            onChange={(e) =>
                              updateRole(role.role, { price: e.target.value })
                            }
                            min="0"
                            step="100"
                            className={cn(
                              "h-12 pl-10",
                              colors.border,
                              colors.background,
                            )}
                          />
                        </div>
                      </div>
                      <div className="col-span-3">
                        <div
                          className={cn(
                            "flex items-center h-12 px-4 rounded-lg border justify-center",
                            colors.border,
                            "bg-white/50 dark:bg-gray-800/50",
                          )}
                        >
                          <Switch
                            checked={role.negotiable ?? true}
                            onCheckedChange={(checked) =>
                              updateRole(role.role, { negotiable: checked })
                            }
                            className="mr-3"
                          />
                          <span
                            className={cn(
                              "text-sm font-medium whitespace-nowrap",
                              colors.text,
                            )}
                          >
                            {role.negotiable ? "Negotiable" : "Fixed"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Price Calculation */}
                    {price && price > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <span className={cn("text-sm", colors.text)}>
                            Total for {role.maxSlots} position
                            {role.maxSlots > 1 ? "s" : ""}:
                          </span>
                          <span className="text-lg font-bold text-green-600">
                            {role.currency || "KES"}{" "}
                            {(price * role.maxSlots).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills Quick Add */}
                <div className="col-span-4">
                  <div
                    className={cn(
                      "p-5 rounded-xl border h-full",
                      colors.border,
                      "bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10",
                    )}
                  >
                    <Label
                      className={cn(
                        "text-base font-semibold mb-4 block flex items-center gap-2",
                        colors.text,
                      )}
                    >
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      Quick Skills
                    </Label>

                    <div className="space-y-3">
                      <Input
                        placeholder="Add skill..."
                        className={cn(
                          "h-12 text-sm",
                          colors.border,
                          colors.background,
                        )}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            e.currentTarget.value.trim()
                          ) {
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

                      <div className="grid grid-cols-2 gap-2">
                        {["Jazz", "Rock", "Pop", "Classical"].map((skill) => (
                          <Button
                            key={skill}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (!role.requiredSkills.includes(skill)) {
                                updateRole(role.role, {
                                  requiredSkills: [
                                    ...role.requiredSkills,
                                    skill,
                                  ],
                                });
                              }
                            }}
                            className={cn(
                              "text-xs h-8",
                              role.requiredSkills.includes(skill) &&
                                "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent",
                            )}
                          >
                            {skill}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Applicant Progress */}
              {role.currentApplicants && role.currentApplicants > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Label className={cn("text-sm font-medium", colors.text)}>
                      Application Progress
                    </Label>
                    <span className="text-sm font-medium text-blue-600">
                      {role.currentApplicants}/{maxApplicants}
                    </span>
                  </div>
                  <Progress
                    value={(role.currentApplicants / maxApplicants) * 100}
                    className="h-2"
                    indicatorClassName={cn(
                      role.currentApplicants < maxApplicants * 0.3
                        ? "bg-gradient-to-r from-green-500 to-emerald-500"
                        : role.currentApplicants < maxApplicants * 0.7
                          ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                          : "bg-gradient-to-r from-orange-500 to-amber-500",
                    )}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={role.isLocked || false}
                  onCheckedChange={(checked) =>
                    updateRole(role.role, { isLocked: checked })
                  }
                />
                <span className={cn("text-sm", colors.text)}>
                  Lock this role
                </span>
              </div>
              {role.isLocked && (
                <Badge variant="outline" className="text-xs">
                  <Lock className="w-3 h-3 mr-1" />
                  Locked
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Reset to defaults
                  updateRole(role.role, {
                    maxSlots: 1,
                    maxApplicants: 20,
                    price: "",
                    negotiable: true,
                  });
                }}
                className="text-xs"
              >
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  // Copy role configuration
                  const newRole = { ...role, role: `${role.role} (Copy)` };
                  setSelectedRoles((prev) => [...prev, newRole]);
                }}
              >
                Duplicate
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };
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
            "text-2xl font-bold mb-3",
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
              "flex items-start gap-3 p-4 rounded-xl ",
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
          "max-w-7xl h-[90vh] p-0 overflow-hidden",
          colors.background,
        )}
      >
        <div className="flex h-full">
          {/* Left Panel - Role Selection (unchanged) */}
          <div
            className={cn(
              "w-1/3 border-r flex flex-col",
              colors.border,
              isDarkMode ? "bg-gray-900" : "bg-gray-50",
            )}
          >
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <DialogTitle
                    className={cn("text-2xl font-bold", colors.text)}
                  >
                    Select Roles
                  </DialogTitle>
                  <p className={cn("text-sm", colors.textMuted)}>
                    Choose the band members you need
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className={cn(
                    "rounded-full",
                    colors.hoverBg,
                    colors.textMuted,
                  )}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search roles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn("pl-10", colors.background)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setViewMode(viewMode === "grid" ? "list" : "grid")
                  }
                  className={cn(colors.border, colors.hoverBg)}
                >
                  {viewMode === "grid" ? (
                    <List className="w-4 h-4" />
                  ) : (
                    <Grid className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {roleCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-full whitespace-nowrap transition-all shrink-0",
                        selectedCategory === category.value
                          ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                          : cn(colors.border, colors.textSecondary),
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{category.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <ScrollArea className="flex-1 p-6 overflow-auto h-full">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 gap-3">
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
                          "relative p-4 rounded-xl border flex flex-col items-center gap-3 transition-all",
                          colors.border,
                          isSelected
                            ? "bg-gradient-to-br from-orange-500/10 to-red-500/10 ring-2 ring-orange-500/50"
                            : cn("hover:shadow-lg", colors.hoverBg),
                        )}
                      >
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "p-3 rounded-lg",
                            isSelected
                              ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                              : cn(colors.backgroundMuted, colors.primary),
                          )}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                          <span
                            className={cn(
                              "text-sm font-medium block",
                              colors.text,
                            )}
                          >
                            {role.value}
                          </span>
                          <div className="flex items-center justify-center gap-1 mt-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs text-gray-500">
                              {role.popularity}%
                            </span>
                          </div>
                        </div>
                      </button>
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
                          "w-full p-3 rounded-lg border flex items-center gap-3 transition-all",
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
                          <span
                            className={cn("text-sm font-medium", colors.text)}
                          >
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
              <div className="mt-8">
                <div className={cn("rounded-xl border p-4", colors.border)}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className={cn("font-semibold", colors.text)}>
                        Add Custom Role
                      </h3>
                      <p className={cn("text-sm", colors.textMuted)}>
                        Can't find what you're looking for?
                      </p>
                    </div>
                    <Plus className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      placeholder="e.g., Harpist, Beatboxer..."
                      className={cn(colors.background)}
                    />
                    <Button
                      onClick={addCustomRole}
                      disabled={!customRole.trim()}
                      className="bg-gradient-to-r from-orange-500 to-red-500"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className={cn("p-6 border-t", colors.border)}>
              <Button
                onClick={() => setActiveTab("configure")}
                disabled={selectedRoles.length === 0}
                className="w-full gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500"
              >
                <ChevronRight className="w-5 h-5" />
                Configure {selectedRoles.length} Role
                {selectedRoles.length !== 1 ? "s" : ""}
              </Button>
            </div>
          </div>
          {/* Right Panel - Configuration */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className={cn("p-6 border-b flex-shrink-0", colors.border)}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className={cn("text-2xl font-bold", colors.text)}>
                    Configure Roles
                  </h2>
                  <p className={cn("text-sm", colors.textMuted)}>
                    Set requirements and compensation for each role
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("select")}
                    className={cn("gap-2", colors.hoverBg)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Selection
                  </Button>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-500">
                      Total Applications
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {totalMaxApplicants}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className={cn("p-3 rounded-lg", colors.backgroundMuted)}>
                  <div className="text-sm text-gray-500">Roles</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {selectedRoles.length}
                  </div>
                </div>
                <div className={cn("p-3 rounded-lg", colors.backgroundMuted)}>
                  <div className="text-sm text-gray-500">Positions</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {totalPositions}
                  </div>
                </div>
                <div className={cn("p-3 rounded-lg", colors.backgroundMuted)}>
                  <div className="text-sm text-gray-500">Max Apps</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {totalMaxApplicants}
                  </div>
                </div>
                <div className={cn("p-3 rounded-lg", colors.backgroundMuted)}>
                  <div className="text-sm text-gray-500">Budget</div>
                  <div className="text-2xl font-bold text-green-600">
                    {selectedRoles[0]?.currency || "KES"}{" "}
                    {totalBudget.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Vertical Scrollable Role Cards */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-6">
                {selectedRoles.length === 0 ? (
                  <EmptyState />
                ) : (
                  // VERTICAL STACK of slim cards
                  <div className="space-y-6 max-w-4xl mx-auto">
                    {selectedRoles.map((role) => (
                      <SlimRoleCard key={role.role} role={role} />
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer Actions */}
            {selectedRoles.length > 0 && (
              <div className={cn("p-6 border-t flex-shrink-0", colors.border)}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">
                      Ready to create {totalPositions} position
                      {totalPositions !== 1 ? "s" : ""} across{" "}
                      {selectedRoles.length} role
                      {selectedRoles.length !== 1 ? "s" : ""}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-orange-500" />
                        <span className="font-medium">
                          {totalPositions} positions
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">
                          {totalMaxApplicants} max applications
                        </span>
                      </div>
                      {totalBudget > 0 && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <span className="font-medium">
                            {selectedRoles[0]?.currency || "KES"}{" "}
                            {totalBudget.toLocaleString()} total
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="px-6"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      className="px-8 gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-lg"
                    >
                      <Sparkles className="w-5 h-5" />
                      Create Band Setup
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
