"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Plus,
  X,
  DollarSign,
  ChevronUp,
  ChevronDown,
  Check,
  Star,
  Settings,
  Zap,
  TrendingUp,
  Users,
  Clock,
} from "lucide-react";
import { SectionContainer } from "./SectionContainer";
import { TextInput } from "./TextInput";
import { SelectInput } from "./SelectInput";
import { ToggleSwitch } from "./ToggleSwitch";
import { ModalActions } from "./ModalActions";
import { Modal } from "./Modal";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface RateCategory {
  name: string;
  rate: string;
  rateType?: string;
  description?: string;
}

interface RateProps {
  baseRate: string;
  rateType:
    | "hourly"
    | "daily"
    | "per_session"
    | "per_gig"
    | "monthly"
    | "custom";
  currency: string;
  categories: RateCategory[];
  negotiable: boolean;
  depositRequired: boolean;
  travelIncluded: boolean;
  travelFee: string;
  regular: string;
  function: string;
  concert: string;
  corporate: string;
}

interface RateSectionProps {
  rate: RateProps;
  setRate: React.Dispatch<React.SetStateAction<RateProps>>;
  roleType: string;
  colors: any;
  showRates: boolean;
  setShowRates: React.Dispatch<React.SetStateAction<boolean>>;
}

const currencyOptions = [
  { value: "KES", label: "KES - Kenyan Shilling" },
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
];

