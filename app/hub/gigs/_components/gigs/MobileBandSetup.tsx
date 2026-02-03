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
  Check,
  DollarSign,
  Settings,
  ChevronUp,
  ChevronDown,
  Layers,
  Eye,
  EyeOff,
  Filter,
  UserPlus,
  Target,
  Calendar,
  Clock,
  Sparkles,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";

interface MobileBandSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roles: BandRoleInput[]) => void;
  initialRoles?: BandRoleInput[];
}

const commonRoles = [
  { id: "vocalist", value: "Lead Vocalist", icon: Mic, category: "vocal" },
  { id: "guitar", value: "Guitarist", icon: Guitar, category: "strings" },
  { id: "bass", value: "Bassist", icon: Music, category: "strings" },
  { id: "drums", value: "Drummer", icon: Drum, category: "percussion" },
  { id: "piano", value: "Pianist/Keyboardist", icon: Piano, category: "keys" },
  { id: "sax", value: "Saxophonist", icon: Music, category: "brass" },
  { id: "trumpet", value: "Trumpeter", icon: Music, category: "brass" },
  { id: "violin", value: "Violinist", icon: Music, category: "strings" },
  { id: "backups", value: "Backup Vocalist", icon: Mic, category: "vocal" },
  {
    id: "percussion",
    value: "Percussionist",
    icon: Drum,
    category: "percussion",
  },
  { id: "dj", value: "DJ", icon: Volume2, category: "electronic" },
  { id: "mc", value: "MC/Host", icon: Mic, category: "vocal" },
];

