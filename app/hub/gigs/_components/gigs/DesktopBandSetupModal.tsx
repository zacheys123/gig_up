// app/gigs/_components/DesktopBandSetupModal.tsx
import React, { useState, useMemo, useCallback } from "react";
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
  Sparkles,
  ArrowRight,
  Check,
  DollarSign,
  Settings,
  Target,
  TrendingUp,
  Zap,
  Layers,
  UserPlus,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BandRoleInput ,BandSetupRole} from "@/types/gig";

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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface DesktopBandSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roles: BandRoleInput[]) => void;
  initialRoles?: BandSetupRole[];
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

const DesktopBandSetupModal: React.FC<DesktopBandSetupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialRoles = [],
}) => {
  const { colors } = useThemeColors();
  const [selectedRoles, setSelectedRoles] = useState<BandSetupRole[]>(
    initialRoles.map((role) => ({
      ...role,
      requiredSkills: role.requiredSkills || [],
      price: role.price || "",
      currency: role.currency || "KES",
      negotiable: role.negotiable ?? true,
    }))
  );
  const [customRole, setCustomRole] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<"roles" | "skills" | "budget">(
    "roles"
  );

  // Memoized calculations
  const { totalPositions, totalBudget } = useMemo(() => {
    const positions = selectedRoles.reduce(
      (sum, role) => sum + role.maxSlots,
      0
    );
    const budget = selectedRoles.reduce((total, role) => {
      const price = role.price ? parseFloat(role.price) : 0;
      return total + (isNaN(price) ? 0 : price) * role.maxSlots;
    }, 0);
    return { totalPositions: positions, totalBudget: budget };
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
        (role) => role.maxSlots > 0 && role.requiredSkills.length > 0
      ).length * 5;
    return Math.min(baseProgress + configuredProgress, 100);
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
            requiredSkills: [],
            description: "",
            currency: "KES",
            negotiable: true,
          },
        ];
      }
    });
  }, []);

  const updateRole = useCallback(
    (roleName: string, updates: Partial<BandSetupRole>) => {
      setSelectedRoles((prev) =>
        prev.map((role) =>
          role.role === roleName ? { ...role, ...updates } : role
        )
      );
    },
    []
  );

  const addCustomRole = useCallback(() => {
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
      })
    );
  }, []);

  const prepareForSubmission = useCallback(
    (role: BandSetupRole): BandRoleInput => {
      const price = role.price ? parseFloat(role.price) : undefined;
      return {
        role: role.role,
        maxSlots: role.maxSlots,
        requiredSkills:
          role.requiredSkills.length > 0 ? role.requiredSkills : undefined,
        description: role.description || undefined,
        price: price && !isNaN(price) ? price : undefined,
        currency: role.currency,
        negotiable: role.negotiable,
      };
    },
    []
  );

  const handleSubmit = useCallback(() => {
    if (selectedRoles.length > 0) {
      const rolesToSubmit = selectedRoles.map(prepareForSubmission);
      onSubmit(rolesToSubmit);
      onClose();
    }
  }, [selectedRoles, prepareForSubmission, onSubmit, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex h-[90vh] w-full">
          {/* Left Panel - Role Selection */}
          <div className="w-2/5 border-r flex flex-col">
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
                <Badge
                  variant="outline"
                  className={cn("gap-1", colors.borderSecondary)}
                >
                  <Sparkles className="w-3 h-3" />
                  Pro Setup
                </Badge>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className={cn("text-sm font-medium", colors.text)}>
                    Setup Progress
                  </span>
                  <span className={cn("text-sm font-bold", colors.primary)}>
                    {progressPercentage}%
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>

              {/* Search and Filter */}
              <div className="mt-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search roles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 rounded-full"
                  />
                </div>

                <ScrollArea className="w-full">
                  <div className="flex gap-2 pb-2">
                    {roleCategories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <button
                          key={category.value}
                          onClick={() => setSelectedCategory(category.value)}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all shrink-0",
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
                </ScrollArea>
              </div>
            </DialogHeader>

            <ScrollArea className="flex-1">
              <div className="p-6">
                <div className="grid grid-cols-2 gap-3">
                  {filteredRoles.map((role) => {
                    const isSelected = selectedRoles.some(
                      (r) => r.role === role.value
                    );
                    const Icon = role.icon;

                    return (
                      <motion.button
                        key={role.value}
                        onClick={() => toggleRole(role.value)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "relative p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all group",
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
                            "p-3 rounded-xl transition-transform group-hover:scale-110",
                            isSelected
                              ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                              : cn(colors.backgroundMuted, colors.primary)
                          )}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <span
                          className={cn(
                            "text-sm font-medium text-center",
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
                  <div className={cn("p-4 rounded-2xl border", colors.border)}>
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
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCustomForm(!showCustomForm)}
                        className="rounded-full gap-2"
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
                              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
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
            </ScrollArea>
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
                {(["roles", "skills", "budget"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all",
                      activeTab === tab
                        ? {
                            roles:
                              "bg-gradient-to-r from-orange-500 to-red-500",
                            skills:
                              "bg-gradient-to-r from-blue-500 to-cyan-500",
                            budget:
                              "bg-gradient-to-r from-green-500 to-emerald-500",
                          }[tab] + " text-white"
                        : cn(colors.hoverBg, colors.text)
                    )}
                  >
                    {tab === "roles" && (
                      <Settings className="w-4 h-4 inline mr-2" />
                    )}
                    {tab === "skills" && (
                      <Target className="w-4 h-4 inline mr-2" />
                    )}
                    {tab === "budget" && (
                      <DollarSign className="w-4 h-4 inline mr-2" />
                    )}
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </DialogHeader>

            <ScrollArea className="flex-1">
              <div className="p-6">
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
                            Select roles from the left panel to start
                            configuring your band.
                          </p>
                        </div>
                      ) : (
                        selectedRoles.map((role) => {
                          const rolePrice = role.price
                            ? parseFloat(role.price)
                            : 0;
                          const isValidPrice = !isNaN(rolePrice);

                          return (
                            <div
                              key={role.role}
                              className={cn(
                                "rounded-2xl border p-5",
                                colors.border
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
                                    <p
                                      className={cn(
                                        "text-sm",
                                        colors.textMuted
                                      )}
                                    >
                                      Configure requirements and pricing
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeRole(role.role)}
                                  className="text-gray-400 hover:text-red-500 rounded-full"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column */}
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
                                        className="p-2 rounded-full"
                                      >
                                        <Minus className="w-4 h-4" />
                                      </Button>
                                      <div className="flex-1 text-center">
                                        <div className="text-3xl font-bold text-orange-600">
                                          {role.maxSlots}
                                        </div>
                                      </div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          updateRole(role.role, {
                                            maxSlots: role.maxSlots + 1,
                                          })
                                        }
                                        className="p-2 rounded-full"
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

                                {/* Right Column */}
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
                                            <SelectItem value="KES">
                                              KES
                                            </SelectItem>
                                            <SelectItem value="USD">
                                              USD
                                            </SelectItem>
                                            <SelectItem value="EUR">
                                              EUR
                                            </SelectItem>
                                            <SelectItem value="GBP">
                                              GBP
                                            </SelectItem>
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

                                      <div
                                        className={cn(
                                          "relative overflow-hidden p-5 rounded-2xl cursor-pointer transition-all duration-300",
                                          "border hover:shadow-md hover:scale-[1.01] active:scale-[0.99]",
                                          role.negotiable
                                            ? "bg-gradient-to-br from-green-50 via-white to-emerald-50/70 border-green-300/50 dark:from-green-900/20 dark:via-gray-900 dark:to-emerald-900/20 dark:border-green-700/30 hover:shadow-green-200/50 dark:hover:shadow-green-900/20"
                                            : "bg-gradient-to-br from-gray-50 via-white to-gray-100/50 border-gray-300/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/50 dark:border-gray-700/50 hover:shadow-gray-200/30 dark:hover:shadow-gray-800/20"
                                        )}
                                        onClick={() =>
                                          updateRole(role.role, {
                                            negotiable: !role.negotiable,
                                          })
                                        }
                                      >
                                        {/* ... Negotiable toggle UI remains the same ... */}
                                      </div>
                                    </div>
                                  </div>

                                  {isValidPrice && rolePrice > 0 && (
                                    <div className="p-3 rounded-lg bg-gradient-to-r from-orange-50 to-red-50">
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
                                              rolePrice * role.maxSlots
                                            ).toLocaleString()}
                                          </div>
                                          <div
                                            className={cn(
                                              "text-xs",
                                              colors.textMuted
                                            )}
                                          >
                                            {role.currency || "KES"}{" "}
                                            {rolePrice.toLocaleString()} ×{" "}
                                            {role.maxSlots} position
                                            {role.maxSlots > 1 ? "s" : ""}
                                            {role.negotiable && " • Negotiable"}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
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
                              "rounded-2xl border p-5",
                              colors.border
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
                                        role.requiredSkills.includes(skill) &&
                                          "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-transparent"
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
                                <Input
                                  placeholder="Type a custom skill and press Enter"
                                  onKeyDown={(e) => {
                                    if (
                                      e.key === "Enter" &&
                                      e.currentTarget.value.trim()
                                    ) {
                                      const skill =
                                        e.currentTarget.value.trim();
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
                                      e.currentTarget.value = "";
                                    }
                                  }}
                                  className="w-full"
                                />
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
                        className={cn("rounded-xl border p-6", colors.border)}
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                            <DollarSign className="w-6 h-6" />
                          </div>
                          <div>
                            <h3
                              className={cn("text-xl font-bold", colors.text)}
                            >
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
                                {
                                  selectedRoles.filter(
                                    (r) => r.price && parseFloat(r.price) > 0
                                  ).length
                                }{" "}
                                of {selectedRoles.length} roles priced
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="p-3 rounded-lg bg-white/50">
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
                                {
                                  selectedRoles.filter(
                                    (r) => r.price && parseFloat(r.price) > 0
                                  ).length
                                }
                              </div>
                            </div>
                            <div className="p-3 rounded-lg bg-white/50">
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
                                  selectedRoles.filter((r) => r.negotiable)
                                    .length
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Budget Breakdown */}
                      {selectedRoles.filter(
                        (r) => r.price && parseFloat(r.price) > 0
                      ).length > 0 && (
                        <div
                          className={cn("rounded-xl border p-6", colors.border)}
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
                            {selectedRoles
                              .filter(
                                (role) =>
                                  role.price && parseFloat(role.price) > 0
                              )
                              .map((role) => {
                                const price = parseFloat(role.price!);
                                return (
                                  <div
                                    key={role.role}
                                    className="flex items-center justify-between p-3 rounded-lg bg-white"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10">
                                        <Music className="w-4 h-4 text-orange-500" />
                                      </div>
                                      <div>
                                        <div
                                          className={cn(
                                            "font-medium",
                                            colors.text
                                          )}
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
                                          {role.negotiable && (
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
                                        {(
                                          price * role.maxSlots
                                        ).toLocaleString()}
                                      </div>
                                      <div
                                        className={cn(
                                          "text-xs",
                                          colors.textMuted
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
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>

            {/* Footer */}
            <DialogFooter className="p-6 border-t">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="gap-2 rounded-full"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className={cn("text-sm", colors.textMuted)}>
                      {selectedRoles.length} roles • {totalPositions} positions
                    </span>
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
                        {selectedRoles.length} roles
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
