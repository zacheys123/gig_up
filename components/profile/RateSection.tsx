"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Plus,
  X,
  DollarSign,
  ChevronUp,
  ChevronDown,
  Check,
  Star,
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
    const [newCategory, setNewCategory] = useState({
      name: "",
      rate: "",
      rateType: "hourly",
      description: "",
    });

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
          <button onClick={() => setShowRates(!showRates)}>
            {showRates ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        }
        onClickHeader={() => setShowRates(!showRates)}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <TextInput
              label="Base Rate"
              value={rate.baseRate}
              onChange={(value) => handleRateInput(value ?? "", "baseRate")}
              Icon={<DollarSign size={16} />}
              placeholder="e.g., 5000 or 5k"
            />
            <p className={cn("text-xs mt-1", colors.textMuted)}>
              Accepts numbers, k (thousands), m (millions)
            </p>
          </div>

          <div>
            <SelectInput
              label="Rate Type"
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

          <div>
            <SelectInput
              label="Currency"
              value={rate.currency}
              onChange={(value) =>
                setRate((prev) => ({ ...prev, currency: value }))
              }
              options={currencyOptions}
            />
          </div>
        </div>

        {/* Rate Importance Banner */}
        {!hasAnyRates && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mb-4 p-4 rounded-lg border-2",
              colors.warningBg || "bg-amber-50 dark:bg-amber-950/20",
              colors.warningBorder || "border-amber-200 dark:border-amber-700"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Star
                  className={cn(
                    "h-5 w-5 mt-0.5",
                    colors.warningText || "text-amber-500"
                  )}
                />
              </div>
              <div className="flex-1">
                <h4
                  className={cn(
                    "font-semibold text-sm",
                    colors.warningText || "text-amber-800 dark:text-amber-300"
                  )}
                >
                  Boost Your Booking Chances
                </h4>
                <p
                  className={cn(
                    "text-xs mt-1",
                    colors.warningMuted || "text-amber-700 dark:text-amber-400"
                  )}
                >
                  Artists with rates get{" "}
                  <span className="font-bold">3x more bookings</span>. Clients
                  prefer clear pricing and are more likely to contact you.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {showRates && (
          <div className="space-y-6">
            {/* Success State when rates are added */}
            {hasAnyRates && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "p-3 rounded-lg border-2 border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-700"
                )}
              >
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-green-700 dark:text-green-300 text-sm font-medium">
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
                    className="text-xs bg-amber-500 hover:bg-amber-600 text-white"
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
                      "p-3 rounded-lg border flex items-center justify-between",
                      colors.card,
                      colors.border,
                      category.rate
                        ? "border-green-200 dark:border-green-800"
                        : "border-amber-200 dark:border-amber-800"
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className={cn("font-medium", colors.text)}>
                          {category.name}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            category.rate
                              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-300"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300"
                          )}
                        >
                          {category.rateType || rate.rateType}
                        </Badge>
                      </div>
                      {category.description && (
                        <p className={cn("text-xs mt-1", colors.textMuted)}>
                          {category.description}
                        </p>
                      )}
                      <p
                        className={cn(
                          "text-sm font-semibold mt-1",
                          category.rate
                            ? "text-green-600 dark:text-green-400"
                            : "text-amber-600 dark:text-amber-400"
                        )}
                      >
                        {category.rate
                          ? `${rate.currency} ${category.rate}`
                          : "Rate not set"}
                      </p>
                    </div>
                    <button
                      onClick={() => removeCategory(index)}
                      className="text-red-500 hover:text-red-600 ml-2"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}

                {rate.categories.length === 0 && (
                  <div
                    className={cn(
                      "p-6 text-center rounded-lg border-2 border-dashed",
                      colors.border
                    )}
                  >
                    <DollarSign className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className={cn("text-sm font-medium mb-1", colors.text)}>
                      No rate categories yet
                    </p>
                    <p className={cn("text-xs mb-3", colors.textMuted)}>
                      Add different rates for different types of gigs to attract
                      more clients
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={loadDefaultCategories}
                      className="mr-2"
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
                )}
              </div>
            </div>

            {/* Rate Modifiers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <TextInput
                  label="Travel Fee"
                  value={rate.travelFee}
                  onChange={(value) =>
                    setRate((prev) => ({ ...prev, travelFee: value ?? "" }))
                  }
                  placeholder="Additional travel cost"
                />
              )}
            </div>

            {/* Stats Section */}
            <div
              className={cn(
                "p-4 rounded-lg border",
                colors.card,
                colors.border
              )}
            >
              <h4 className={cn("text-sm font-semibold mb-2", colors.text)}>
                Why Rates Matter
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className={colors.textMuted}>
                    3x more booking requests
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className={colors.textMuted}>
                    Faster client decisions
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className={colors.textMuted}>
                    Professional appearance
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

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