export const RateSection: React.FC<RateSectionProps> = React.memo(
  ({ rate, setRate, roleType, colors, showRates, setShowRates }) => {
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
    const [newCategory, setNewCategory] = useState({
      name: "",
      rate: "",
      rateType: "hourly",
      description: "",
    });

    // Track if we have database categories
    const [hasDatabaseCategories, setHasDatabaseCategories] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);

    useEffect(() => {
      // Only run once when component mounts
      if (!hasInitialized) {
        console.log("🔄 RateSection initialization:", {
          categoriesCount: rate.categories.length,
          categories: rate.categories,
          hasRates: rate.categories.some((cat) => cat.rate?.trim()),
        });

        // If rate has categories from database, show the rates section
        if (rate.categories.length > 0) {
          setShowRates(true);
          setHasDatabaseCategories(true);
        }
        setHasInitialized(true);
      }
    }, [rate.categories.length, hasInitialized, setShowRates]);

    // Check if user can edit legacy fields
    const canEditLegacyFields = ["instrumentalist", "vocalist", "dj"].includes(
      roleType
    );
    const [editingCategory, setEditingCategory] = useState<number | null>(null);

    // Check if any rates are set
    const hasAnyRates =
      rate.baseRate?.trim() ||
      rate.categories.some((cat) => cat.rate?.trim()) ||
      Object.values({
        regular: rate.regular,
        function: rate.function,
        concert: rate.concert,
        corporate: rate.corporate,
      }).some((value) => value?.trim());

    // Check if we have database categories with rates
    const hasDatabaseRates = rate.categories.some((cat) => cat.rate?.trim());

    const handleRateInput = (value: string, field: string) => {
      const cleanedValue = value.replace(/[^0-9km,.\s]/gi, "");
      setRate((prev) => ({ ...prev, [field]: cleanedValue }));
    };

    const saveCategory = () => {
      if (newCategory.name && newCategory.rate) {
        if (editingCategory !== null) {
          // Update existing category
          setRate((prev) => ({
            ...prev,
            categories: prev.categories.map((cat, index) =>
              index === editingCategory ? { ...newCategory } : cat
            ),
          }));
          setEditingCategory(null);
        } else {
          // Add new category
          setRate((prev) => ({
            ...prev,
            categories: [...prev.categories, { ...newCategory }],
          }));
        }

        // Reset form
        setNewCategory({
          name: "",
          rate: "",
          rateType: rate.rateType,
          description: "",
        });
        setShowCategoryModal(false);
      }
    };

    const editCategory = (index: number) => {
      const category = rate.categories[index];
      setNewCategory({
        name: category.name,
        rate: category.rate,
        rateType: category.rateType || rate.rateType,
        description: category.description || "",
      });
      setEditingCategory(index);
      setShowCategoryModal(true);
    };

    const handleAddCategory = () => {
      setEditingCategory(null);
      setNewCategory({
        name: "",
        rate: "",
        rateType: rate.rateType,
        description: "",
      });
      setShowCategoryModal(true);
    };

    const handleCreateCustom = () => {
      setEditingCategory(null);
      setNewCategory({
        name: "",
        rate: "",
        rateType: rate.rateType,
        description: "",
      });
      setShowCategoryModal(true);
    };

    const removeCategory = (index: number) => {
      setRate((prev) => ({
        ...prev,
        categories: prev.categories.filter((_, i) => i !== index),
      }));
    };

    const getDefaultCategories = () => {
      // Common categories for all performance roles
      const commonPerformanceCategories = [
        {
          name: "💒 Wedding",
          rate: "",
          rateType: "per_gig",
          description: "Wedding ceremony and reception performance",
        },
        {
          name: "🏢 Corporate Event",
          rate: "",
          rateType: "per_gig",
          description: "Corporate function, team building, or office party",
        },
        {
          name: "🎉 Private Party",
          rate: "",
          rateType: "per_gig",
          description: "Birthday, anniversary, or private celebration",
        },
        {
          name: "🎤 Concert/Show",
          rate: "",
          rateType: "per_gig",
          description: "Live concert or showcase performance",
        },
      ];

      if (roleType === "teacher") {
        return [
          {
            name: "Private Lesson",
            rate: "",
            rateType: "per_session",
            description: "One-on-one private music lesson",
          },
          {
            name: "Group Class",
            rate: "",
            rateType: "per_session",
            description: "Group music lesson with multiple students",
          },
          {
            name: "Online Lesson",
            rate: "",
            rateType: "per_session",
            description: "Virtual music lesson via video call",
          },
          {
            name: "Workshop",
            rate: "",
            rateType: "daily",
            description: "Music workshop or masterclass",
          },
          {
            name: "Exam Preparation",
            rate: "",
            rateType: "per_session",
            description: "Music exam or audition preparation",
          },
        ];
      } else if (roleType === "dj") {
        return [
          ...commonPerformanceCategories,
          {
            name: "🎭 Club Night",
            rate: "",
            rateType: "hourly",
            description: "Nightclub, bar, or lounge DJ set",
          },
          {
            name: "🎪 Festival",
            rate: "",
            rateType: "per_gig",
            description: "Music festival or large outdoor event",
          },
          {
            name: "🍽️ Restaurant/Lounge",
            rate: "",
            rateType: "hourly",
            description: "Background music for dining establishments",
          },
          {
            name: "✨ Private Event",
            rate: "",
            rateType: "per_gig",
            description: "Exclusive private party or VIP event",
          },
        ];
      } else if (roleType === "mc") {
        return [
          ...commonPerformanceCategories,
          {
            name: "🎤 Award Show",
            rate: "",
            rateType: "per_gig",
            description: "Award ceremony or recognition event hosting",
          },
          {
            name: "🚀 Product Launch",
            rate: "",
            rateType: "per_gig",
            description: "New product or service launch event",
          },
          {
            name: "⛪ Church Service",
            rate: "",
            rateType: "per_gig",
            description: "Church event or religious ceremony hosting",
          },
          {
            name: "🎓 Graduation",
            rate: "",
            rateType: "per_gig",
            description: "Graduation ceremony or academic event",
          },
        ];
      } else if (roleType === "vocalist") {
        return [
          ...commonPerformanceCategories,
          {
            name: "🎹 Recording Session",
            rate: "",
            rateType: "hourly",
            description: "Studio recording session work",
          },
          {
            name: "🎤 Background Vocals",
            rate: "",
            rateType: "hourly",
            description: "Studio or live background vocals",
          },
          {
            name: "✨ Solo Performance",
            rate: "",
            rateType: "per_gig",
            description: "Featured solo vocal performance",
          },
          {
            name: "⛪ Church Service",
            rate: "",
            rateType: "per_gig",
            description: "Worship leading or church performance",
          },
          {
            name: "💍 Ceremony Music",
            rate: "",
            rateType: "per_gig",
            description: "Wedding ceremony vocals specifically",
          },
        ];
      } else if (roleType === "instrumentalist") {
        return [
          ...commonPerformanceCategories,
          {
            name: "🍽️ Restaurant/Lounge",
            rate: "",
            rateType: "hourly",
            description: "Background music for dining venues",
          },
          {
            name: "🎹 Recording Session",
            rate: "",
            rateType: "hourly",
            description: "Studio recording session work",
          },
          {
            name: "⛪ Church Service",
            rate: "",
            rateType: "per_gig",
            description: "Church worship team or special music",
          },
          {
            name: "🎭 Club Performance",
            rate: "",
            rateType: "hourly",
            description: "Live instrumental performance at venues",
          },
          {
            name: "🚀 Session Musician",
            rate: "",
            rateType: "hourly",
            description: "Live or recording session work",
          },
          {
            name: "🎼 Orchestral Gig",
            rate: "",
            rateType: "per_gig",
            description: "Orchestra or ensemble performance",
          },
        ];
      } else {
        // Default for other roles
        return [
          ...commonPerformanceCategories,
          {
            name: "🍽️ Restaurant/Lounge",
            rate: "",
            rateType: "hourly",
            description: "Venue performance",
          },
          {
            name: "🎹 Recording Session",
            rate: "",
            rateType: "hourly",
            description: "Studio work",
          },
          {
            name: "✨ Other Event",
            rate: "",
            rateType: "per_gig",
            description: "Custom or special event type",
          },
        ];
      }
    };

    const loadDefaultCategories = () => {
      const defaultCategories = getDefaultCategories();
      setRate((prev) => ({
        ...prev,
        categories: defaultCategories,
      }));
      setHasDatabaseCategories(false); // User is now using defaults
    };

    return (
      <SectionContainer
        icon={<DollarSign size={18} />}
        title={roleType === "teacher" ? "Teaching Rates" : "Performance Rates"}
        data-field="rates"
        action={
          <button
            onClick={() => setShowRates(!showRates)}
            className={cn("p-1 rounded-lg transition-colors", colors.hoverBg)}
          >
            {showRates ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        }
        onClickHeader={() => setShowRates(!showRates)}
      >
        {/* Main Rate Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className={cn("text-sm font-medium", colors.text)}>
              Base Rate
            </Label>
            <div className="relative">
              <TextInput
                value={rate.baseRate}
                onChange={(value) => handleRateInput(value ?? "", "baseRate")}
                placeholder="5000 or 5k"
                className="pl-8"
              />
              <DollarSign
                className={cn(
                  "absolute left-3 top-3 h-4 w-4",
                  colors.textMuted
                )}
              />
            </div>
            <p className={cn("text-xs", colors.textMuted)}>
              Numbers, k (thousands), m (millions)
            </p>
          </div>

          <div className="space-y-2">
            <Label className={cn("text-sm font-medium", colors.text)}>
              Rate Type
            </Label>
            <SelectInput
              value={rate.rateType}
              onChange={(value) =>
                setRate((prev) => ({ ...prev, rateType: value as any }))
              }
              options={[
                { value: "hourly", label: "Per Hour" },
                { value: "daily", label: "Per Day" },
                { value: "per_session", label: "Per Session" },
                { value: "per_gig", label: "Per Gig" },
                { value: "monthly", label: "Per Month" },
                { value: "custom", label: "Custom" },
              ]}
            />
          </div>

          <div className="space-y-2">
            <Label className={cn("text-sm font-medium", colors.text)}>
              Currency
            </Label>
            <SelectInput
              value={rate.currency}
              onChange={(value) =>
                setRate((prev) => ({ ...prev, currency: value }))
              }
              options={currencyOptions}
            />

            {/* Advanced Settings Toggle */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className={cn(
                "w-full mt-2 text-xs transition-all duration-200",
                colors.border,
                showAdvancedSettings
                  ? cn(
                      "bg-amber-50 border-amber-200 text-amber-700",
                      colors.warningBg,
                      colors.warningText
                    )
                  : cn(
                      "text-amber-600 border-amber-200 hover:bg-amber-50",
                      colors.text,
                      colors.hoverBg
                    )
              )}
            >
              <Settings size={12} className="mr-1" />
              {showAdvancedSettings ? "Hide Options" : "More Options"}
            </Button>
          </div>
        </div>

        {/* Advanced Settings Section */}
        <AnimatePresence>
          {showAdvancedSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div
                className={cn(
                  "mt-4 p-4 rounded-xl border",
                  colors.card,
                  colors.border,
                  "bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/10 dark:to-orange-950/5"
                )}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Settings size={16} className={colors.warningText} />
                  <h4 className={cn("text-sm font-semibold", colors.text)}>
                    Rate Settings
                  </h4>
                </div>

                {/* Rate Modifiers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <ToggleSwitch
                    label="Negotiable Rates"
                    checked={rate.negotiable}
                    onChange={(checked) =>
                      setRate((prev) => ({ ...prev, negotiable: checked }))
                    }
                    description="Clients can negotiate prices"
                  />

                  <ToggleSwitch
                    label="Deposit Required"
                    checked={rate.depositRequired}
                    onChange={(checked) =>
                      setRate((prev) => ({ ...prev, depositRequired: checked }))
                    }
                    description="Require deposit for bookings"
                  />

                  <ToggleSwitch
                    label="Travel Included"
                    checked={rate.travelIncluded}
                    onChange={(checked) =>
                      setRate((prev) => ({ ...prev, travelIncluded: checked }))
                    }
                    description="Travel costs included in rate"
                  />

                  {!rate.travelIncluded && (
                    <div className="space-y-2">
                      <Label className={cn("text-sm font-medium", colors.text)}>
                        Travel Fee
                      </Label>
                      <TextInput
                        value={rate.travelFee}
                        onChange={(value) =>
                          setRate((prev) => ({
                            ...prev,
                            travelFee: value ?? "",
                          }))
                        }
                        placeholder="Additional travel cost"
                      />
                    </div>
                  )}
                </div>

                {/* Legacy Rate Fields (Conditional) */}
                {canEditLegacyFields && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-t pt-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Clock size={14} className={colors.textMuted} />
                      <h5 className={cn("text-sm font-medium", colors.text)}>
                        Event-Specific Rates
                      </h5>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label
                          className={cn("text-xs font-medium", colors.text)}
                        >
                          Regular Events
                        </Label>
                        <TextInput
                          value={rate.regular}
                          onChange={(value) =>
                            handleRateInput(value ?? "", "regular")
                          }
                          placeholder="Standard rate"
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          className={cn("text-xs font-medium", colors.text)}
                        >
                          Functions
                        </Label>
                        <TextInput
                          value={rate.function}
                          onChange={(value) =>
                            handleRateInput(value ?? "", "function")
                          }
                          placeholder="Function rate"
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          className={cn("text-xs font-medium", colors.text)}
                        >
                          Concerts
                        </Label>
                        <TextInput
                          value={rate.concert}
                          onChange={(value) =>
                            handleRateInput(value ?? "", "concert")
                          }
                          placeholder="Concert rate"
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          className={cn("text-xs font-medium", colors.text)}
                        >
                          Corporate
                        </Label>
                        <TextInput
                          value={rate.corporate}
                          onChange={(value) =>
                            handleRateInput(value ?? "", "corporate")
                          }
                          placeholder="Corporate rate"
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State when no categories */}
        {rate.categories.length === 0 && !showRates && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mt-4 p-4 rounded-xl border-2 border-dashed text-center cursor-pointer",
              colors.border,
              colors.hoverBg,
              "transition-all duration-200 hover:shadow-md"
            )}
            onClick={() => setShowRates(!showRates)}
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className={cn("p-2 rounded-full", colors.warningBg)}>
                {showRates ? (
                  <ChevronUp className={cn("h-5 w-5", colors.warningText)} />
                ) : (
                  <Plus className={cn("h-5 w-5", colors.warningText)} />
                )}
              </div>
              <div className="text-left">
                <h4 className={cn("font-semibold text-sm", colors.text)}>
                  {showRates
                    ? "Hide Rate Categories"
                    : "Create Rate Categories"}
                </h4>
                <p className={cn("text-xs", colors.textMuted)}>
                  {showRates
                    ? "Collapse the rate categories section"
                    : "Add different rates for weddings, corporate events, concerts, and more"}
                </p>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowRates(!showRates);
              }}
              className={cn(
                "mt-2 bg-amber-500 hover:bg-amber-600 text-white",
                "transition-all duration-200"
              )}
            >
              {showRates ? (
                <>
                  <ChevronUp size={14} className="mr-1" />
                  Hide Categories
                </>
              ) : (
                <>
                  <Plus size={14} className="mr-1" />
                  Setup Rate Categories
                </>
              )}
            </Button>
          </motion.div>
        )}

        {/* Rate Importance Banner */}
        {!hasAnyRates && !showRates && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mb-4 p-4 rounded-xl border-2",
              colors.warningBg,
              colors.warningBorder,
              "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/10"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn("p-2 rounded-lg", colors.warningBg)}>
                <Zap className={cn("h-5 w-5", colors.warningText)} />
              </div>
              <div className="flex-1">
                <h4
                  className={cn(
                    "font-semibold text-sm mb-1",
                    colors.warningText
                  )}
                >
                  Boost Your Booking Chances
                </h4>
                <p className={cn("text-xs", colors.textMuted)}>
                  Artists with rates get{" "}
                  <span className="font-bold text-amber-700 dark:text-amber-300">
                    3x more bookings
                  </span>
                  . Clients prefer clear pricing and are more likely to contact
                  you.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {showRates && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{
                opacity: 1,
                height: "auto",
                scale: 1,
              }}
              exit={{
                opacity: 0,
                height: "auto",
                scale: 0.95,
              }}
              transition={{
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1],
                height: { duration: 0.3 },
                opacity: { duration: 0.2 },
              }}
              className="overflow-hidden space-y-6"
            >
              {/* Success State when rates are added */}
              {hasAnyRates && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className={cn(
                    "p-3 rounded-xl border-2",
                    colors.successBg,
                    colors.successBorder
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn("p-1 rounded-full", colors.successBg)}>
                      <Check className={cn("h-4 w-4", colors.successText)} />
                    </div>
                    <span
                      className={cn("text-sm font-medium", colors.successText)}
                    >
                      {hasDatabaseCategories
                        ? "Your rates are loaded from your profile"
                        : "Great! Your rates will help attract more clients."}
                    </span>
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className={cn("text-sm font-medium", colors.text)}>
                      Rate Categories
                    </Label>
                    <p className={cn("text-xs", colors.textMuted)}>
                      {hasDatabaseCategories
                        ? "Your existing rate categories from your profile"
                        : "Different rates for different types of gigs"}
                    </p>
                  </div>

                  {/* Conditional Header Buttons */}
                  {rate.categories.length > 0 && (
                    <motion.div
                      className="flex gap-2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                    >
                      {/* Only show Load Defaults if we don't have database categories */}
                      {!hasDatabaseCategories && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={loadDefaultCategories}
                          className={cn(
                            "text-xs transition-all duration-200",
                            colors.border,
                            colors.text,
                            colors.hoverBg
                          )}
                        >
                          Load Defaults
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddCategory}
                        className={cn(
                          "text-xs bg-amber-500 hover:bg-amber-600 text-white",
                          "transition-all duration-200"
                        )}
                      >
                        <Plus size={14} className="mr-1" /> Add Category
                      </Button>
                    </motion.div>
                  )}
                </div>

                <div className="space-y-3">
                  {rate.categories.map((category, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        delay: 0.1 + index * 0.05,
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                      className={cn(
                        "p-4 rounded-xl border flex items-center justify-between group transition-all duration-200 cursor-pointer",
                        colors.card,
                        colors.border,
                        "hover:shadow-md hover:scale-[1.02]",
                        category.rate
                          ? cn(colors.successBorder)
                          : cn(colors.warningBorder)
                      )}
                      onClick={() => editCategory(index)}
                      whileHover={{ y: -2 }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={cn("font-medium", colors.text)}>
                            {category.name}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs font-medium",
                              category.rate
                                ? cn(
                                    colors.successBg,
                                    colors.successText,
                                    colors.successBorder
                                  )
                                : cn(
                                    colors.warningBg,
                                    colors.warningText,
                                    colors.warningBorder
                                  )
                            )}
                          >
                            {category.rateType || rate.rateType}
                          </Badge>
                        </div>
                        {category.description && (
                          <p className={cn("text-xs mb-2", colors.textMuted)}>
                            {category.description}
                          </p>
                        )}
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            category.rate
                              ? cn(colors.successText)
                              : cn(colors.warningText)
                          )}
                        >
                          {category.rate
                            ? `${rate.currency} ${category.rate}`
                            : "Click to set rate"}
                        </p>
                      </div>
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCategory(index);
                        }}
                        className={cn(
                          "p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200",
                          colors.hoverBg,
                          colors.destructive,
                          colors.destructiveHover
                        )}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X size={14} />
                      </motion.button>
                    </motion.div>
                  ))}

                  {rate.categories.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      className={cn(
                        "p-8 text-center rounded-xl border-2 border-dashed",
                        colors.border,
                        colors.card
                      )}
                    >
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                      >
                        <DollarSign
                          className={cn(
                            "h-12 w-12 mx-auto mb-3",
                            colors.textMuted
                          )}
                        />
                      </motion.div>
                      <motion.p
                        className={cn("text-sm font-medium mb-2", colors.text)}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.25, duration: 0.3 }}
                      >
                        No rate categories yet
                      </motion.p>
                      <motion.p
                        className={cn("text-xs mb-4", colors.textMuted)}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                      >
                        Add different rates for different types of gigs to
                        attract more clients
                      </motion.p>
                      <motion.div
                        className="flex gap-2 justify-center"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.35, duration: 0.3 }}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={loadDefaultCategories}
                          className={cn(
                            "transition-all duration-200",
                            colors.border,
                            colors.text,
                            colors.hoverBg
                          )}
                        >
                          Load Default Categories
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleCreateCustom}
                          className={cn(
                            "bg-amber-500 hover:bg-amber-600 text-white transition-all duration-200"
                          )}
                        >
                          <Plus size={14} className="mr-1" /> Create Custom
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Stats Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className={cn(
                  "p-4 rounded-xl border",
                  colors.card,
                  colors.border,
                  "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/10"
                )}
              >
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={16} className={colors.infoText} />
                  <h4 className={cn("text-sm font-semibold", colors.text)}>
                    Why Rates Matter
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {[
                    {
                      icon: Users,
                      text: "3x More Bookings",
                      desc: "Artists with rates get more requests",
                    },
                    {
                      icon: Clock,
                      text: "Faster Decisions",
                      desc: "Clients book faster with clear pricing",
                    },
                    {
                      icon: Star,
                      text: "Professional",
                      desc: "Builds trust and credibility",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                    >
                      <div
                        className={cn(
                          "p-2 rounded-lg",
                          index === 0
                            ? colors.successBg
                            : index === 1
                              ? colors.infoBg
                              : colors.warningBg
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-4 w-4",
                            index === 0
                              ? colors.successText
                              : index === 1
                                ? colors.infoText
                                : colors.warningText
                          )}
                        />
                      </div>
                      <div>
                        <p className={cn("font-medium", colors.text)}>
                          {item.text}
                        </p>
                        <p className={colors.textMuted}>{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Modal
          isOpen={showCategoryModal}
          onClose={() => {
            setShowCategoryModal(false);
            setEditingCategory(null);
            setNewCategory({
              name: "",
              rate: "",
              rateType: rate.rateType,
              description: "",
            });
          }}
          title={editingCategory !== null ? "Edit Rate" : "Add Rate Category"}
        >
          <div className="space-y-4">
            <TextInput
              label="Category Name"
              value={newCategory.name}
              onChange={(value) =>
                setNewCategory((prev) => ({ ...prev, name: value ?? "" }))
              }
              placeholder="e.g., Wedding, Corporate Event, Private Party"
              disabled={editingCategory !== null}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={cn("text-sm font-medium", colors.text)}>
                  Rate Amount
                </Label>
                <TextInput
                  value={newCategory.rate}
                  onChange={(value) =>
                    setNewCategory((prev) => ({ ...prev, rate: value ?? "" }))
                  }
                  placeholder="5000"
                />
              </div>

              <div className="space-y-2">
                <Label className={cn("text-sm font-medium", colors.text)}>
                  Rate Type
                </Label>
                <SelectInput
                  value={newCategory.rateType}
                  onChange={(value) =>
                    setNewCategory((prev) => ({
                      ...prev,
                      rateType: value as typeof prev.rateType,
                    }))
                  }
                  options={[
                    { value: "hourly", label: "Per Hour" },
                    { value: "daily", label: "Per Day" },
                    { value: "per_session", label: "Per Session" },
                    { value: "per_gig", label: "Per Gig" },
                    { value: "monthly", label: "Per Month" },
                    { value: "custom", label: "Custom" },
                  ]}
                />
              </div>
            </div>

            <TextInput
              label="Description (Optional)"
              value={newCategory.description}
              onChange={(value) =>
                setNewCategory((prev) => ({
                  ...prev,
                  description: value ?? "",
                }))
              }
              placeholder="Brief description of this service or event type"
            />
          </div>
          <ModalActions
            onCancel={() => {
              setShowCategoryModal(false);
              setEditingCategory(null);
              setNewCategory({
                name: "",
                rate: "",
                rateType: rate.rateType,
                description: "",
              });
            }}
            onConfirm={saveCategory}
            confirmText={
              editingCategory !== null ? "Update Rate" : "Add Category"
            }
          />
        </Modal>
      </SectionContainer>
    );
  }
);

RateSection.displayName = "RateSection";
