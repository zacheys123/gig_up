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

interface DesktopBandSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roles: BandRoleInput[]) => void;
  initialRoles?: BandRoleInput[]; // Accept BandRoleInput[]
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
      description: role.description || "", // Convert empty/undefined to ""
      price: role.price?.toString() || "", // Convert number to string
      currency: role.currency || "KES",
      negotiable: role.negotiable ?? true,
      isLocked: role.isLocked || false,
      filledSlots: role.filledSlots || 0,
      bookedPrice: role.bookedPrice,
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
      <Card className={cn("overflow-hidden", colors.border)}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
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
                      className="text-xs bg-blue-100 text-blue-700"
                    >
                      {maxApplicants} max apps
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeRole(role.role)}
              className="text-gray-400 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Positions */}
            <div>
              <Label
                className={cn("text-sm font-medium mb-3 block", colors.text)}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Positions Needed
                </div>
              </Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    updateRole(role.role, {
                      maxSlots: Math.max(1, role.maxSlots - 1),
                    })
                  }
                  className={cn("rounded-lg", colors.border)}
                  disabled={role.maxSlots <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <div className="flex-1 text-center">
                  <div className="text-4xl font-bold text-orange-600">
                    {role.maxSlots}
                  </div>
                  <div className={cn("text-xs", colors.textMuted)}>
                    Position{role.maxSlots > 1 ? "s" : ""}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    updateRole(role.role, { maxSlots: role.maxSlots + 1 })
                  }
                  className={cn("rounded-lg", colors.border)}
                  disabled={role.maxSlots >= 10}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Max Applicants */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label
                  className={cn(
                    "text-sm font-medium flex items-center gap-2",
                    colors.text,
                  )}
                >
                  <UserPlus className="w-4 h-4" />
                  Max Applicants
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3 h-3 text-blue-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">
                          Maximum number of applications to review for this
                          role. Higher numbers give you more options but require
                          more time to review.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <div className="text-xs text-gray-500">
                  {maxApplicants < role.maxSlots ? (
                    <span className="text-red-500">Too low</span>
                  ) : maxApplicants < role.maxSlots * 5 ? (
                    <span className="text-yellow-500">Balanced</span>
                  ) : (
                    <span className="text-green-500">Good range</span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      updateRole(role.role, {
                        maxApplicants: Math.max(
                          1,
                          (role.maxApplicants || 20) - 1,
                        ),
                      })
                    }
                    className={cn("rounded-lg", colors.border)}
                    disabled={(role.maxApplicants || 20) <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <div className="flex-1 text-center">
                    <div className="text-4xl font-bold text-blue-600">
                      {maxApplicants}
                    </div>
                    <div className={cn("text-xs", colors.textMuted)}>
                      Applications
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      updateRole(role.role, {
                        maxApplicants: (role.maxApplicants || 20) + 1,
                      })
                    }
                    className={cn("rounded-lg", colors.border)}
                    disabled={(role.maxApplicants || 20) >= 200}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-2">
                  {maxApplicantsPresets.slice(0, 6).map((num) => (
                    <Button
                      key={num}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateRole(role.role, { maxApplicants: num })
                      }
                      className={cn(
                        "text-xs px-3 py-1",
                        maxApplicants === num
                          ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                          : "",
                      )}
                    >
                      {num}
                    </Button>
                  ))}
                </div>

                {/* Slider for fine control */}
                <div className="pt-2">
                  <Slider
                    value={[maxApplicants]}
                    min={1}
                    max={200}
                    step={1}
                    onValueChange={([value]) =>
                      updateRole(role.role, { maxApplicants: value })
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>50</span>
                    <span>100</span>
                    <span>150</span>
                    <span>200</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Validation */}
          {maxApplicants < role.maxSlots && (
            <div
              className={cn(
                "p-3 rounded-lg mb-4 flex items-center gap-2",
                isDarkMode
                  ? "bg-red-900/20 border-red-800/30"
                  : "bg-red-50 border-red-200",
              )}
            >
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">
                <strong>Recommendation:</strong> Max applicants ({maxApplicants}
                ) should be at least
                {role.maxSlots * 3} for {role.maxSlots} position
                {role.maxSlots > 1 ? "s" : ""}
                to ensure quality selection.
              </p>
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <Label
              className={cn("text-sm font-medium mb-2 block", colors.text)}
            >
              Role Description (Optional)
            </Label>
            <Textarea
              placeholder="Describe responsibilities, style preferences, experience level..."
              value={role.description || ""}
              onChange={(e) =>
                updateRole(role.role, { description: e.target.value })
              }
              rows={2}
              className={cn(
                "resize-none",
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-200",
              )}
            />
          </div>

          {/* Pricing */}
          <div className="mb-6">
            <Label
              className={cn("text-sm font-medium mb-3 block", colors.text)}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Compensation
              </div>
            </Label>
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-3">
                <Select
                  value={role.currency || "KES"}
                  onValueChange={(value) =>
                    updateRole(role.role, { currency: value })
                  }
                >
                  <SelectTrigger className={cn(colors.border)}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className={isDarkMode ? "bg-gray-800" : "bg-white"}
                  >
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
                    isDarkMode
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-200",
                  )}
                />
              </div>
              <div className="col-span-3">
                <div
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg h-full",
                    isDarkMode ? "bg-gray-800/50" : "bg-gray-50",
                  )}
                >
                  <Switch
                    checked={role.negotiable ?? true}
                    onCheckedChange={(checked) =>
                      updateRole(role.role, { negotiable: checked })
                    }
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
              className={cn("text-sm font-medium mb-3 block", colors.text)}
            >
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Required Skills
              </div>
            </Label>
            <div className="flex flex-wrap gap-2 mb-3">
              {commonSkills.slice(0, 12).map((skill) => (
                <Badge
                  key={skill}
                  variant={
                    role.requiredSkills.includes(skill) ? "default" : "outline"
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
            <div className="flex items-center gap-2">
              <Input
                placeholder="Add custom skill..."
                className={cn(
                  "flex-1",
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-200",
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
              >
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[85vh] p-0 overflow-hidden">
        <div className="flex h-full">
          {/* Left Panel - Role Selection */}
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
                  className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
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
                    className={cn(
                      "pl-10",
                      isDarkMode
                        ? "bg-gray-800 border-gray-700 text-white"
                        : "bg-white",
                    )}
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setViewMode(viewMode === "grid" ? "list" : "grid")
                  }
                  className={cn(colors.border)}
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

            <ScrollArea className="flex-1 p-6">
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
                            : cn(
                                "hover:bg-gray-100 dark:hover:bg-gray-800",
                                colors.hoverBg,
                              ),
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
                      className={cn(
                        isDarkMode
                          ? "bg-gray-800 border-gray-700 text-white"
                          : "bg-white",
                      )}
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
          <div className="flex-1 flex flex-col">
            <div className={cn("p-6 border-b", colors.border)}>
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
                    className="gap-2"
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

            <ScrollArea className="flex-1 p-6">
              {selectedRoles.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-32 h-32 mb-6 rounded-full bg-gradient-to-r from-orange-500/10 to-red-500/10 flex items-center justify-center">
                    <Users className="w-16 h-16 text-orange-500" />
                  </div>
                  <h3 className={cn("text-xl font-semibold mb-2", colors.text)}>
                    No Roles Selected
                  </h3>
                  <p className={cn("text-gray-500 mb-6 max-w-md")}>
                    Select roles from the left panel to configure their
                    requirements, compensation, and application limits.
                  </p>
                  <Button
                    onClick={() => setActiveTab("select")}
                    className="gap-2 bg-gradient-to-r from-orange-500 to-red-500"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Select Roles
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  {selectedRoles.map((role) => (
                    <RoleConfigCard key={role.role} role={role} />
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Footer Actions */}
            {selectedRoles.length > 0 && (
              <div className={cn("p-6 border-t", colors.border)}>
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
