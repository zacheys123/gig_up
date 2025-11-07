// app/hub/gigs/_components/BookingModal.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  X,
  Star,
  Crown,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Music,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useThemeColors } from "@/hooks/useTheme";
import { GigTemplate } from "@/convex/instantGigsTypes";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  musician: any;
  templates: GigTemplate[];
  onSubmitBooking: (templateId: string) => void;
  isLoading: boolean;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  musician,
  templates,
  onSubmitBooking,
  isLoading,
}) => {
  const { colors } = useThemeColors();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedTemplateData = templates.find((t) => t.id === selectedTemplate);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={cn(
          "rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col",
          colors.card,
          colors.border,
          "border shadow-2xl"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className={cn("text-2xl font-bold", colors.text)}>
              Request to Book
            </h2>
            <p className={cn("text-sm", colors.textMuted)}>
              Select a template and send booking request to {musician?.name}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Left Column - Musician Info */}
            <div className="space-y-6">
              <div className={cn("rounded-xl p-6 border", colors.border)}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {musician?.name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={cn("font-bold text-lg", colors.text)}>
                        {musician?.name}
                      </h3>
                      {musician?.pro && (
                        <Crown className="w-5 h-5 text-amber-500" />
                      )}
                    </div>
                    <p className={cn("text-sm", colors.textMuted)}>
                      {musician?.instrument}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className={cn("text-sm font-medium", colors.text)}>
                        {musician?.rating} • {musician?.reviews} reviews
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={cn("text-sm", colors.textMuted)}>
                      Location:
                    </span>
                    <span className={cn("font-medium", colors.text)}>
                      {musician?.location}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={cn("text-sm", colors.textMuted)}>
                      Rate:
                    </span>
                    <span className={cn("font-bold text-lg", colors.text)}>
                      {musician?.rate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Available Templates */}
              <div>
                <h4 className={cn("font-bold mb-4", colors.text)}>
                  Select Template
                </h4>
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={cn(
                        "border rounded-xl p-4 cursor-pointer transition-all duration-200",
                        colors.border,
                        selectedTemplate === template.id
                          ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-500"
                          : cn(colors.hoverBg, "hover:border-blue-300")
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{template.icon}</span>
                        <div className="flex-1">
                          <h5 className={cn("font-medium", colors.text)}>
                            {template.title}
                          </h5>
                          <p className={cn("text-xs", colors.textMuted)}>
                            {template.duration} • {template.budget} KES
                          </p>
                        </div>
                        {selectedTemplate === template.id && (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {templates.length === 0 && (
                  <div
                    className={cn(
                      "text-center py-8 border-2 border-dashed rounded-xl",
                      colors.border
                    )}
                  >
                    <Music className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className={cn("text-sm", colors.textMuted)}>
                      No draft templates available. Create a template first.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Template Preview */}
            <div className="space-y-6">
              <h4 className={cn("font-bold", colors.text)}>Booking Summary</h4>

              {selectedTemplateData ? (
                <div
                  className={cn(
                    "rounded-xl p-6 border",
                    colors.border,
                    "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20"
                  )}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">
                      {selectedTemplateData.icon}
                    </span>
                    <h5 className={cn("font-bold text-lg", colors.text)}>
                      {selectedTemplateData.title}
                    </h5>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4" />
                      <div>
                        <div className={cn("text-xs", colors.textMuted)}>
                          Date
                        </div>
                        <div className={cn("font-medium", colors.text)}>
                          {selectedTemplateData.date || "To be confirmed"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4" />
                      <div>
                        <div className={cn("text-xs", colors.textMuted)}>
                          Venue
                        </div>
                        <div className={cn("font-medium", colors.text)}>
                          {selectedTemplateData.venue || "To be confirmed"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4" />
                      <div>
                        <div className={cn("text-xs", colors.textMuted)}>
                          Duration
                        </div>
                        <div className={cn("font-medium", colors.text)}>
                          {selectedTemplateData.duration}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <DollarSign className="w-4 h-4" />
                      <div>
                        <div className={cn("text-xs", colors.textMuted)}>
                          Budget
                        </div>
                        <div className={cn("font-bold text-lg", colors.text)}>
                          {selectedTemplateData.budget} KES
                        </div>
                      </div>
                    </div>

                    {selectedTemplateData.setlist && (
                      <div className="flex items-start gap-3">
                        <Music className="w-4 h-4 mt-1" />
                        <div>
                          <div className={cn("text-xs", colors.textMuted)}>
                            Setlist
                          </div>
                          <div className={cn("text-sm", colors.text)}>
                            {selectedTemplateData.setlist}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t">
                      <div className={cn("text-xs", colors.textMuted)}>
                        Description
                      </div>
                      <p className={cn("text-sm mt-1", colors.text)}>
                        {selectedTemplateData.description}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={cn(
                    "rounded-xl p-8 text-center border-2 border-dashed",
                    colors.border
                  )}
                >
                  <Music className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className={cn("text-sm", colors.textMuted)}>
                    Select a template to preview booking details
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    selectedTemplate && onSubmitBooking(selectedTemplate)
                  }
                  disabled={!selectedTemplate || isLoading}
                  className="flex-1 bg-amber-500 hover:bg-amber-600"
                >
                  {isLoading ? (
                    <>Sending Request...</>
                  ) : (
                    <>
                      <Star className="w-4 h-4 mr-2" />
                      Send Booking Request
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
