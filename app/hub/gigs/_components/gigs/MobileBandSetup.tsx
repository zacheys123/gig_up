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
  Star,
  TrendingUp,
  Zap,
  Layers,
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
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface MobileBandSetupModalProps {
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

const MobileBandSetupModal: React.FC<MobileBandSetupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialRoles = [],
}) => {
  const { colors, isDarkMode } = useThemeColors();
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
  const [view, setView] = useState<"selection" | "configuration">("selection");

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

  // Selection View
  const SelectionView = () => (
    <div className="flex flex-col h-full">
      <div className={cn("p-4 border-b", colors.border)}>
        <div className="flex items-center justify-between mb-4">
          <div>
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

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "pl-10 rounded-full",
              isDarkMode
                ? "bg-gray-800 border-gray-700 text-white"
                : "bg-white border-gray-200"
            )}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
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
                      : cn(colors.border, colors.textSecondary)
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{category.label}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {filteredRoles.map((role) => {
              const isSelected = selectedRoles.some(
                (r) => r.role === role.value
              );
              const Icon = role.icon;

              return (
                <button
                  key={role.value}
                  onClick={() => toggleRole(role.value)}
                  className={cn(
                    "relative p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all",
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
                      "p-3 rounded-xl",
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
                </button>
              );
            })}
          </div>

          <div className="mt-6 mb-8">
            <div className={cn("p-4 rounded-2xl border", colors.border)}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className={cn("font-semibold", colors.text)}>
                    Custom Role
                  </h3>
                  <p className={cn("text-sm", colors.textMuted)}>
                    Add unique role
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCustomForm(!showCustomForm)}
                  className={cn("rounded-full", colors.border)}
                >
                  {showCustomForm ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
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
                        placeholder="e.g., Harpist, Beatboxer..."
                        className={cn(
                          "w-full",
                          isDarkMode
                            ? "bg-gray-800 border-gray-700 text-white"
                            : "bg-white border-gray-200"
                        )}
                      />
                      <Button
                        onClick={addCustomRole}
                        disabled={!customRole.trim()}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
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

      <div
        className={cn(
          "sticky bottom-0 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 border-t",
          colors.background,
          colors.border
        )}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4" />
              <span className={cn("text-sm font-medium", colors.text)}>
                {selectedRoles.length} roles selected
              </span>
            </div>
            <Progress
              value={progressPercentage}
              className={cn("h-2", isDarkMode ? "bg-gray-700" : "bg-gray-200")}
            />
          </div>
          <Button
            onClick={() => setView("configuration")}
            disabled={selectedRoles.length === 0}
            className="ml-4 gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500"
          >
            Configure
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  // Configuration View
  const ConfigurationView = () => (
    <div className="flex flex-col h-full">
      <div className={cn("p-4 border-b", colors.border)}>
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setView("selection")}
            className={cn("rounded-full", colors.hoverBg)}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <h2 className={cn("text-xl font-bold", colors.text)}>
              Configure Roles
            </h2>
            <p className={cn("text-sm", colors.textMuted)}>
              {selectedRoles.length} roles selected
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
          <TabsList
            className={cn(
              "grid grid-cols-3 w-full",
              isDarkMode ? "bg-gray-800" : "bg-gray-100"
            )}
          >
            <TabsTrigger
              value="roles"
              className={cn(
                "text-xs",
                isDarkMode
                  ? "data-[state=active]:bg-gray-700"
                  : "data-[state=active]:bg-white"
              )}
            >
              <Settings className="w-3 h-3 mr-1" />
              Roles
            </TabsTrigger>
            <TabsTrigger
              value="skills"
              className={cn(
                "text-xs",
                isDarkMode
                  ? "data-[state=active]:bg-gray-700"
                  : "data-[state=active]:bg-white"
              )}
            >
              <Target className="w-3 h-3 mr-1" />
              Skills
            </TabsTrigger>
            <TabsTrigger
              value="budget"
              className={cn(
                "text-xs",
                isDarkMode
                  ? "data-[state=active]:bg-gray-700"
                  : "data-[state=active]:bg-white"
              )}
            >
              <DollarSign className="w-3 h-3 mr-1" />
              Budget
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <TabsContent value="roles" className="mt-0 space-y-4">
            {selectedRoles.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-orange-500/10 to-red-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className={cn("font-semibold mb-1", colors.text)}>
                  No Roles Selected
                </h3>
                <p className={cn("text-sm", colors.textMuted)}>
                  Go back and select roles to configure
                </p>
              </div>
            ) : (
              selectedRoles.map((role) => (
                <div
                  key={role.role}
                  className={cn("rounded-xl border p-4 mb-3", colors.border)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10">
                        <Music className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <h4 className={cn("font-bold", colors.text)}>
                          {role.role}
                        </h4>
                        <Badge
                          variant="outline"
                          className={cn("text-xs mt-1", colors.border)}
                        >
                          {role.maxSlots} position{role.maxSlots > 1 ? "s" : ""}
                        </Badge>
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
                              maxSlots: Math.max(1, role.maxSlots - 1),
                            })
                          }
                          className={cn("p-2 rounded-full", colors.border)}
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
                          className={cn("p-2 rounded-full", colors.border)}
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
                        placeholder="Describe responsibilities..."
                        value={role.description || ""}
                        onChange={(e) =>
                          updateRole(role.role, { description: e.target.value })
                        }
                        rows={2}
                        className={cn(
                          "resize-none",
                          isDarkMode
                            ? "bg-gray-800 border-gray-700 text-white"
                            : "bg-white border-gray-200"
                        )}
                      />
                    </div>

                    <div>
                      <Label
                        className={cn(
                          "text-sm font-medium mb-2 block",
                          colors.text
                        )}
                      >
                        Pricing
                      </Label>
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          <Select
                            value={role.currency || "KES"}
                            onValueChange={(value) =>
                              updateRole(role.role, { currency: value })
                            }
                          >
                            <SelectTrigger
                              className={cn("col-span-1", colors.border)}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent
                              className={cn(
                                isDarkMode ? "bg-gray-800" : "bg-white"
                              )}
                            >
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
                            min="0"
                            className={cn(
                              "col-span-2",
                              isDarkMode
                                ? "bg-gray-800 border-gray-700 text-white"
                                : "bg-white border-gray-200"
                            )}
                          />
                        </div>

                        <div
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg",
                            isDarkMode
                              ? "bg-gradient-to-r from-green-900/20 to-emerald-900/20"
                              : "bg-gradient-to-r from-green-50 to-emerald-50"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={role.negotiable ?? true}
                              onCheckedChange={(checked) =>
                                updateRole(role.role, { negotiable: checked })
                              }
                            />
                            <span
                              className={cn("text-sm font-medium", colors.text)}
                            >
                              Negotiable
                            </span>
                          </div>
                          {role.price && parseFloat(role.price) > 0 && (
                            <Badge
                              variant={role.negotiable ? "default" : "outline"}
                              className={cn(
                                role.negotiable &&
                                  "bg-gradient-to-r from-green-500 to-emerald-500"
                              )}
                            >
                              {role.negotiable ? "Negotiable" : "Fixed"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="skills" className="mt-0 space-y-4">
            {selectedRoles.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className={cn("font-semibold mb-1", colors.text)}>
                  No Roles Selected
                </h3>
                <p className={cn("text-sm", colors.textMuted)}>
                  Select roles first to add skills
                </p>
              </div>
            ) : (
              selectedRoles.map((role) => (
                <div
                  key={role.role}
                  className={cn("rounded-xl border p-4 mb-3", colors.border)}
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

                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {commonSkills.slice(0, 12).map((skill) => (
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
                              "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                          )}
                          onClick={() => toggleSkill(role.role, skill)}
                        >
                          {skill}
                        </Badge>
                      ))}
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
                        placeholder="Type skill and press Enter"
                        className={cn(
                          isDarkMode
                            ? "bg-gray-800 border-gray-700 text-white"
                            : "bg-white border-gray-200"
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
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="budget" className="mt-0 space-y-4">
            {selectedRoles.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
                <h3 className={cn("font-semibold mb-1", colors.text)}>
                  No Roles Selected
                </h3>
                <p className={cn("text-sm", colors.textMuted)}>
                  Select and price roles first
                </p>
              </div>
            ) : (
              <>
                <div
                  className={cn("rounded-xl border p-4 mb-3", colors.border)}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white">
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

                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2">
                      <span className={cn("font-medium", colors.text)}>
                        Total Positions
                      </span>
                      <span className="text-lg font-bold text-orange-600">
                        {totalPositions}
                      </span>
                    </div>

                    <Separator className={colors.borderSecondary} />

                    <div className="flex justify-between items-center py-2">
                      <span className={cn("font-medium", colors.text)}>
                        Estimated Budget
                      </span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedRoles.find((r) => r.price)?.currency ||
                            "KES"}{" "}
                          {totalBudget.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3">
                      <div
                        className={cn(
                          "p-3 rounded-lg",
                          isDarkMode ? "bg-gray-800" : "bg-white/50"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="w-4 h-4 text-blue-500" />
                          <span
                            className={cn("text-sm font-medium", colors.text)}
                          >
                            Priced Roles
                          </span>
                        </div>
                        <div className="text-xl font-bold">
                          {
                            selectedRoles.filter(
                              (r) => r.price && parseFloat(r.price) > 0
                            ).length
                          }
                        </div>
                      </div>
                      <div
                        className={cn(
                          "p-3 rounded-lg",
                          isDarkMode ? "bg-gray-800" : "bg-white/50"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span
                            className={cn("text-sm font-medium", colors.text)}
                          >
                            Negotiable
                          </span>
                        </div>
                        <div className="text-xl font-bold">
                          {selectedRoles.filter((r) => r.negotiable).length}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedRoles.filter((r) => r.price && parseFloat(r.price) > 0)
                  .length > 0 && (
                  <div className={cn("rounded-xl border p-4", colors.border)}>
                    <h4 className={cn("font-semibold mb-3", colors.text)}>
                      Budget Breakdown
                    </h4>
                    <div className="space-y-2">
                      {selectedRoles
                        .filter(
                          (role) => role.price && parseFloat(role.price) > 0
                        )
                        .map((role) => {
                          const price = parseFloat(role.price!);
                          return (
                            <div
                              key={role.role}
                              className={cn(
                                "flex items-center justify-between p-2 rounded-lg",
                                isDarkMode ? "bg-gray-800" : "bg-gray-50"
                              )}
                            >
                              <div className="flex-1">
                                <span
                                  className={cn(
                                    "text-sm font-medium",
                                    colors.text
                                  )}
                                >
                                  {role.role}
                                </span>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
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
                )}
              </>
            )}
          </TabsContent>
        </div>
      </ScrollArea>

      <div
        className={cn(
          "sticky bottom-0 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 border-t",
          colors.background,
          colors.border
        )}
      >
        <Button
          onClick={handleSubmit}
          disabled={selectedRoles.length === 0}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-lg font-bold"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Create Band ({selectedRoles.length})
        </Button>
      </div>
    </div>
  );

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent
        className={cn(
          "h-[90vh] max-h-[90vh]",
          isDarkMode ? "bg-gray-900" : "bg-white"
        )}
      >
        {view === "selection" ? <SelectionView /> : <ConfigurationView />}
      </DrawerContent>
    </Drawer>
  );
};

export default MobileBandSetupModal;
