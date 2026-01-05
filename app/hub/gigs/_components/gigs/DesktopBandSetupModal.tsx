// app/gigs/_components/BandSetupModal.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
  Filter,
  Settings,
  Target,
  Sparkles,
  ArrowRight,
  Check,
  DollarSign,
  Calendar,
  Clock,
  Layers,
  UserPlus,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BandRoleInput } from "@/types/gig";
import { useThemeColors } from "@/hooks/useTheme";
import { IconBase } from "react-icons";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface BandRole {
  role: string;
  maxSlots: number;
  requiredSkills: string[];
  description?: string;
  price?: string;
  currency?: string;
  negotiable?: boolean;
}

interface BandSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roles: BandRoleInput[]) => void;
  initialRoles?: BandRole[];
}

const commonRoles = [
  { value: "Lead Vocalist", icon: Mic, color: "red", category: "vocal" },
  { value: "Guitarist", icon: Guitar, color: "blue", category: "strings" },
  { value: "Bassist", icon: Music, color: "green", category: "strings" },
  { value: "Drummer", icon: Drum, color: "amber", category: "percussion" },
  {
    value: "Pianist/Keyboardist",
    icon: Piano,
    color: "purple",
    category: "keys",
  },
  { value: "Saxophonist", icon: Music, color: "pink", category: "brass" },
  { value: "Trumpeter", icon: Music, color: "cyan", category: "brass" },
  { value: "Violinist", icon: Music, color: "indigo", category: "strings" },
  { value: "Backup Vocalist", icon: Mic, color: "rose", category: "vocal" },
  {
    value: "Percussionist",
    icon: Drum,
    color: "orange",
    category: "percussion",
  },
  { value: "DJ", icon: Volume2, color: "violet", category: "electronic" },
  { value: "MC/Host", icon: Mic, color: "teal", category: "vocal" },
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

const DesktopBandSetupModal: React.FC<BandSetupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialRoles = [],
}) => {
  const { colors } = useThemeColors();
  const [selectedRoles, setSelectedRoles] = useState<BandRole[]>(initialRoles);
  const [customRole, setCustomRole] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<"roles" | "skills" | "budget">(
    "roles"
  );

  // Calculate totals
  const totalPositions = selectedRoles.reduce(
    (sum, role) => sum + role.maxSlots,
    0
  );
  const totalBudget = selectedRoles.reduce((total, role) => {
    const price = parseFloat(role.price || "0");
    return total + price * role.maxSlots;
  }, 0);

  // Filter roles based on search and category
  const filteredRoles = commonRoles.filter((role) => {
    const matchesSearch = role.value
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || role.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleRole = (roleName: string) => {
    setSelectedRoles((prev) => {
      const existing = prev.find((r) => r.role === roleName);
      if (existing) {
        return prev.filter((r) => r.role !== roleName);
      } else {
        const roleInfo = commonRoles.find((r) => r.value === roleName);
        return [
          ...prev,
          {
            role: roleName,
            maxSlots: 1,
            requiredSkills: [],
            description: "",
            currency: "KES",
            negotiable: true,
          },
        ];
      }
    });
  };

  const updateRole = (roleName: string, updates: Partial<BandRole>) => {
    setSelectedRoles((prev) =>
      prev.map((role) =>
        role.role === roleName ? { ...role, ...updates } : role
      )
    );
  };

  const addCustomRole = () => {
    if (customRole.trim()) {
      setSelectedRoles((prev) => [
        ...prev,
        {
          role: customRole.trim(),
          maxSlots: 1,
          requiredSkills: [],
          description: "",
          currency: "KES",
          negotiable: true,
        },
      ]);
      setCustomRole("");
      setShowCustomForm(false);
    }
  };

  const removeRole = (roleName: string) => {
    setSelectedRoles((prev) => prev.filter((r) => r.role !== roleName));
  };

  const toggleSkill = (roleName: string, skill: string) => {
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
      })
    );
  };

  const handleSubmit = () => {
    if (selectedRoles.length > 0) {
      onSubmit(selectedRoles);
      onClose();
    }
  };

  const getProgressPercentage = () => {
    // Calculate progress based on roles selected and configured
    const baseProgress = Math.min(selectedRoles.length * 15, 60);
    const configuredProgress =
      selectedRoles.filter(
        (role) => role.maxSlots > 0 && role.requiredSkills.length > 0
      ).length * 5;
    return Math.min(baseProgress + configuredProgress, 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="hidden md:flex max-w-[80%] mx-auto max-h-[90vh] overflow-hidden p-0 border-0 shadow-lg shadow-neutral-600">
        <div className="flex h-[90vh]">
          {/* Left Panel - Role Selection */}
          <div className="w-2/5 flex flex-col">
            <DialogHeader className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle
                    className={cn("text-2xl font-bold", colors.text)}
                  >
                    Band Setup Studio
                  </DialogTitle>
                  <DialogDescription className={cn("mt-1", colors.textMuted)}>
                    Build your dream band. Select roles and customize
                    requirements.
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn("gap-1", colors.borderSecondary)}
                  >
                    <Sparkles className="w-3 h-3" />
                    Pro Setup
                  </Badge>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className={cn("text-sm font-medium", colors.text)}>
                    Setup Progress
                  </span>
                  <span className={cn("text-sm font-bold", colors.primary)}>
                    {getProgressPercentage()}%
                  </span>
                </div>
                <Progress value={getProgressPercentage()} className="h-2" />
              </div>

              {/* Search and Filter */}
              <div className="mt-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search roles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">
                  {roleCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.value}
                        onClick={() => setSelectedCategory(category.value)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all",
                          selectedCategory === category.value
                            ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                            : cn(colors.hoverBg, colors.border)
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{category.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-3">
                {filteredRoles.map((role) => {
                  const isSelected = selectedRoles.some(
                    (r) => r.role === role.value
                  );
                  const Icon = role.icon;

                  return (
                    <motion.button
                      key={role.value}
                      type="button"
                      onClick={() => toggleRole(role.value)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "relative p-4 rounded-xl border flex flex-col items-center gap-3 transition-all group",
                        colors.border,
                        isSelected
                          ? "bg-gradient-to-br from-orange-500/10 to-red-500/10 ring-2 ring-orange-500/50"
                          : cn("hover:shadow-lg", colors.hoverBg)
                      )}
                    >
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "p-3 rounded-lg transition-transform group-hover:scale-110",
                          isSelected
                            ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                            : cn(colors.backgroundMuted, colors.primary)
                        )}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span
                        className={cn(
                          "text-sm font-medium text-center leading-tight",
                          colors.text
                        )}
                      >
                        {role.value}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs mt-1",
                          colors.borderSecondary,
                          colors.textSecondary
                        )}
                      >
                        {role.category}
                      </Badge>
                    </motion.button>
                  );
                })}
              </div>

              {/* Custom Role Section */}
              <div className="mt-8">
                <div
                  className={cn(
                    "p-4 rounded-xl border",
                    colors.border,
                    showCustomForm
                      ? "bg-gradient-to-br from-blue-500/5 to-purple-500/5"
                      : colors.backgroundMuted
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className={cn("font-semibold", colors.text)}>
                        Custom Role
                      </h3>
                      <p className={cn("text-sm", colors.textMuted)}>
                        Need a unique role? Add it here.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCustomForm(!showCustomForm)}
                      className={cn(
                        "gap-2",
                        colors.border,
                        showCustomForm &&
                          "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      )}
                    >
                      {showCustomForm ? (
                        <>
                          <X className="w-4 h-4" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Add Custom
                        </>
                      )}
                    </Button>
                  </div>

                  <AnimatePresence>
                    {showCustomForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-3 pt-3">
                          <Input
                            value={customRole}
                            onChange={(e) => setCustomRole(e.target.value)}
                            placeholder="e.g., 'Harpist', 'Beatboxer', 'Turntablist'"
                            className="w-full"
                          />
                          <Button
                            onClick={addCustomRole}
                            disabled={!customRole.trim()}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Custom Role
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Role Configuration */}
          <div className="w-3/5 flex flex-col">
            <DialogHeader className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className={cn("text-xl font-bold", colors.text)}>
                    Role Configuration
                  </DialogTitle>
                  <DialogDescription className={cn("mt-1", colors.textMuted)}>
                    Customize each role's requirements, skills, and pricing
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Users className="w-3 h-3" />
                    {selectedRoles.length} Roles
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <UserPlus className="w-3 h-3" />
                    {totalPositions} Positions
                  </Badge>
                </div>
              </div>

              {/* Configuration Tabs */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setActiveTab("roles")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    activeTab === "roles"
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                      : cn(colors.hoverBg, colors.text)
                  )}
                >
                  <Settings className="w-4 h-4 inline mr-2" />
                  Roles
                </button>
                <button
                  onClick={() => setActiveTab("skills")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    activeTab === "skills"
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                      : cn(colors.hoverBg, colors.text)
                  )}
                >
                  <Target className="w-4 h-4 inline mr-2" />
                  Skills
                </button>
                <button
                  onClick={() => setActiveTab("budget")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    activeTab === "budget"
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                      : cn(colors.hoverBg, colors.text)
                  )}
                >
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Budget
                </button>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {activeTab === "roles" && (
                  <motion.div
                    key="roles"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    {selectedRoles.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-orange-500/10 to-red-500/10 flex items-center justify-center">
                          <Users className="w-8 h-8 text-orange-500" />
                        </div>
                        <h3
                          className={cn(
                            "text-lg font-semibold mb-2",
                            colors.text
                          )}
                        >
                          No Roles Selected
                        </h3>
                        <p className={cn("text-sm", colors.textMuted)}>
                          Select roles from the left panel to start configuring
                          your band.
                        </p>
                      </div>
                    ) : (
                      selectedRoles.map((role) => (
                        <div
                          key={role.role}
                          className={cn(
                            "rounded-xl border p-5",
                            colors.border,
                            "bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
                          )}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10">
                                <Music className="w-5 h-5 text-orange-500" />
                              </div>
                              <div>
                                <h4
                                  className={cn(
                                    "font-bold text-lg",
                                    colors.text
                                  )}
                                >
                                  {role.role}
                                </h4>
                                <p className={cn("text-sm", colors.textMuted)}>
                                  Configure requirements and pricing
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeRole(role.role)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column - Basic Info */}
                            <div className="space-y-4">
                              <div>
                                <Label
                                  className={cn(
                                    "text-sm font-medium mb-2 block",
                                    colors.text
                                  )}
                                >
                                  Positions Needed
                                </Label>
                                <div className="flex items-center gap-3">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      updateRole(role.role, {
                                        maxSlots: Math.max(
                                          1,
                                          role.maxSlots - 1
                                        ),
                                      })
                                    }
                                    className="p-2"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  <div className="flex-1 text-center">
                                    <div className="text-3xl font-bold text-orange-600">
                                      {role.maxSlots}
                                    </div>
                                    <div
                                      className={cn(
                                        "text-xs",
                                        colors.textMuted
                                      )}
                                    >
                                      {role.maxSlots === 1
                                        ? "position"
                                        : "positions"}
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      updateRole(role.role, {
                                        maxSlots: role.maxSlots + 1,
                                      })
                                    }
                                    className="p-2"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>

                              <div>
                                <Label
                                  className={cn(
                                    "text-sm font-medium mb-2 block",
                                    colors.text
                                  )}
                                >
                                  Role Description
                                </Label>
                                <Textarea
                                  placeholder="Describe responsibilities, requirements, or special notes..."
                                  value={role.description || ""}
                                  onChange={(e) =>
                                    updateRole(role.role, {
                                      description: e.target.value,
                                    })
                                  }
                                  rows={3}
                                  className="resize-none"
                                />
                              </div>
                            </div>

                            {/* Right Column - Pricing */}
                            <div className="space-y-4">
                              <div>
                                <Label
                                  className={cn(
                                    "text-sm font-medium mb-2 block",
                                    colors.text
                                  )}
                                >
                                  Pricing & Budget
                                </Label>
                                <div className="space-y-3">
                                  <div className="grid grid-cols-3 gap-2">
                                    <Select
                                      value={role.currency || "KES"}
                                      onValueChange={(value) =>
                                        updateRole(role.role, {
                                          currency: value,
                                        })
                                      }
                                    >
                                      <SelectTrigger className="col-span-1">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="KES">KES</SelectItem>
                                        <SelectItem value="USD">USD</SelectItem>
                                        <SelectItem value="EUR">EUR</SelectItem>
                                        <SelectItem value="GBP">GBP</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Input
                                      type="number"
                                      placeholder="Amount per position"
                                      value={role.price || ""}
                                      onChange={(e) =>
                                        updateRole(role.role, {
                                          price: e.target.value,
                                        })
                                      }
                                      min="0"
                                      className="col-span-2"
                                    />
                                  </div>

                                  <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                                    <div className="flex items-center gap-2">
                                      <Switch
                                        checked={role.negotiable !== false}
                                        onCheckedChange={(checked) =>
                                          updateRole(role.role, {
                                            negotiable: checked,
                                          })
                                        }
                                      />
                                      <span
                                        className={cn(
                                          "text-sm font-medium",
                                          colors.text
                                        )}
                                      >
                                        Price Negotiable
                                      </span>
                                    </div>
                                    {role.price && (
                                      <div className="text-right">
                                        <div className="text-xs text-gray-500">
                                          Per position
                                        </div>
                                        <div className="text-lg font-bold text-green-600">
                                          {role.currency || "KES"}{" "}
                                          {parseFloat(
                                            role.price
                                          ).toLocaleString()}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {role.price && (
                                <div className="p-3 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
                                  <div className="flex justify-between items-center">
                                    <span
                                      className={cn(
                                        "text-sm font-medium",
                                        colors.text
                                      )}
                                    >
                                      Total for this role:
                                    </span>
                                    <div className="text-right">
                                      <div className="text-2xl font-bold text-orange-600">
                                        {role.currency || "KES"}{" "}
                                        {(
                                          parseFloat(role.price) * role.maxSlots
                                        ).toLocaleString()}
                                      </div>
                                      <div
                                        className={cn(
                                          "text-xs",
                                          colors.textMuted
                                        )}
                                      >
                                        {role.currency || "KES"} {role.price} ×{" "}
                                        {role.maxSlots} position
                                        {role.maxSlots > 1 ? "s" : ""}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}

                {activeTab === "skills" && (
                  <motion.div
                    key="skills"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    {selectedRoles.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 flex items-center justify-center">
                          <Target className="w-8 h-8 text-blue-500" />
                        </div>
                        <h3
                          className={cn(
                            "text-lg font-semibold mb-2",
                            colors.text
                          )}
                        >
                          Select Roles First
                        </h3>
                        <p className={cn("text-sm", colors.textMuted)}>
                          Choose roles to configure their required skills.
                        </p>
                      </div>
                    ) : (
                      selectedRoles.map((role) => (
                        <div
                          key={role.role}
                          className={cn(
                            "rounded-xl border p-5",
                            colors.border,
                            "bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
                          )}
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
                                Select required skills and genres
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <Label
                                className={cn(
                                  "text-sm font-medium mb-3 block",
                                  colors.text
                                )}
                              >
                                Required Skills & Genres
                              </Label>
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
                                      "cursor-pointer transition-all hover:scale-105",
                                      role.requiredSkills.includes(skill)
                                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-transparent"
                                        : colors.border
                                    )}
                                    onClick={() =>
                                      toggleSkill(role.role, skill)
                                    }
                                  >
                                    {skill}
                                    {role.requiredSkills.includes(skill) && (
                                      <X className="w-3 h-3 ml-1" />
                                    )}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <Label
                                className={cn(
                                  "text-sm font-medium mb-2 block",
                                  colors.text
                                )}
                              >
                                Add Custom Skill
                              </Label>
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Type a custom skill and press Enter"
                                  onKeyPress={(e) => {
                                    if (
                                      e.key === "Enter" &&
                                      (
                                        e.target as HTMLInputElement
                                      ).value.trim()
                                    ) {
                                      const skill = (
                                        e.target as HTMLInputElement
                                      ).value.trim();
                                      if (
                                        !role.requiredSkills.includes(skill)
                                      ) {
                                        updateRole(role.role, {
                                          requiredSkills: [
                                            ...role.requiredSkills,
                                            skill,
                                          ],
                                        });
                                      }
                                      (e.target as HTMLInputElement).value = "";
                                    }
                                  }}
                                  className="flex-1"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}

                {activeTab === "budget" && (
                  <motion.div
                    key="budget"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Budget Summary */}
                    <div
                      className={cn(
                        "rounded-xl border p-6",
                        colors.border,
                        "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
                      )}
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                          <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className={cn("text-xl font-bold", colors.text)}>
                            Band Budget Summary
                          </h3>
                          <p className={cn("text-sm", colors.textMuted)}>
                            Total estimated cost for your band setup
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-4 border-b">
                          <div>
                            <div
                              className={cn(
                                "text-lg font-semibold",
                                colors.text
                              )}
                            >
                              Total Positions
                            </div>
                            <div className={cn("text-sm", colors.textMuted)}>
                              Across all roles
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-orange-600">
                              {totalPositions}
                            </div>
                            <div className={cn("text-sm", colors.textMuted)}>
                              positions needed
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center py-4 border-b">
                          <div>
                            <div
                              className={cn(
                                "text-lg font-semibold",
                                colors.text
                              )}
                            >
                              Estimated Budget
                            </div>
                            <div className={cn("text-sm", colors.textMuted)}>
                              Based on current pricing
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-green-600">
                              {selectedRoles.find((r) => r.price)?.currency ||
                                "KES"}{" "}
                              {totalBudget.toLocaleString()}
                            </div>
                            <div className={cn("text-sm", colors.textMuted)}>
                              {selectedRoles.filter((r) => r.price).length} of{" "}
                              {selectedRoles.length} roles priced
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                          <div className="p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                            <div className="flex items-center gap-2 mb-1">
                              <Zap className="w-4 h-4 text-blue-500" />
                              <span
                                className={cn(
                                  "text-sm font-medium",
                                  colors.text
                                )}
                              >
                                Priced Roles
                              </span>
                            </div>
                            <div className="text-2xl font-bold">
                              {selectedRoles.filter((r) => r.price).length}
                            </div>
                          </div>
                          <div className="p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                            <div className="flex items-center gap-2 mb-1">
                              <TrendingUp className="w-4 h-4 text-green-500" />
                              <span
                                className={cn(
                                  "text-sm font-medium",
                                  colors.text
                                )}
                              >
                                Negotiable
                              </span>
                            </div>
                            <div className="text-2xl font-bold">
                              {
                                selectedRoles.filter(
                                  (r) => r.negotiable !== false
                                ).length
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Budget Breakdown */}
                    <div
                      className={cn(
                        "rounded-xl border p-6",
                        colors.border,
                        colors.backgroundMuted
                      )}
                    >
                      <h4
                        className={cn(
                          "text-lg font-semibold mb-4",
                          colors.text
                        )}
                      >
                        Detailed Budget Breakdown
                      </h4>
                      <div className="space-y-3">
                        {selectedRoles.map((role) => {
                          const price = parseFloat(role.price || "0");
                          if (!price) return null;

                          return (
                            <div
                              key={role.role}
                              className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-800"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10">
                                  <Music className="w-4 h-4 text-orange-500" />
                                </div>
                                <div>
                                  <div
                                    className={cn("font-medium", colors.text)}
                                  >
                                    {role.role}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {role.maxSlots} pos
                                    </Badge>
                                    {role.negotiable !== false && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs bg-green-100 text-green-800"
                                      >
                                        Negotiable
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-green-600">
                                  {role.currency || "KES"}{" "}
                                  {(price * role.maxSlots).toLocaleString()}
                                </div>
                                <div
                                  className={cn("text-xs", colors.textMuted)}
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
            </div>

            {/* Footer */}
            <DialogFooter className="p-6 border-t">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className={cn("gap-2", colors.border, colors.hoverBg)}
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                  <div className="hidden md:block">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className={cn("text-sm", colors.textMuted)}>
                        {selectedRoles.length} roles • {totalPositions}{" "}
                        positions
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={selectedRoles.length === 0}
                  className={cn(
                    "gap-3 px-8 py-6 rounded-xl",
                    "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600",
                    "text-white shadow-xl hover:shadow-2xl transition-all duration-300"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-bold">Create Band</div>
                      <div className="text-xs opacity-90">
                        {selectedRoles.length} role
                        {selectedRoles.length !== 1 ? "s" : ""}
                        {totalBudget > 0 && (
                          <span className="ml-2">
                            •{" "}
                            {selectedRoles.find((r) => r.price)?.currency ||
                              "KES"}{" "}
                            {totalBudget.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DesktopBandSetupModal;