const roleCategories = [
  { value: "all", label: "All", icon: Layers },
  { value: "vocal", label: "Vocal", icon: Mic },
  { value: "strings", label: "Strings", icon: Guitar },
  { value: "keys", label: "Keys", icon: Piano },
  { value: "percussion", label: "Drums", icon: Drum },
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
      requiredSkills: role.requiredSkills || [],
      description: role.description || "",
      price: role.price?.toString() || "",
      currency: role.currency || "KES",
      negotiable: role.negotiable ?? true,
      isLocked: role.isLocked || false,
      filledSlots: role.filledSlots || 0,
    })),
  );

  const [customRole, setCustomRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [view, setView] = useState<"select" | "configure">("select");
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [showBudget, setShowBudget] = useState(true);
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

  const toggleRole = useCallback((roleId: string) => {
    setSelectedRoles((prev) => {
      const existing = prev.find((r) => r.role === roleId);
      if (existing) {
        return prev.filter((r) => r.role !== roleId);
      } else {
        return [
          ...prev,
          {
            role: roleId,
            maxSlots: 1,
            maxApplicants: 20,
            requiredSkills: [],
            description: "",
            currency: "KES",
            negotiable: true,
            isLocked: false,
            filledSlots: 0,
          },
        ];
      }
    });
  }, []);

  const updateRole = useCallback(
    (roleId: string, updates: Partial<BandSetupRole>) => {
      setSelectedRoles((prev) =>
        prev.map((role) =>
          role.role === roleId ? { ...role, ...updates } : role,
        ),
      );
    },
    [],
  );

  const removeRole = useCallback(
    (roleId: string) => {
      setSelectedRoles((prev) => prev.filter((r) => r.role !== roleId));
      if (expandedRole === roleId) {
        setExpandedRole(null);
      }
    },
    [expandedRole],
  );

  const handleSubmit = useCallback(() => {
    if (selectedRoles.length > 0) {
      const rolesToSubmit = selectedRoles.map((role) => ({
        ...role,
        price: role.price ? parseFloat(role.price) : undefined,
      }));
      onSubmit(rolesToSubmit);
      onClose();
    }
  }, [selectedRoles, onSubmit, onClose]);

  const toggleSkill = useCallback((roleId: string, skill: string) => {
    setSelectedRoles((prev) =>
      prev.map((role) => {
        if (role.role === roleId) {
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

  // Mobile-optimized RoleCard
  const RoleCard = ({ role }: { role: BandSetupRole }) => {
    const isExpanded = expandedRole === role.role;
    const roleInfo = commonRoles.find((r) => r.id === role.role);
    const Icon = roleInfo?.icon || Music;
    const label = roleInfo ? roleInfo.value : role.role;
    const maxApplicants = role.maxApplicants || 20;

    return (
      <Card
        className={cn(
          "mb-3 border-2 transition-all duration-300 overflow-hidden",
          isExpanded
            ? "border-orange-500/30 shadow-lg shadow-orange-500/10"
            : "border-zinc-200 dark:border-zinc-800",
        )}
      >
        {/* Header - Always visible */}
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className={cn(
                "p-2.5 rounded-xl",
                isExpanded
                  ? "bg-orange-500 text-white"
                  : "bg-zinc-100 dark:bg-zinc-800",
              )}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-black text-sm uppercase tracking-tight truncate">
                {label}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className="text-[10px] h-5 px-1.5 font-bold"
                >
                  {role.maxSlots} POS
                </Badge>
                {role.price && parseFloat(role.price) > 0 && (
                  <Badge className="text-[10px] h-5 px-1.5 bg-green-500/10 text-green-600 border-none">
                    KES {parseFloat(role.price).toLocaleString()}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedRole(isExpanded ? null : role.role)}
              className={cn(
                "h-8 w-8 rounded-full",
                isExpanded
                  ? "bg-orange-500/10"
                  : "bg-zinc-100 dark:bg-zinc-800",
              )}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <Settings className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeRole(role.role)}
              className="h-8 w-8 rounded-full text-zinc-400 hover:text-red-500 hover:bg-red-50"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Expandable Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-4 border-t">
                {/* Positions & Applicants */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-zinc-500">
                      Positions
                    </Label>
                    <div className="flex items-center justify-between bg-white dark:bg-zinc-800 rounded-xl p-1.5 border">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg"
                        onClick={() =>
                          updateRole(role.role, {
                            maxSlots: Math.max(1, role.maxSlots - 1),
                          })
                        }
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </Button>
                      <div className="text-center">
                        <div className="text-2xl font-black">
                          {role.maxSlots}
                        </div>
                        <div className="text-[10px] text-zinc-500">needed</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg"
                        onClick={() =>
                          updateRole(role.role, { maxSlots: role.maxSlots + 1 })
                        }
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-zinc-500">
                      Max Apps
                    </Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-white dark:bg-zinc-800 rounded-xl p-1.5 border">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-lg"
                          onClick={() =>
                            updateRole(role.role, {
                              maxApplicants: Math.max(5, maxApplicants - 5),
                            })
                          }
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </Button>
                        <div className="text-center">
                          <div className="text-2xl font-black">
                            {maxApplicants}
                          </div>
                          <div className="text-[10px] text-zinc-500">max</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-lg"
                          onClick={() =>
                            updateRole(role.role, {
                              maxApplicants: maxApplicants + 5,
                            })
                          }
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <Slider
                        value={[maxApplicants]}
                        min={1}
                        max={100}
                        step={5}
                        onValueChange={([value]) =>
                          updateRole(role.role, { maxApplicants: value })
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Compensation */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-2">
                    <DollarSign className="w-3 h-3" /> Rate per head
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <Select
                        value={role.currency}
                        onValueChange={(value) =>
                          updateRole(role.role, { currency: value })
                        }
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="KES">KES</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={role.price}
                        onChange={(e) =>
                          updateRole(role.role, { price: e.target.value })
                        }
                        className="h-10 font-bold"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-medium">Negotiable</span>
                    <Switch
                      checked={role.negotiable}
                      onCheckedChange={(checked) =>
                        updateRole(role.role, { negotiable: checked })
                      }
                      className="data-[state=checked]:bg-orange-500"
                    />
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-2">
                    <Target className="w-3 h-3" /> Required Skills
                  </Label>
                  <div className="flex flex-wrap gap-1.5">
                    {commonSkills.slice(0, 6).map((skill) => (
                      <Badge
                        key={skill}
                        variant={
                          role.requiredSkills.includes(skill)
                            ? "default"
                            : "outline"
                        }
                        className={cn(
                          "cursor-pointer text-xs px-2 py-1",
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

                {/* Description */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-zinc-500">
                    Description
                  </Label>
                  <Textarea
                    placeholder="Responsibilities, style preferences..."
                    value={role.description}
                    onChange={(e) =>
                      updateRole(role.role, { description: e.target.value })
                    }
                    rows={2}
                    className="text-sm resize-none"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    );
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[92vh] rounded-t-[32px] border-0">
        <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
          {/* Header */}
          <div className="p-5 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              {view === "configure" ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setView("select")}
                  className="-ml-2 font-bold text-sm"
                >
                  <ChevronDown className="w-4 h-4 mr-1 rotate-90" /> Back to
                  Selection
                </Button>
              ) : (
                <div className="space-y-1">
                  <h2 className="text-xl font-black uppercase tracking-tight">
                    Band Setup
                  </h2>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    {selectedRoles.length} roles selected
                  </p>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full bg-zinc-100 dark:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {view === "select" && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    placeholder="Search instruments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl text-sm font-medium"
                  />
                </div>
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex gap-2 pb-1">
                    {roleCategories.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setSelectedCategory(cat.value)}
                        className={cn(
                          "px-4 py-2.5 rounded-full text-xs font-black uppercase transition-all border shrink-0",
                          selectedCategory === cat.value
                            ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20"
                            : "bg-zinc-100 dark:bg-zinc-800 border-transparent text-zinc-500",
                        )}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          {/* Main Content */}
          <ScrollArea className="flex-1">
            <div className="p-5">
              {view === "select" ? (
                <>
                  {/* Role Selection Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {filteredRoles.map((roleInfo) => {
                      const isSelected = selectedRoles.some(
                        (r) => r.role === roleInfo.id,
                      );
                      return (
                        <button
                          key={roleInfo.id}
                          onClick={() => toggleRole(roleInfo.id)}
                          className={cn(
                            "flex flex-col items-center p-4 rounded-2xl transition-all border",
                            isSelected
                              ? "bg-orange-500/5 border-orange-500 shadow-lg shadow-orange-500/10"
                              : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800",
                          )}
                        >
                          <div
                            className={cn(
                              "p-3 rounded-xl mb-3 transition-colors",
                              isSelected
                                ? "bg-orange-500 text-white"
                                : "bg-white dark:bg-zinc-800",
                            )}
                          >
                            <roleInfo.icon className="w-6 h-6" />
                          </div>
                          <span
                            className={cn(
                              "text-sm font-black text-center leading-tight",
                              isSelected
                                ? "text-orange-600 dark:text-orange-400"
                                : "text-zinc-600 dark:text-zinc-300",
                            )}
                          >
                            {roleInfo.value}
                          </span>
                          {isSelected && (
                            <Check className="w-5 h-5 mt-2 text-orange-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Role Input */}
                  <div className="mt-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900">
                    <div className="flex gap-2">
                      <Input
                        value={customRole}
                        onChange={(e) => setCustomRole(e.target.value)}
                        placeholder="Add custom role..."
                        className="flex-1 h-12 bg-white dark:bg-zinc-800"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && customRole.trim()) {
                            const roleId = customRole
                              .trim()
                              .toLowerCase()
                              .replace(/\s+/g, "_");
                            if (!selectedRoles.some((r) => r.role === roleId)) {
                              toggleRole(roleId);
                              setCustomRole("");
                            }
                          }
                        }}
                      />
                      <Button
                        onClick={() => {
                          if (customRole.trim()) {
                            const roleId = customRole
                              .trim()
                              .toLowerCase()
                              .replace(/\s+/g, "_");
                            if (!selectedRoles.some((r) => r.role === roleId)) {
                              toggleRole(roleId);
                              setCustomRole("");
                            }
                          }
                        }}
                        size="icon"
                        className="h-12 w-12 bg-zinc-900 dark:bg-zinc-100 dark:text-black"
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4 pb-32">
                  <AnimatePresence mode="wait">
                    {selectedRoles.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                      >
                        <Music className="w-16 h-16 mx-auto mb-4 text-zinc-300" />
                        <h3 className="text-lg font-bold mb-2">
                          No Roles Selected
                        </h3>
                        <p className="text-zinc-500">
                          Add roles from the selection screen
                        </p>
                        <Button
                          onClick={() => setView("select")}
                          className="mt-6 bg-orange-500 hover:bg-orange-600"
                        >
                          Browse Roles
                        </Button>
                      </motion.div>
                    ) : (
                      <>
                        {selectedRoles.map((role) => (
                          <RoleCard key={role.role} role={role} />
                        ))}

                        {/* Summary Card */}
                        <Card className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-sm font-black uppercase tracking-wider">
                                Setup Summary
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowBudget(!showBudget)}
                                className="h-7 w-7 p-0"
                              >
                                {showBudget ? (
                                  <EyeOff className="w-3.5 h-3.5" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5" />
                                )}
                              </Button>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              <div className="text-center p-3 rounded-xl bg-white dark:bg-zinc-800 border">
                                <div className="text-2xl font-black">
                                  {totalPositions}
                                </div>
                                <div className="text-[10px] font-bold uppercase text-zinc-500 mt-1">
                                  Positions
                                </div>
                              </div>
                              <div className="text-center p-3 rounded-xl bg-white dark:bg-zinc-800 border">
                                <div className="text-2xl font-black text-blue-600">
                                  {selectedRoles.length}
                                </div>
                                <div className="text-[10px] font-bold uppercase text-zinc-500 mt-1">
                                  Roles
                                </div>
                              </div>
                              <div className="text-center p-3 rounded-xl bg-white dark:bg-zinc-800 border">
                                <div className="text-2xl font-black text-orange-500">
                                  {showBudget ? (
                                    <>KES {totalBudget.toLocaleString()}</>
                                  ) : (
                                    "••••••"
                                  )}
                                </div>
                                <div className="text-[10px] font-bold uppercase text-zinc-500 mt-1">
                                  Budget
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-5 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800">
            {view === "select" ? (
              <Button
                onClick={() => setView("configure")}
                disabled={selectedRoles.length === 0}
                className={cn(
                  "w-full h-14 rounded-2xl font-black uppercase tracking-wider transition-all",
                  selectedRoles.length === 0
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                    : "bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white hover:bg-zinc-800",
                )}
              >
                {selectedRoles.length === 0 ? (
                  "Select Roles to Continue"
                ) : (
                  <>
                    Configure {selectedRoles.length} Role
                    {selectedRoles.length !== 1 ? "s" : ""}
                    <Settings className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={selectedRoles.length === 0}
                className="w-full h-14 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl font-black uppercase tracking-wider shadow-xl shadow-orange-500/20 active:scale-[0.98] transition-transform"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Confirm Band Setup
              </Button>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileBandSetupModal;
