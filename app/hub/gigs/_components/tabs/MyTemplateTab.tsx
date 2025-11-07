// app/hub/gigs/_components/tabs/MyTemplatesTab.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Trash2,
  Clock,
  Calendar,
  MapPin,
  DollarSign,
  Music,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { GigTemplate } from "@/convex/instantGigsTypes";

// In MyTemplatesTab.tsx - UPDATE INTERFACE
interface MyTemplatesTabProps {
  templates: GigTemplate[];
  onDeleteTemplate: (templateId: string) => Promise<void>;
  onRequestToBook: (musician: any) => void;
  isLoading: boolean;
  onStartEdit: (template: GigTemplate) => void; // CHANGED: Now takes template object
}

export const MyTemplatesTab: React.FC<MyTemplatesTabProps> = ({
  templates,
  onStartEdit,
  onDeleteTemplate,
  onRequestToBook,
  isLoading,
}) => {
  const { colors } = useThemeColors();

  if (templates.length === 0) {
    return (
      <div
        className={cn(
          "rounded-2xl p-12 text-center",
          colors.card,
          colors.border,
          "border"
        )}
      >
        <div className="w-24 h-24 mx-auto mb-4 text-gray-400">
          <Music className="w-full h-full" />
        </div>
        <h3 className={cn("text-xl font-bold mb-2", colors.text)}>
          No Templates Yet
        </h3>
        <p className={cn("mb-6", colors.textMuted)}>
          Create your first gig template to get started
        </p>
        <Button
          onClick={() =>
            onRequestToBook({ id: "browse", name: "Browse Musicians" })
          }
        >
          <Users className="w-4 h-4 mr-2" />
          Browse Musicians First
        </Button>
      </div>
    );
  }
  if (isLoading) {
    return (
      <div
        className={cn("rounded-2xl p-6", colors.card, colors.border, "border")}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-xl p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className={cn("text-xl font-bold", colors.text)}>
            My Templates ({templates.length})
          </h3>
          <p className={cn("text-sm", colors.textMuted)}>
            {templates.filter((t) => t.timesUsed && t.timesUsed > 0).length}{" "}
            templates used for bookings
          </p>
        </div>

        {/* Sort options instead of status filter */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Most Used
          </Button>
          <Button variant="outline" size="sm">
            Recently Created
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onEdit={() => onStartEdit(template)}
            onDelete={() => onDeleteTemplate(template.id)}
            onUse={() =>
              onRequestToBook({ id: "template", name: "Select Musician" })
            }
          />
        ))}
      </div>
    </div>
  );
};

const TemplateCard: React.FC<{
  template: GigTemplate;
  onEdit: () => void;
  onDelete: () => void;
  onUse: () => void;
}> = ({ template, onEdit, onDelete, onUse }) => {
  const { colors } = useThemeColors();

  return (
    <div
      className={cn(
        "border rounded-xl p-4 transition-all duration-200",
        colors.border
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{template.icon}</span>
          <div>
            <h4 className={cn("font-bold text-sm", colors.text)}>
              {template.title}
            </h4>
            <span
              className={cn(
                "text-xs px-2 py-1 rounded-full",
                status === "draft"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                  : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
              )}
            >
              {status === "draft" ? "Draft" : "Submitted"}
            </span>
          </div>
        </div>
        {status === "draft" && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="w-8 h-8"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="w-8 h-8"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Description */}
      <p className={cn("text-xs mb-3 line-clamp-2", colors.textMuted)}>
        {template.description}
      </p>

      {/* Details */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-3 h-3" />
          <span className={colors.textMuted}>
            {template.date || "Date not set"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-3 h-3" />
          <span className={colors.textMuted}>
            {template.venue || "Venue not set"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3" />
          <span className={colors.textMuted}>{template.duration}</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="w-3 h-3" />
          <span className={cn("font-medium", colors.text)}>
            {template.budget} KES
          </span>
        </div>
      </div>

      {/* Action Button */}
      {status === "draft" && (
        <Button onClick={onUse} className="w-full mt-3 text-sm" size="sm">
          <Users className="w-3 h-3 mr-1" />
          Use Template
        </Button>
      )}
    </div>
  );
};
