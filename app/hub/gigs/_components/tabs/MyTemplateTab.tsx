// app/hub/gigs/_components/tabs/MyTemplatesTab.tsx - UPDATED
"use client";

import React, { useMemo, memo, useCallback } from "react";
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
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import { GigTemplate } from "@/convex/instantGigsTypes";

interface MyTemplatesTabProps {
  templates: GigTemplate[];
  onDeleteTemplate: (templateId: string) => Promise<void>;
  onRequestToBook: (musician: any) => void;
  isLoading: boolean;
  isRefetching: boolean;
  error?: string | null;
  onStartEdit: (template: GigTemplate) => void;
  refetchTemplates: () => Promise<void>;
  clearError?: () => void;
}

const TemplateCard = memo(
  ({
    template,
    onEdit,
    onDelete,
    onUse,
    isRefetching = false,
  }: {
    template: GigTemplate;
    onEdit: () => void;
    onDelete: () => void;
    onUse: () => void;
    isRefetching?: boolean;
  }) => {
    const { colors } = useThemeColors();

    return (
      <div
        className={cn(
          "border rounded-xl p-4 transition-all duration-200 hover:shadow-lg relative",
          colors.border,
          colors.card,
          isRefetching && "opacity-60 pointer-events-none"
        )}
      >
        {/* Refreshing Overlay */}
        {isRefetching && (
          <div className="absolute inset-0 bg-white/50 dark:bg-black/50 rounded-xl flex items-center justify-center z-10">
            <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        )}

        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{template.icon}</span>
            <div>
              <h4 className={cn("font-bold text-sm", colors.text)}>
                {template.title}
              </h4>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="w-8 h-8"
              disabled={isRefetching}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="w-8 h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
              disabled={isRefetching}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <p className={cn("text-xs mb-3 line-clamp-2", colors.textMuted)}>
          {template.description}
        </p>

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
            <span className={colors.textMuted}>{template.fromTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-3 h-3" />
            <span className={cn("font-medium", colors.text)}>
              {template.budget} KES
            </span>
          </div>
        </div>

        <Button
          onClick={onUse}
          className={
            "w-full mt-3 text-sm  hover:scale-105 transition-transform duration-250   " +
            " " +
            colors.warningText +
            " " +
            colors.hoverBg
          }
          size="sm"
          disabled={isRefetching}
          variant="outline"
        >
          <Users className="w-3 h-3 mr-1" />
          {isRefetching ? "Refreshing..." : "Use Template"}
        </Button>
      </div>
    );
  }
);

TemplateCard.displayName = "TemplateCard";

const TemplateSkeleton = memo(() => (
  <div className="animate-pulse space-y-4">
    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-xl p-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-8 bg-gray-200 rounded mt-2"></div>
        </div>
      ))}
    </div>
  </div>
));

TemplateSkeleton.displayName = "TemplateSkeleton";

