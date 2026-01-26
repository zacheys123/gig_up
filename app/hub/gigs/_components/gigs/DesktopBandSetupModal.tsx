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
  // Update the SlimRoleCard component definition
  const SlimRoleCard = ({
    role,
    onRoleUpdate,
  }: {
    role: BandSetupRole;
    onRoleUpdate: (role: BandSetupRole) => void;
  }) => {
    const maxApplicants = role.maxApplicants || 20;
    const roleInfo = commonRoles.find((r) => r.value === role.role);
    const Icon = roleInfo?.icon || Music;
    const [isExpanded, setIsExpanded] = useState(false);

    // Add this helper function to handle updates
    const handleUpdate = (updates: Partial<BandSetupRole>) => {
      onRoleUpdate({ ...role, ...updates });
    };

    return (
      <Card
        className={cn(
          "overflow-hidden transition-all hover:shadow-md",
          colors.border,
          isExpanded && "ring-2 ring-orange-500/30",
        )}
      >
        <CardContent className="p-4">
          {/* Top Row: Basic Info with Configure Button */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", colors.backgroundMuted)}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className={cn("font-bold", colors.text)}>{role.role}</h4>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {role.maxSlots} position{role.maxSlots > 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1">
                    <UserPlus className="w-3 h-3" />
                    {maxApplicants} max apps
                  </span>
                  {role.price && parseFloat(role.price) > 0 && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {role.currency} {parseFloat(role.price).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                  "h-8 px-3 gap-2",
                  isExpanded
                    ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                )}
              >
                {isExpanded ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    Configure
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeRole(role.role)}
                className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Collapsible Configuration Area */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-3 border-t space-y-3">
                  {/* Quick Adjustments - Row */}
                  <div className="grid grid-cols-3 gap-3">
                    {/* Positions */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-gray-500">
                        Positions
                      </Label>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleUpdate({
                              maxSlots: Math.max(1, role.maxSlots - 1),
                            })
                          }
                          className="h-8 w-8 p-0"
                          disabled={role.maxSlots <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <div className="flex-1 text-center">
                          <div className="text-lg font-bold text-orange-600">
                            {role.maxSlots}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleUpdate({ maxSlots: role.maxSlots + 1 })
                          }
                          className="h-8 w-8 p-0"
                          disabled={role.maxSlots >= 10}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Max Applicants */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-gray-500">
                        Max Apps
                      </Label>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleUpdate({
                              maxApplicants: Math.max(1, maxApplicants - 5),
                            })
                          }
                          className="h-8 w-8 p-0"
                          disabled={maxApplicants <= 5}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <div className="flex-1 text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {maxApplicants}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleUpdate({ maxApplicants: maxApplicants + 5 })
                          }
                          className="h-8 w-8 p-0"
                          disabled={maxApplicants >= 200}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-gray-500">
                        Price
                      </Label>
                      <div className="flex gap-1">
                        <Select
                          value={role.currency || "KES"}
                          onValueChange={(value) =>
                            handleUpdate({ currency: value })
                          }
                        >
                          <SelectTrigger className="h-8 w-12 text-xs p-0 px-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="KES" className="text-xs">
                              KES
                            </SelectItem>
                            <SelectItem value="USD" className="text-xs">
                              USD
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          placeholder="0"
                          value={role.price || ""}
                          onChange={(e) =>
                            handleUpdate({ price: e.target.value })
                          }
                          className="h-8 text-sm"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Skills Row */}
                  <div>
                    <Label className="text-xs font-medium text-gray-500 mb-1 block">
                      Skills
                    </Label>
                    <div className="flex flex-wrap gap-1">
                      {role.requiredSkills.slice(0, 3).map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="text-xs px-2 py-0 h-5 cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            const hasSkill =
                              role.requiredSkills.includes(skill);
                            handleUpdate({
                              requiredSkills: hasSkill
                                ? role.requiredSkills.filter((s) => s !== skill)
                                : [...role.requiredSkills, skill],
                            });
                          }}
                        >
                          {skill}
                        </Badge>
                      ))}
                      {role.requiredSkills.length > 3 && (
                        <Badge
                          variant="secondary"
                          className="text-xs px-2 py-0 h-5"
                        >
                          +{role.requiredSkills.length - 3}
                        </Badge>
                      )}
                      <Input
                        placeholder="Add skill"
                        className="h-6 text-xs w-24"
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            e.currentTarget.value.trim()
                          ) {
                            const skill = e.currentTarget.value.trim();
                            if (!role.requiredSkills.includes(skill)) {
                              handleUpdate({
                                requiredSkills: [...role.requiredSkills, skill],
                              });
                            }
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Description & Negotiable */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-medium text-gray-500 mb-1 block">
                        Description
                      </Label>
                      <Input
                        placeholder="Brief description..."
                        value={role.description || ""}
                        onChange={(e) =>
                          handleUpdate({ description: e.target.value })
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="flex items-center justify-end">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={role.negotiable ?? true}
                          onCheckedChange={(checked) =>
                            handleUpdate({ negotiable: checked })
                          }
                          className="h-4 w-8"
                        />
                        <Label className="text-xs text-gray-500">
                          Negotiable
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Warning if max applicants too low */}
                  {maxApplicants < role.maxSlots && (
                    <div className="flex items-center gap-2 text-xs text-red-500">
                      <AlertCircle className="w-3 h-3" />
                      Max applicants should be at least {role.maxSlots * 3}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
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
          "max-w-7xl p-0 overflow-hidden",
          colors.background,
          "h-[85vh]",
        )}
      >
        <div className="flex h-full relative">
          {/* Left Panel - Role Selection with Absolute Positioning */}
          <div
            className={cn(
              "w-1/3 border-r flex flex-col relative",
              colors.border,
              isDarkMode ? "bg-gray-900" : "bg-gray-50",
            )}
          >
            {/* Fixed Header - Absolute positioned */}
            <div
              className={cn(
                "absolute top-0 left-0 right-0 p-6 border-b z-10",
                colors.border,
                isDarkMode ? "bg-gray-900" : "bg-gray-50",
              )}
            >
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

              <div className="flex gap-2 overflow-x-auto pb-1">
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

            {/* Fixed Footer - Absolute positioned */}
            <div
              className={cn(
                "absolute bottom-0 left-0 right-0 p-6 border-t z-10",
                colors.border,
                isDarkMode ? "bg-gray-900" : "bg-gray-50",
              )}
            >
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

            {/* SCROLLABLE CONTENT AREA - Takes remaining space */}
            <div className="absolute top-[calc(200px)] bottom-[88px] left-0 right-0 overflow-y-auto">
              <div className="p-6">
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

                {/* Extra padding at bottom for better scrolling */}
                <div className="h-6"></div>
              </div>
            </div>
          </div>

          {/* Right Panel - Configuration with Absolute Positioning */}
          <div className="w-2/3 flex flex-col relative">
            {/* Fixed Header - Absolute positioned */}
            <div
              className={cn(
                "absolute top-0 left-0 right-0 p-6 border-b z-10",
                colors.border,
                colors.background,
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className={cn("text-2xl font-bold", colors.text)}>
                    Configure Roles
                  </h2>
                  <p className={cn("text-sm", colors.textMuted)}>
                    Set requirements for each selected role
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("select")}
                    className="gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Selection
                  </Button>
                </div>
              </div>

              {/* Quick Stats Bar */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Music className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Roles</div>
                    <div className="font-bold text-orange-600">
                      {selectedRoles.length}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Positions</div>
                    <div className="font-bold text-blue-600">
                      {totalPositions}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <UserPlus className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Max Apps</div>
                    <div className="font-bold text-purple-600">
                      {totalMaxApplicants}
                    </div>
                  </div>
                </div>

                {totalBudget > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Total Budget</div>
                      <div className="font-bold text-green-600">
                        {selectedRoles[0]?.currency || "KES"}{" "}
                        {totalBudget.toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Fixed Footer - Absolute positioned */}
            {selectedRoles.length > 0 && (
              <div
                className={cn(
                  "absolute bottom-0 left-0 right-0 p-6 border-t z-10",
                  colors.border,
                  colors.background,
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {selectedRoles.length} role
                    {selectedRoles.length !== 1 ? "s" : ""} • {totalPositions}{" "}
                    position{totalPositions !== 1 ? "s" : ""} •{" "}
                    {totalMaxApplicants} max applications
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
                      className="px-8 gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    >
                      <Sparkles className="w-5 h-5" />
                      Create Setup
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* SCROLLABLE CONTENT AREA - Fixed to preserve state */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="p-6">
                {selectedRoles.length === 0 ? (
                  <EmptyState />
                ) : (
                  // In your return statement, update the SlimRoleCard rendering:
                  <div className="space-y-4 max-w-4xl mx-auto">
                    {selectedRoles.map((role) => (
                      <SlimRoleCard
                        key={`${role.role}-${role.maxSlots}-${role.maxApplicants}`}
                        role={role}
                        onRoleUpdate={(updatedRole) => {
                          setSelectedRoles((prev) =>
                            prev.map((r) =>
                              r.role === updatedRole.role ? updatedRole : r,
                            ),
                          );
                        }}
                      />
                    ))}
                    {/* Add extra space at bottom for better scrolling */}
                    <div className="h-10"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DesktopBandSetupModal;
