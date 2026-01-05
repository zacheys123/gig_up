// app/gigs/_components/MobileBandSetupModal.tsx
import React, { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
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
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BandRoleInput } from "@/types/gig";
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

interface BandRole {
  role: string;
  maxSlots: number;
  requiredSkills: string[];
  description?: string;
  price?: string;
  currency?: string;
  negotiable?: boolean;
}

interface MobileBandSetupModalProps {
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

const MobileBandSetupModal: React.FC<MobileBandSetupModalProps> = ({
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
  const [view, setView] = useState<"selection" | "configuration">("selection");

  // Calculate totals
  const totalPositions = selectedRoles.reduce(
    (sum, role) => sum + role.maxSlots,
    0
  );
  const totalBudget = selectedRoles.reduce((total, role) => {
    const price = parseFloat(role.price || "0");
    return total + price * role.maxSlots;
  }, 0);

  // Filter roles
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
    if (selectedRoles.length === 0) {
      setView("configuration");
    }
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
      setView("configuration");
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
    const baseProgress = Math.min(selectedRoles.length * 15, 60);
    const configuredProgress =
      selectedRoles.filter(
        (role) => role.maxSlots > 0 && role.requiredSkills.length > 0
      ).length * 5;
    return Math.min(baseProgress + configuredProgress, 100);
  };

  // Selection View
  // Selection View - Fixed with proper layout
  const SelectionView = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b shrink-0">
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
            className="rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-full"
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-3">
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
                      : cn(colors.hoverBg, colors.border)
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{category.label}</span>
                </button>
              );
            })}
          </div>

          {/* Role Grid */}
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

          {/* Custom Role */}
          <div className="mt-6 mb-24">
            {" "}
            {/* Increased bottom margin */}
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
                  className="rounded-full"
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

      {/* Footer */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 border-t shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4" />
              <span className={cn("text-sm font-medium", colors.text)}>
                {selectedRoles.length} roles selected
              </span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
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
    <>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setView("selection")}
            className="rounded-full"
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
            className="rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="roles" className="text-xs">
              <Settings className="w-3 h-3 mr-1" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="skills" className="text-xs">
              <Target className="w-3 h-3 mr-1" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="budget" className="text-xs">
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
                        <Badge variant="outline" className="text-xs mt-1">
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
                        placeholder="Describe responsibilities..."
                        value={role.description || ""}
                        onChange={(e) =>
                          updateRole(role.role, { description: e.target.value })
                        }
                        rows={2}
                        className="resize-none"
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
                            <SelectTrigger className="col-span-1">
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
                            min="0"
                            className="col-span-2"
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={role.negotiable !== false}
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
                          {role.price && (
                            <Badge
                              variant={
                                role.negotiable !== false
                                  ? "default"
                                  : "outline"
                              }
                              className={cn(
                                role.negotiable !== false &&
                                  "bg-gradient-to-r from-green-500 to-emerald-500"
                              )}
                            >
                              {role.negotiable !== false
                                ? "Negotiable"
                                : "Fixed"}
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
                      {commonSkills.slice(0, 8).map((skill) => (
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
                        onKeyPress={(e) => {
                          if (
                            e.key === "Enter" &&
                            (e.target as HTMLInputElement).value.trim()
                          ) {
                            const skill = (
                              e.target as HTMLInputElement
                            ).value.trim();
                            if (!role.requiredSkills.includes(skill)) {
                              updateRole(role.role, {
                                requiredSkills: [...role.requiredSkills, skill],
                              });
                            }
                            (e.target as HTMLInputElement).value = "";
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
                {/* Budget Summary */}
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

                    <Separator />

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
                      <div className="p-3 rounded-lg bg-white/50">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="w-4 h-4 text-blue-500" />
                          <span
                            className={cn("text-sm font-medium", colors.text)}
                          >
                            Priced Roles
                          </span>
                        </div>
                        <div className="text-xl font-bold">
                          {selectedRoles.filter((r) => r.price).length}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-white/50">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span
                            className={cn("text-sm font-medium", colors.text)}
                          >
                            Negotiable
                          </span>
                        </div>
                        <div className="text-xl font-bold">
                          {
                            selectedRoles.filter((r) => r.negotiable !== false)
                              .length
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Budget Breakdown */}
                {selectedRoles.filter((r) => r.price).length > 0 && (
                  <div className={cn("rounded-xl border p-4", colors.border)}>
                    <h4 className={cn("font-semibold mb-3", colors.text)}>
                      Budget Breakdown
                    </h4>
                    <div className="space-y-2">
                      {selectedRoles
                        .filter((role) => role.price)
                        .map((role) => {
                          const price = parseFloat(role.price || "0");
                          return (
                            <div
                              key={role.role}
                              className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
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
                              <div className="text-right">
                                <div className="text-lg font-bold text-green-600">
                                  {role.currency}{" "}
                                  {(price * role.maxSlots).toLocaleString()}
                                </div>
                                <div
                                  className={cn("text-xs", colors.textMuted)}
                                >
                                  {role.currency} {price.toLocaleString()} each
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

      <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 border-t">
        <Button
          onClick={handleSubmit}
          disabled={selectedRoles.length === 0}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-lg font-bold"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Create Band ({selectedRoles.length})
        </Button>
      </div>
    </>
  );

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[90vh] max-h-[90vh]">
        {view === "selection" ? <SelectionView /> : <ConfigurationView />}
      </DrawerContent>
    </Drawer>
  );
};

export default MobileBandSetupModal;
