// app/gigs/_components/MobileBandSetupModal.tsx
import React, { useState, useMemo, useCallback, useEffect } from "react";
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
  Check,
  DollarSign,
  ChevronLeft,
  Star,
  TrendingUp,
  Zap,
  Layers,
  UserPlus,
  Settings,
  Target,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  Filter,
  Grid,
  List,
  Info,
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getBackendValue } from "../../utils";

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
  { value: "all", label: "All", icon: Layers },
  { value: "vocal", label: "Vocal", icon: Mic },
  { value: "strings", label: "Strings", icon: Guitar },
  { value: "keys", label: "Keys", icon: Piano },
  { value: "percussion", label: "Drums", icon: Drum },
  { value: "brass", label: "Brass", icon: Music },
  { value: "electronic", label: "DJ", icon: Volume2 },
];

const MobileBandSetupModal: React.FC<MobileBandSetupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialRoles = [],
}) => {
  const { colors } = useThemeColors();
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [showBudget, setShowBudget] = useState(false);

  // Memoized calculations
  const { totalPositions, totalBudget, totalMaxApplicants } = useMemo(() => {
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

    return {
      totalPositions: positions,
      totalBudget: budget,
      totalMaxApplicants: maxApplicants,
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
            requiredSkills: [],
            description: "",
            currency: "KES",
            negotiable: true,
            isLocked: false,
            filledSlots: 0,
            bookedPrice: 0,
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
          requiredSkills: [],
          description: "",
          currency: "KES",
          negotiable: true,
          isLocked: false,
          filledSlots: 0,
          bookedPrice: 0,
        },
      ]);
      setCustomRole("");
    }
  }, [customRole]);

  const removeRole = useCallback((roleName: string) => {
    setSelectedRoles((prev) => prev.filter((r) => r.role !== roleName));
  }, []);

  const prepareForSubmission = useCallback(
    (role: BandSetupRole): BandRoleInput => {
      const price = role.price ? parseFloat(role.price) : undefined;

      return {
        role: getBackendValue(role.role),
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

  // Compact Role Card Component
  const RoleCard = ({ role }: { role: BandSetupRole }) => {
    const isExpanded = expandedRole === role.role;
    const roleInfo = commonRoles.find((r) => r.value === role.role);
    const Icon = roleInfo?.icon || Music;

    return (
      <div
        className={cn(
          "border rounded-2xl overflow-hidden transition-all",
          colors.border,
          isExpanded ? "shadow-lg" : "shadow-sm",
        )}
      >
        {/* Compact Header */}
        <div
          className={cn(
            "p-3 flex items-center justify-between",
            isExpanded && "border-b",
            colors.border,
          )}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-lg bg-gray-50">
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">{role.role}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge
                  variant="outline"
                  className="text-[10px] h-5 px-1.5 font-medium"
                >
                  {role.maxSlots} pos
                </Badge>
                <Badge
                  variant="secondary"
                  className="text-[10px] h-5 px-1.5 font-medium bg-blue-50 text-blue-700"
                >
                  {role.maxApplicants || 20} apps
                </Badge>
                {role.price && parseFloat(role.price) > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] h-5 px-1.5 font-medium bg-green-50 text-green-700"
                  >
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
              className="h-8 w-8 p-0"
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
              className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </Button>
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
                {/* Quick Controls */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium mb-2">
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
                        className="h-9 w-9 p-0"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <div className="flex-1 text-center">
                        <div className="text-xl font-bold">{role.maxSlots}</div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateRole(role.role, { maxSlots: role.maxSlots + 1 })
                        }
                        className="h-9 w-9 p-0"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium mb-2">Max Apps</Label>
                    <Select
                      value={(role.maxApplicants || 20).toString()}
                      onValueChange={(v) =>
                        updateRole(role.role, { maxApplicants: parseInt(v) })
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="30">30</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <Label className="text-xs font-medium mb-2">Rate</Label>
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
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                        {role.currency}
                      </span>
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={role.price || ""}
                        onChange={(e) =>
                          updateRole(role.role, { price: e.target.value })
                        }
                        className="pl-12"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">Negotiable</span>
                    <Switch
                      checked={role.negotiable}
                      onCheckedChange={(checked) =>
                        updateRole(role.role, { negotiable: checked })
                      }
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[90vh] max-h-[90vh] rounded-t-3xl overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="border-b p-4">
            <div className="flex items-center justify-between mb-4">
              {view === "configure" ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setView("select");
                    setExpandedRole(null);
                  }}
                  className="-ml-2"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              ) : (
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">Select Roles</h2>
                  <p className="text-sm text-gray-500">
                    Choose band members needed
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2">
                {view === "configure" && (
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Total</div>
                    <div className="font-semibold">
                      {selectedRoles.length} roles
                    </div>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {view === "select" && (
              <>
                {/* Search */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search roles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Categories */}
                <ScrollArea className="pb-2">
                  <div className="flex gap-2">
                    {roleCategories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <button
                          key={category.value}
                          onClick={() => setSelectedCategory(category.value)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all",
                            selectedCategory === category.value
                              ? "bg-black text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                          )}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{category.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </>
            )}
          </div>

          {/* Main Content */}
          <ScrollArea className="flex-1">
            {view === "select" ? (
              <div className="p-4">
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
                          "w-full p-3 rounded-xl border flex items-center justify-between transition-all",
                          isSelected
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:bg-gray-50",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "p-2 rounded-lg",
                              isSelected
                                ? "bg-orange-500 text-white"
                                : "bg-gray-100",
                            )}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <span className="font-medium text-sm">
                              {role.value}
                            </span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              <span className="text-xs text-gray-500">
                                {role.popularity}%
                              </span>
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-5 h-5 text-orange-500" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Role */}
                <div className="mt-6 p-4 border rounded-2xl">
                  <div className="flex gap-2">
                    <Input
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      placeholder="Custom role (e.g., Harpist)..."
                      className="flex-1"
                    />
                    <Button
                      onClick={addCustomRole}
                      disabled={!customRole.trim()}
                      variant="outline"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4">
                {selectedRoles.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      No Roles Selected
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Go back and select roles to configure
                    </p>
                    <Button onClick={() => setView("select")} variant="outline">
                      Browse Roles
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedRoles.map((role) => (
                      <RoleCard key={role.role} role={role} />
                    ))}

                    {/* Budget Summary */}
                    <div className="mt-6 p-4 border rounded-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <h4 className="font-semibold">Budget Summary</h4>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowBudget(!showBudget)}
                        >
                          {showBudget ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center p-2 rounded-lg bg-gray-50">
                            <div className="text-xs text-gray-500">Roles</div>
                            <div className="text-xl font-bold">
                              {selectedRoles.length}
                            </div>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-gray-50">
                            <div className="text-xs text-gray-500">
                              Positions
                            </div>
                            <div className="text-xl font-bold">
                              {totalPositions}
                            </div>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-gray-50">
                            <div className="text-xs text-gray-500">
                              Max Apps
                            </div>
                            <div className="text-xl font-bold">
                              {totalMaxApplicants}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                          <div>
                            <div className="font-medium">Total Budget</div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              KES {totalBudget.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t p-4">
            {view === "select" ? (
              <Button
                onClick={() => setView("configure")}
                disabled={selectedRoles.length === 0}
                className="w-full h-12 bg-black hover:bg-gray-800 text-white font-semibold"
              >
                Configure {selectedRoles.length} Role
                {selectedRoles.length !== 1 ? "s" : ""}
                <ChevronLeft className="w-5 h-5 ml-2 rotate-180" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={selectedRoles.length === 0}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {selectedRoles.length === 0
                  ? "Select Roles First"
                  : `Create Band (${selectedRoles.length})`}
              </Button>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileBandSetupModal;
