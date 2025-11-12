"use client";

import React, { useState } from "react";
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

    // Check if user can edit legacy fields
    const canEditLegacyFields = ["instrumentalist", "vocalist", "dj"].includes(
      roleType
    );

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

    const handleRateInput = (value: string, field: string) => {
      const cleanedValue = value.replace(/[^0-9km,.\s]/gi, "");
      setRate((prev) => ({ ...prev, [field]: cleanedValue }));
    };

    const addCategory = () => {
      if (newCategory.name && newCategory.rate) {
        setRate((prev) => ({
          ...prev,
          categories: [...prev.categories, { ...newCategory }],
        }));
        setNewCategory({
          name: "",
          rate: "",
          rateType: rate.rateType,
          description: "",
        });
        setShowCategoryModal(false);
      }
    };

    const removeCategory = (index: number) => {
      setRate((prev) => ({
        ...prev,
        categories: prev.categories.filter((_, i) => i !== index),
      }));
    };

    const getDefaultCategories = () => {
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
            description: "Group music lesson",
          },
          {
            name: "Workshop",
            rate: "",
            rateType: "daily",
            description: "Music workshop or masterclass",
          },
          {
            name: "Online Lesson",
            rate: "",
            rateType: "per_session",
            description: "Virtual music lesson",
          },
        ];
      } else if (roleType === "dj") {
        return [
          {
            name: "Club Night",
            rate: "",
            rateType: "hourly",
            description: "Nightclub or bar performance",
          },
          {
            name: "Wedding",
            rate: "",
            rateType: "per_gig",
            description: "Wedding reception DJ",
          },
          {
            name: "Corporate Event",
            rate: "",
            rateType: "per_gig",
            description: "Corporate function or party",
          },
          {
            name: "Festival",
            rate: "",
            rateType: "per_gig",
            description: "Music festival performance",
          },
        ];
      } else if (roleType === "mc") {
        return [
          {
            name: "Wedding MC",
            rate: "",
            rateType: "per_gig",
            description: "Wedding ceremony and reception",
          },
          {
            name: "Corporate MC",
            rate: "",
            rateType: "per_gig",
            description: "Corporate event hosting",
          },
          {
            name: "Award Show",
            rate: "",
            rateType: "per_gig",
            description: "Award ceremony hosting",
          },
          {
            name: "Product Launch",
            rate: "",
            rateType: "per_gig",
            description: "Product launch event",
          },
        ];
      } else if (roleType === "vocalist") {
        return [
          {
            name: "Wedding Performance",
            rate: "",
            rateType: "per_gig",
            description: "Wedding ceremony vocals",
          },
          {
            name: "Background Vocals",
            rate: "",
            rateType: "hourly",
            description: "Studio or live background vocals",
          },
          {
            name: "Lead Vocals",
            rate: "",
            rateType: "per_gig",
            description: "Band lead vocal performance",
          },
          {
            name: "Session Singer",
            rate: "",
            rateType: "hourly",
            description: "Recording session work",
          },
        ];
      } else {
        // Instrumentalist default
        return [
          {
            name: "Wedding Ceremony",
            rate: "",
            rateType: "per_gig",
            description: "Wedding ceremony performance",
          },
          {
            name: "Restaurant Gig",
            rate: "",
            rateType: "hourly",
            description: "Restaurant or cafe performance",
          },
          {
            name: "Corporate Event",
            rate: "",
            rateType: "per_gig",
            description: "Corporate function performance",
          },
          {
            name: "Session Musician",
            rate: "",
            rateType: "hourly",
            description: "Recording session work",
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

        {/* Rate Importance Banner */}
        {!hasAnyRates && (
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
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden space-y-6"
            >
              {/* Success State when rates are added */}
              {hasAnyRates && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
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
                      Great! Your rates will help attract more clients.
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Rate Categories */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className={cn("text-sm font-medium", colors.text)}>
                      Rate Categories
                    </Label>
                    <p className={cn("text-xs", colors.textMuted)}>
                      Different rates for different types of gigs
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={loadDefaultCategories}
                      className="text-xs"
                    >
                      Load Defaults
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setShowCategoryModal(true)}
                      className={cn(
                        "text-xs bg-amber-500 hover:bg-amber-600 text-white",
                        "transition-all duration-200"
                      )}
                    >
                      <Plus size={14} className="mr-1" /> Add Category
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {rate.categories.map((category, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "p-4 rounded-xl border flex items-center justify-between group",
                        colors.card,
                        colors.border,
                        "transition-all duration-200 hover:shadow-md",
                        category.rate
                          ? cn(
                              "border-green-200 dark:border-green-800",
                              colors.successBorder
                            )
                          : cn(
                              "border-amber-200 dark:border-amber-800",
                              colors.warningBorder
                            )
                      )}
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
                                    "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-300",
                                    colors.successBg,
                                    colors.successText
                                  )
                                : cn(
                                    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300",
                                    colors.warningBg,
                                    colors.warningText
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
                              ? cn(
                                  "text-green-600 dark:text-green-400",
                                  colors.successText
                                )
                              : cn(
                                  "text-amber-600 dark:text-amber-400",
                                  colors.warningText
                                )
                          )}
                        >
                          {category.rate
                            ? `${rate.currency} ${category.rate}`
                            : "Rate not set"}
                        </p>
                      </div>
                      <button
                        onClick={() => removeCategory(index)}
                        className={cn(
                          "p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200",
                          colors.hoverBg,
                          "text-red-500 hover:text-red-600"
                        )}
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))}

                  {rate.categories.length === 0 && (
                    <div
                      className={cn(
                        "p-8 text-center rounded-xl border-2 border-dashed",
                        colors.border,
                        "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
                      )}
                    >
                      <DollarSign
                        className={cn(
                          "h-12 w-12 mx-auto mb-3",
                          colors.textMuted
                        )}
                      />
                      <p
                        className={cn("text-sm font-medium mb-2", colors.text)}
                      >
                        No rate categories yet
                      </p>
                      <p className={cn("text-xs mb-4", colors.textMuted)}>
                        Add different rates for different types of gigs to
                        attract more clients
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={loadDefaultCategories}
                        >
                          Load Default Categories
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => setShowCategoryModal(true)}
                          className="bg-amber-500 hover:bg-amber-600 text-white"
                        >
                          <Plus size={14} className="mr-1" /> Create Custom
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Section */}
              <div
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
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", colors.successBg)}>
                      <Users className={cn("h-4 w-4", colors.successText)} />
                    </div>
                    <div>
                      <p className={cn("font-medium", colors.text)}>
                        3x More Bookings
                      </p>
                      <p className={colors.textMuted}>
                        Artists with rates get more requests
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", colors.infoBg)}>
                      <Clock className={cn("h-4 w-4", colors.infoText)} />
                    </div>
                    <div>
                      <p className={cn("font-medium", colors.text)}>
                        Faster Decisions
                      </p>
                      <p className={colors.textMuted}>
                        Clients book faster with clear pricing
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", colors.warningBg)}>
                      <Star className={cn("h-4 w-4", colors.warningText)} />
                    </div>
                    <div>
                      <p className={cn("font-medium", colors.text)}>
                        Professional
                      </p>
                      <p className={colors.textMuted}>
                        Builds trust and credibility
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Category Modal */}
        <Modal
          isOpen={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          title="Add Rate Category"
        >
          <div className="space-y-4">
            <TextInput
              label="Category Name"
              value={newCategory.name}
              onChange={(value) =>
                setNewCategory((prev) => ({ ...prev, name: value ?? "" }))
              }
              placeholder="e.g., Private Lesson, Wedding Performance"
            />

            <TextInput
              label="Rate Amount"
              value={newCategory.rate}
              onChange={(value) =>
                setNewCategory((prev) => ({ ...prev, rate: value ?? "" }))
              }
              placeholder="e.g., 5000"
            />

            <SelectInput
              label="Rate Type"
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

            <TextInput
              label="Description (Optional)"
              value={newCategory.description}
              onChange={(value) =>
                setNewCategory((prev) => ({
                  ...prev,
                  description: value ?? "",
                }))
              }
              placeholder="Brief description of this service"
            />
          </div>
          <ModalActions
            onCancel={() => setShowCategoryModal(false)}
            onConfirm={addCategory}
            confirmText="Add Category"
          />
        </Modal>
      </SectionContainer>
    );
  }
);

RateSection.displayName = "RateSection";