const EmptyState = memo(
  ({ onRequestToBook, colors, onRefresh, isRefetching, isLoading }: any) => (
    <div
      className={cn(
        "rounded-2xl p-12 text-center relative",
        colors.card,
        colors.border,
        "border"
      )}
    >
      {isRefetching && (
        <div className="absolute inset-0 bg-white/50 dark:bg-black/50 rounded-2xl flex items-center justify-center z-10">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}

      <div className="w-24 h-24 mx-auto mb-4 text-gray-400">
        <Music className="w-full h-full" />
      </div>
      <h3 className={cn("text-xl font-bold mb-2", colors.text)}>
        {isRefetching ? "Refreshing Templates..." : "No Templates Yet"}
      </h3>
      <p className={cn("mb-6", colors.textMuted)}>
        {isRefetching
          ? "Fetching your latest templates..."
          : "Create your first gig template to get started"}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={() => onRequestToBook(null)} // Pass null instead of fake data
          disabled={isRefetching || isLoading}
        >
          <Users className="w-4 h-4 mr-2" />
          Browse Musicians First
        </Button>
        <Button
          onClick={onRefresh}
          variant="outline"
          disabled={isRefetching || isLoading}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isRefetching ? "animate-spin" : ""}`}
          />
          {isRefetching ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
    </div>
  )
);

EmptyState.displayName = "EmptyState";

const ErrorState = memo(({ error, onRetry, onClear, colors }: any) => (
  <div
    className={cn(
      "rounded-2xl p-6 border-2 border-red-200 dark:border-red-800",
      colors.card
    )}
  >
    <div className="flex items-center gap-3 mb-4">
      <AlertCircle className="w-6 h-6 text-red-500" />
      <h3 className={cn("text-lg font-bold", colors.text)}>
        Error Loading Templates
      </h3>
    </div>
    <p className={cn("text-sm mb-4", colors.textMuted)}>{error}</p>
    <div className="flex gap-3">
      <Button onClick={onRetry} variant="outline" size="sm">
        <RefreshCw className="w-4 h-4 mr-2" />
        Try Again
      </Button>
      <Button onClick={onClear} variant="ghost" size="sm">
        Dismiss
      </Button>
    </div>
  </div>
));

ErrorState.displayName = "ErrorState";

export const MyTemplatesTab: React.FC<MyTemplatesTabProps> = memo(
  ({
    templates,
    onStartEdit,
    onDeleteTemplate,
    onRequestToBook,
    isLoading,
    isRefetching,
    error,
    refetchTemplates,
    clearError,
  }) => {
    const { colors } = useThemeColors();

    const handleRefresh = useCallback(async () => {
      if (isRefetching) return;
      await refetchTemplates();
    }, [refetchTemplates, isRefetching]);

    const handleEdit = useCallback(
      (template: GigTemplate) => {
        if (isRefetching) return;
        onStartEdit(template);
      },
      [onStartEdit, isRefetching]
    );

    const handleDelete = useCallback(
      async (templateId: string) => {
        if (isRefetching) return;
        await onDeleteTemplate(templateId);
      },
      [onDeleteTemplate, isRefetching]
    );

    const handleUse = useCallback(() => {
      if (isRefetching) return;

      console.log("📋 Opening booking modal with template selection");

      // Pass null for musician since we don't have one selected yet
      // The BookingModal will handle musician selection
      onRequestToBook(null);
    }, [onRequestToBook, isRefetching]);
    const handleRetry = useCallback(async () => {
      await refetchTemplates();
    }, [refetchTemplates]);

    // Show error state
    if (error) {
      return (
        <ErrorState
          error={error}
          onRetry={handleRetry}
          onClear={clearError}
          colors={colors}
        />
      );
    }

    // Show loading state (initial load)
    if (isLoading && !isRefetching) {
      return (
        <div
          className={cn(
            "rounded-2xl p-6",
            colors.card,
            colors.border,
            "border"
          )}
        >
          <TemplateSkeleton />
        </div>
      );
    }

    // Show empty state
    if (templates.length === 0) {
      return (
        <EmptyState
          onRequestToBook={onRequestToBook}
          colors={colors}
          onRefresh={handleRefresh}
          isRefetching={isRefetching}
          isLoading={isLoading}
        />
      );
    }

    return (
      <div className="relative">
        {/* Global Refetching Overlay */}
        {isRefetching && (
          <div className="absolute inset-0 bg-white/30 dark:bg-black/30 rounded-2xl z-20 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
              <span className={colors.text}>Refreshing templates...</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div>
              <h3 className={cn("text-xl font-bold", colors.text)}>
                My Templates ({templates.length})
              </h3>
              <p className={cn("text-sm", colors.textMuted)}>
                {templates.filter((t) => t.timesUsed && t.timesUsed > 0).length}{" "}
                templates used for bookings
                {isRefetching && " • Refreshing..."}
              </p>
            </div>
            {isRefetching && (
              <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || isRefetching}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isRefetching ? "animate-spin" : ""}`}
            />
            {isRefetching ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={() => handleEdit(template)}
              onDelete={() => handleDelete(template.id)}
              onUse={handleUse}
              isRefetching={isRefetching}
            />
          ))}
        </div>

        {/* Refetching Banner */}
        {isRefetching && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
            <span className="text-blue-700 dark:text-blue-300 text-sm">
              Updating templates...
            </span>
          </div>
        )}
      </div>
    );
  }
);

MyTemplatesTab.displayName = "MyTemplatesTab";
