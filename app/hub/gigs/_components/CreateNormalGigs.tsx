"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Zap,
  Music,
  Mic,
  Volume2,
  Sparkles,
  Star,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import NormalGigsForm from "./gigs/NormalGigsForm";
import { motion } from "framer-motion";

export const CreateNormalGigs = ({ user }: { user: any }) => {
  const router = useRouter();
  const { colors } = useThemeColors();
  const [showForm, setShowForm] = useState(false);

  const handleCreateNormalGig = () => {
    console.log("Opening gig form...");
    setShowForm(true);
  };

  const handleCreateEvent = () => {
    // TODO: Implement event creation
    console.log("Creating event...");
  };

  const handleBackToOptions = () => {
    setShowForm(false);
  };

  const gigOptions = [
    {
      id: "normal",
      title: "Normal Gig",
      description: "Traditional gig posting with full details",
      icon: Music,
      features: [
        { icon: Calendar, text: "Set date and time" },
        { icon: MapPin, text: "Specify location" },
        { icon: DollarSign, text: "Set budget range" },
        { icon: Users, text: "Specify required musicians" },
      ],
      buttonText: "Create Normal Gig",
      color: "orange",
      gradient: "from-orange-500 to-amber-500",
      onClick: handleCreateNormalGig,
    },
    {
      id: "event",
      title: "Event Series",
      description: "Recurring events or multi-date bookings",
      icon: Calendar,
      features: [
        { icon: Calendar, text: "Multiple dates/times" },
        { icon: MapPin, text: "Multiple venues possible" },
        { icon: DollarSign, text: "Flexible payment options" },
        { icon: Users, text: "Crew/band management" },
      ],
      buttonText: "Create Event Series",
      color: "purple",
      gradient: "from-purple-500 to-pink-500",
      onClick: handleCreateEvent,
    },
    {
      id: "instant",
      title: "Instant Booking",
      description: "Quick booking with pre-defined templates",
      icon: Zap,
      features: [
        { icon: Zap, text: "Template-based booking" },
        { icon: Users, text: "Verified pro musicians" },
        { icon: Calendar, text: "Quick scheduling" },
        { icon: DollarSign, text: "Fixed rates" },
      ],
      buttonText: "Try Instant Booking",
      color: "blue",
      gradient: "from-blue-500 to-cyan-500",
      onClick: () => router.push("/hub/gigs?tab=create-gigs"),
    },
  ];

  const tips = [
    "Be clear about the date, time, and location",
    "Specify the genre and style you're looking for",
    "Include dress code and other requirements",
    "Be transparent about the budget",
    "Consider providing meal and transportation details",
    "Mention if equipment will be provided",
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className={cn(
              "p-3 rounded-xl border transition-all duration-300 group",
              colors.border,
              colors.hoverBg,
              "hover:shadow-lg hover:scale-105"
            )}
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-orange-500" />
              <h1 className={cn("text-2xl sm:text-3xl font-bold", colors.text)}>
                Create Your Gig
              </h1>
            </div>
            <p className={cn("text-sm sm:text-base", colors.textMuted)}>
              {showForm
                ? "Fill in the details to create an amazing gig"
                : "Choose how you want to create your gig"}
            </p>
          </div>
        </div>

        {showForm && (
          <Button
            variant="outline"
            onClick={handleBackToOptions}
            className={cn(
              "flex items-center gap-2 border-2 group",
              colors.border,
              colors.hoverBg,
              "hover:border-orange-500 transition-colors"
            )}
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Options
          </Button>
        )}
      </div>

      {showForm ? (
        // Show the form when user selects an option
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <NormalGigsForm />
        </motion.div>
      ) : (
        // Show options when user first arrives
        <>
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "rounded-2xl p-6 sm:p-8 border overflow-hidden relative",
              colors.card,
              colors.border,
              "shadow-lg"
            )}
          >
            {/* Background gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full -translate-y-32 translate-x-32 blur-3xl" />

            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
                <Music className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className={cn("text-2xl font-bold", colors.text)}>
                    Welcome to Gig Creation
                  </h2>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    New ✨
                  </span>
                </div>
                <p className={cn("text-base mb-6", colors.textMuted)}>
                  Choose the type of gig you want to create. Whether you need a
                  one-time performance, a recurring event series, or want to try
                  our instant booking system, we've got you covered. Create
                  memorable musical experiences with ease.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105",
                      "bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-700 dark:text-orange-300",
                      "border border-orange-200 dark:border-orange-800"
                    )}
                  >
                    🎵 Live Music
                  </span>
                  <span
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105",
                      "bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-700 dark:text-purple-300",
                      "border border-purple-200 dark:border-purple-800"
                    )}
                  >
                    🎭 Events
                  </span>
                  <span
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105",
                      "bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-700 dark:text-blue-300",
                      "border border-blue-200 dark:border-blue-800"
                    )}
                  >
                    ⚡ Quick Booking
                  </span>
                  <span
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105",
                      "bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-700 dark:text-emerald-300",
                      "border border-emerald-200 dark:border-emerald-800"
                    )}
                  >
                    💼 Professional
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Gig Options Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {gigOptions.map((option, index) => {
              const Icon = option.icon;

              return (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={cn(
                    "rounded-2xl border p-6 transition-all duration-500 group cursor-pointer",
                    colors.card,
                    colors.border,
                    "hover:shadow-2xl hover:scale-[1.02] hover:border-orange-500/50",
                    "relative overflow-hidden"
                  )}
                  onClick={option.onClick}
                >
                  {/* Hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-red-500/0 group-hover:from-orange-500/5 group-hover:to-red-500/5 transition-all duration-500" />

                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div
                        className={cn(
                          "w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                          `bg-gradient-to-br ${option.gradient}`
                        )}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3
                          className={cn("text-xl font-bold mb-1", colors.text)}
                        >
                          {option.title}
                        </h3>
                        <p className={cn("text-sm", colors.textMuted)}>
                          {option.description}
                        </p>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {option.features.map((feature, idx) => {
                        const FeatureIcon = feature.icon;
                        return (
                          <li
                            key={idx}
                            className="flex items-center gap-3 group/item"
                          >
                            <div
                              className={cn(
                                "p-2 rounded-lg transition-all duration-300",
                                "group-hover/item:scale-110",
                                colors.hoverBg
                              )}
                            >
                              <FeatureIcon className="w-4 h-4" />
                            </div>
                            <span
                              className={cn("text-sm font-medium", colors.text)}
                            >
                              {feature.text}
                            </span>
                          </li>
                        );
                      })}
                    </ul>

                    <Button
                      onClick={option.onClick}
                      className={cn(
                        "w-full transition-all duration-500 group-hover:scale-105",
                        `bg-gradient-to-r ${option.gradient}`,
                        "text-white font-semibold shadow-lg hover:shadow-xl",
                        "hover:brightness-110"
                      )}
                    >
                      <span className="flex items-center justify-center gap-2">
                        {option.buttonText}
                        <ArrowLeft className="w-4 h-4 rotate-180 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Tips Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className={cn(
              "rounded-2xl border p-6 sm:p-8",
              colors.backgroundMuted,
              colors.border,
              "shadow-lg"
            )}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10">
                <Star className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className={cn("text-xl font-bold", colors.text)}>
                  Pro Tips for Success
                </h3>
                <p className={cn("text-sm", colors.textMuted)}>
                  Follow these tips to create amazing gigs
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tips.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02]",
                    colors.card,
                    colors.border,
                    "hover:shadow-md hover:border-orange-500/50"
                  )}
                >
                  <div className="flex-shrink-0">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        index % 3 === 0 &&
                          "bg-gradient-to-r from-orange-500/20 to-red-500/20",
                        index % 3 === 1 &&
                          "bg-gradient-to-r from-purple-500/20 to-pink-500/20",
                        index % 3 === 2 &&
                          "bg-gradient-to-r from-blue-500/20 to-cyan-500/20"
                      )}
                    >
                      <span className="text-sm font-bold">{index + 1}</span>
                    </div>
                  </div>
                  <span className={cn("text-sm font-medium", colors.text)}>
                    {tip}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Stats Section */}
            <div className="mt-8 pt-6 border-t">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className={cn("text-2xl font-bold mb-1", colors.text)}>
                    5,000+
                  </div>
                  <div className={cn("text-sm", colors.textMuted)}>
                    Successful Gigs
                  </div>
                </div>
                <div className="text-center">
                  <div className={cn("text-2xl font-bold mb-1", colors.text)}>
                    98%
                  </div>
                  <div className={cn("text-sm", colors.textMuted)}>
                    Satisfaction Rate
                  </div>
                </div>
                <div className="text-center">
                  <div className={cn("text-2xl font-bold mb-1", colors.text)}>
                    24h
                  </div>
                  <div className={cn("text-sm", colors.textMuted)}>
                    Average Response
                  </div>
                </div>
                <div className="text-center">
                  <div className={cn("text-2xl font-bold mb-1", colors.text)}>
                    500+
                  </div>
                  <div className={cn("text-sm", colors.textMuted)}>
                    Verified Musicians
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};
