"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiStar,
  FiCalendar,
  FiMusic,
  FiMic,
  FiUsers,
  FiRefreshCw,
  FiBriefcase,
} from "react-icons/fi";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useThemeColors } from "@/hooks/useTheme";
import GigLoader from "@/components/(main)/GigLoader";
import { cn } from "@/lib/utils";

// /* Main background */
// bg-gray-950

// /* Gradient overlay */
// from-amber-950/30 via-gray-950 to-purple-950/30

// /* Top ambient glow */
// from-amber-500/5 to-transparent
// Animation variants with spring

const slideUpSpring: Variants = {
  hidden: {
    opacity: 0,
    y: 100,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      damping: 18,
      stiffness: 90,
      duration: 0.7,
    },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const cardSpring: Variants = {
  hidden: {
    opacity: 0,
    y: 60,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      damping: 15,
      stiffness: 70,
      duration: 0.6,
    },
  },
};

export default function AboutPage() {
  const { user } = useCurrentUser();
  const { userId } = useAuth();
  const updateFirstLogin = useMutation(api.controllers.user.updateFirstLogin);
  const { colors, isDarkMode, mounted } = useThemeColors();

  useEffect(() => {
    const markFirstLoginComplete = async () => {
      if (!userId) {
        throw new Error("No user ID available");
      }

      try {
        const result = await updateFirstLogin({ clerkId: userId });
        console.log("First login marked complete:", result);
        return result;
      } catch (error) {
        console.error("Failed to mark first login complete:", error);
        throw error;
      }
    };

    markFirstLoginComplete();
  }, [userId]);

  if (!userId || !user) {
    return (
      <div className={`min-h-screen bg-gray-950`}>
        <GigLoader color="border-amber-400" title="Welcome to gigUup..." />
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className={`min-h-screen bg-gray-950`}>
        <GigLoader color="border-amber-400" title="Welcome to gigUup..." />
      </div>
    );
  }

  const getUserRoleDisplay = () => {
    if (user?.isMusician) return "Artist";
    if (user?.isClient) return "Client";
    if (user?.isBooker) return "Booker";
    return "User";
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 transition-colors duration-300 overflow-y-auto">
      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-950"
      >
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-linear-to-br from-amber-950/30 via-gray-950 to-purple-950/30" />

        {/* Soft ambient glow */}
        <div className="absolute top-0 left-0 right-0 h-96 bg-linear-to-b from-amber-500/5 to-transparent" />

        {/* Gentle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-size[4rem_4rem] opacity-20" />

        {/* Main content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left column - Text content */}
            <motion.div variants={slideUpSpring} className="text-left">
              {/* Founder intro badge */}
              <motion.div
                variants={slideUpSpring}
                className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 mb-6"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400/50"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                </span>
                <span className="text-sm font-medium text-gray-300">
                  Founded by{" "}
                  <span className="text-amber-400 font-semibold">
                    Zacharia Muigai
                  </span>{" "}
                  in 2024
                </span>
              </motion.div>

              {/* Main heading */}
              <motion.h1
                variants={slideUpSpring}
                className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
              >
                <span className="text-gray-100">From Passion to</span>
                <br />
                <span className="bg-linear-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
                  Platform: The Story of gigUup
                </span>
              </motion.h1>

              {/* The story */}
              <motion.div variants={slideUpSpring} className="space-y-4 mb-8">
                <p className="text-lg text-gray-300 leading-relaxed">
                  <span className="text-amber-400 font-semibold">gigUup</span>{" "}
                  was born from a simple observation: talented artists struggled
                  to find gigs, while venues desperately sought quality
                  entertainment.
                </p>

                <p className="text-lg text-gray-400 leading-relaxed">
                  What started in 2024 has grown into a thriving community of{" "}
                  <span className="text-gray-200 font-medium">
                    10,000+ artists
                  </span>
                  ,{" "}
                  <span className="text-gray-200 font-medium">
                    5,000+ venues
                  </span>
                  , and countless unforgettable performances.
                </p>
              </motion.div>

              {/* CTA Buttons */}
              {/* CTA Buttons */}
              <motion.div
                variants={slideUpSpring}
                className="flex flex-col sm:flex-row gap-4"
              >
                {user ? (
                  // User is logged in
                  !user?.firstLogin ? (
                    // Not first login - check if they have a role
                    user?.isMusician || user?.isClient || user?.isBooker ? (
                      // Has a role - go to dashboard
                      <Link
                        href="/"
                        className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium overflow-hidden rounded-xl bg-linear-to-r from-amber-500/5 to-amber-400/5 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/10"
                      >
                        {/* Animated gradient background */}
                        <div className="absolute inset-0 bg-linear-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        {/* Subtle shimmer effect */}
                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-amber-400/10 to-transparent translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                        {/* Floating dot animation */}
                        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400/50 animate-pulse" />

                        <span className="relative flex items-center gap-3">
                          <svg
                            className="w-5 h-5 text-amber-400/70 group-hover:text-amber-400 transition-all duration-300 group-hover:rotate-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                          </svg>
                          <span className="text-amber-200/80 group-hover:text-amber-200 transition-colors duration-300 font-medium tracking-wide">
                            Go to Dashboard
                          </span>
                        </span>
                      </Link>
                    ) : (
                      // No role yet - choose role
                      <Link
                        href={`/roles/${user?.clerkId}`}
                        className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium overflow-hidden rounded-xl bg-linear-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 border border-amber-500/30 hover:border-amber-400/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/20"
                      >
                        {/* Pulsing background */}
                        <div className="absolute inset-0 bg-linear-to-r from-amber-500/0 via-amber-400/10 to-amber-500/0 animate-pulse-slow opacity-0 group-hover:opacity-100" />

                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-amber-300/20 to-transparent translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                        {/* Decorative corner accents */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-400/0 group-hover:border-amber-400/30 rounded-tl-xl transition-all duration-500" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-400/0 group-hover:border-amber-400/30 rounded-br-xl transition-all duration-500" />

                        <span className="relative flex items-center gap-3">
                          <svg
                            className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-all duration-300 group-hover:scale-110"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <span className="text-amber-300 group-hover:text-amber-200 transition-colors duration-300 font-medium tracking-wide">
                            Pick Your Path: Let's Go!
                          </span>
                          <svg
                            className="w-4 h-4 text-amber-400/70 group-hover:text-amber-300 group-hover:translate-x-1 transition-all duration-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </span>
                      </Link>
                    )
                  ) : (
                    // First login - authenticate
                    <Link
                      href="/authenticate"
                      className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium overflow-hidden rounded-xl bg-linear-to-r from-amber-500/5 to-amber-400/5 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-500 hover:scale-[1.02]"
                    >
                      <div className="absolute inset-0 bg-linear-to-r from-transparent via-amber-400/10 to-transparent translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                      <span className="relative flex items-center gap-3">
                        <svg
                          className="w-5 h-5 text-amber-400/70 group-hover:text-amber-400 transition-colors duration-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                        <span className="text-amber-200/80 group-hover:text-amber-200 transition-colors duration-300">
                          Get Started
                        </span>
                      </span>
                    </Link>
                  )
                ) : (
                  // User is NOT logged in - show signup buttons
                  <>
                    <Link
                      href="/signup?role=artist"
                      className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium overflow-hidden rounded-xl bg-linear-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-500/30"
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                      {/* Glow effect */}
                      <div className="absolute -inset-0.5 bg-linear-to-r from-amber-500 to-amber-400 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500" />

                      <span className="relative flex items-center gap-3 text-gray-900 font-semibold">
                        <FiMic className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                        <span>Join as Artist</span>
                      </span>
                    </Link>

                    <Link
                      href="/signup?role=client"
                      className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium overflow-hidden rounded-xl bg-linear-to-r from-indigo-500/10 to-indigo-400/5 border border-indigo-500/20 hover:border-indigo-400/40 transition-all duration-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/10"
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-linear-to-r from-transparent via-indigo-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                      {/* Corner accent */}
                      <div className="absolute top-0 right-0 w-12 h-12 bg-linear-to-br from-indigo-400/0 to-indigo-400/10 rounded-tr-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <span className="relative flex items-center gap-3 text-indigo-200/80 group-hover:text-indigo-200 transition-colors duration-300">
                        <FiUsers className="w-5 h-5 group-hover:rotate-3 transition-transform duration-300" />
                        <span>Join as Client</span>
                      </span>
                    </Link>

                    <Link
                      href="/signup?role=booker"
                      className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium overflow-hidden rounded-xl bg-linear-to-r from-purple-500/10 to-purple-400/5 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10"
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-linear-to-r from-transparent via-purple-400/20 to-transparent translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                      {/* Corner accent */}
                      <div className="absolute bottom-0 left-0 w-12 h-12 bg-linear-to-tr from-purple-400/0 to-purple-400/10 rounded-bl-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <span className="relative flex items-center gap-3 text-purple-200/80 group-hover:text-purple-200 transition-colors duration-300">
                        <FiBriefcase className="w-5 h-5 group-hover:-rotate-3 transition-transform duration-300" />
                        <span>Join as Booker</span>
                      </span>
                    </Link>
                  </>
                )}
              </motion.div>
              {/* Founder quote */}
              <motion.div
                variants={slideUpSpring}
                className="mt-12 p-6 rounded-xl bg-gray-800/30 border border-gray-700/50"
              >
                <p className="text-gray-400 italic">
                  "Every artist deserves a stage, every venue deserves magic.
                  That's what we're building at gigUup."
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-10 h-10 rounded-full bg-linear-to-r from-amber-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    ZM
                  </div>
                  <div>
                    <p className="text-gray-200 font-medium">Zacharia Muigai</p>
                    <p className="text-sm text-gray-500">
                      Founder & CEO, gigUup
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right column - Visual stats */}
            <motion.div
              variants={slideUpSpring}
              className="hidden lg:block space-y-6"
            >
              {/* Stats cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50">
                  <div className="text-3xl mb-2">🎤</div>
                  <div className="text-2xl font-bold text-gray-100">10K+</div>
                  <div className="text-sm text-gray-500">Active Artists</div>
                </div>
                <div className="p-6 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50">
                  <div className="text-3xl mb-2">🏢</div>
                  <div className="text-2xl font-bold text-gray-100">5K+</div>
                  <div className="text-sm text-gray-500">Verified Venues</div>
                </div>
                <div className="p-6 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50">
                  <div className="text-3xl mb-2">📅</div>
                  <div className="text-2xl font-bold text-gray-100">50K+</div>
                  <div className="text-sm text-gray-500">Gigs Completed</div>
                </div>
                <div className="p-6 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50">
                  <div className="text-3xl mb-2">⭐</div>
                  <div className="text-2xl font-bold text-gray-100">4.9</div>
                  <div className="text-sm text-gray-500">Average Rating</div>
                </div>
              </div>

              {/* Mission card */}
              <div className="p-6 rounded-2xl bg-linear-to-br from-amber-500/10 to-purple-500/10 border border-amber-500/20">
                <h3 className="text-lg font-semibold text-gray-100 mb-3">
                  Our Mission
                </h3>
                <p className="text-gray-400 text-sm">
                  "Where passion meets profession—connecting artists, educators,
                  and clients through the power of music."
                </p>
              </div>

              {/* Founded badge */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-800/20 border border-gray-700/30">
                <div className="w-12 h-12 rounded-full bg-gray-700/50 flex items-center justify-center">
                  <span className="text-2xl">🚀</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Founded</p>
                  <p className="text-gray-200 font-semibold">
                    2024 • Nairobi, Kenya
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-gray-950 to-transparent" />
      </motion.section>

      {/* Stats Bar */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
        className="py-16 bg-gray-900/50 border-y border-gray-800/50"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "10K+", label: "Talented Artists" },
            { value: "20K+", label: "Verified Clients" },
            { value: "5K+", label: "Professional Bookers" },
            { value: "95%", label: "Satisfaction Rate" },
          ].map((stat, i) => (
            <motion.div key={i} variants={slideUpSpring} className="space-y-2">
              <div className="text-4xl font-bold text-amber-400">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* For Artists Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
        className="py-24 px-4 max-w-6xl mx-auto"
      >
        <motion.div variants={slideUpSpring} className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-100 mb-4">
            For <span className="text-amber-400">Artists</span>
          </h2>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto">
            Find your perfect gig, showcase your talent, and grow your career
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <FiMusic className="w-8 h-8" />,
              title: "Premium Opportunities",
              desc: "Access exclusive gigs at top venues that value your artistry.",
              color: "amber",
            },
            {
              icon: <FiDollarSign className="w-8 h-8" />,
              title: "Fair Compensation",
              desc: "Set your rates and get paid securely through our platform.",
              color: "amber",
            },
            {
              icon: <FiCalendar className="w-8 h-8" />,
              title: "Booking Management",
              desc: "Easily manage your schedule and bookings in one place.",
              color: "amber",
            },
            {
              icon: <FiUsers className="w-8 h-8" />,
              title: "Direct Connections",
              desc: "Build relationships with venues and repeat clients.",
              color: "amber",
            },
            {
              icon: <FiStar className="w-8 h-8" />,
              title: "Profile Showcase",
              desc: "Beautiful portfolio to highlight your work and skills.",
              color: "amber",
            },
            {
              icon: <FiCheckCircle className="w-8 h-8" />,
              title: "Secure Contracts",
              desc: "Professional agreements that protect both parties.",
              color: "amber",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              variants={cardSpring}
              className="group p-8 rounded-2xl bg-gray-900/50 border border-gray-800/50 hover:border-amber-500/30 hover:bg-gray-900/70 transition-all duration-300"
            >
              <div className="text-amber-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-200 mb-3">
                {item.title}
              </h3>
              <p className="text-gray-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* For Clients Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
        className="py-24 bg-gray-900/30"
      >
        <div className="max-w-6xl mx-auto px-4">
          <motion.div variants={slideUpSpring} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-100 mb-4">
              For <span className="text-indigo-400">Clients</span>
            </h2>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto">
              Discover exceptional talent and create unforgettable experiences
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <FiUsers className="w-8 h-8" />,
                title: "Curated Talent",
                desc: "Hand-selected artists across all genres and performance types.",
                color: "indigo",
              },
              {
                icon: <FiClock className="w-8 h-8" />,
                title: "Quick Booking",
                desc: "Find and book the perfect act in minutes, not days.",
                color: "indigo",
              },
              {
                icon: <FiCheckCircle className="w-8 h-8" />,
                title: "Verified Quality",
                desc: "Every artist has been vetted for professionalism.",
                color: "indigo",
              },
              {
                icon: <FiDollarSign className="w-8 h-8" />,
                title: "Transparent Pricing",
                desc: "Clear rates with no hidden fees or surprises.",
                color: "indigo",
              },
              {
                icon: <FiCalendar className="w-8 h-8" />,
                title: "Flexible Scheduling",
                desc: "Find artists available for your specific dates.",
                color: "indigo",
              },
              {
                icon: <FiStar className="w-8 h-8" />,
                title: "Exceptional Support",
                desc: "Our team ensures your event is a success.",
                color: "indigo",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={cardSpring}
                className="group p-8 rounded-2xl bg-gray-900/40 border border-gray-800/50 hover:border-indigo-500/30 hover:bg-gray-900/60 transition-all duration-300"
              >
                <div className="text-indigo-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-200 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* For Bookers Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
        className="py-24 px-4 max-w-6xl mx-auto"
      >
        <motion.div variants={slideUpSpring} className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-100 mb-4">
            For <span className="text-purple-400">Bookers</span>
          </h2>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto">
            Manage talent, coordinate events, and build your artist roster
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <FiBriefcase className="w-8 h-8" />,
              title: "Talent Management",
              desc: "Discover and manage talented musicians for your events.",
              color: "purple",
            },
            {
              icon: <FiCalendar className="w-8 h-8" />,
              title: "Event Coordination",
              desc: "Organize and coordinate multiple gigs and performances.",
              color: "purple",
            },
            {
              icon: <FiUsers className="w-8 h-8" />,
              title: "Artist Rosters",
              desc: "Build and manage your own roster of reliable performers.",
              color: "purple",
            },
            {
              icon: <FiDollarSign className="w-8 h-8" />,
              title: "Commission Tracking",
              desc: "Track your earnings and manage payments seamlessly.",
              color: "purple",
            },
            {
              icon: <FiStar className="w-8 h-8" />,
              title: "Industry Connections",
              desc: "Connect with venues and expand your network.",
              color: "purple",
            },
            {
              icon: <FiCheckCircle className="w-8 h-8" />,
              title: "Professional Tools",
              desc: "All the tools you need to succeed as a talent booker.",
              color: "purple",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              variants={cardSpring}
              className="group p-8 rounded-2xl bg-gray-900/50 border border-gray-800/50 hover:border-purple-500/30 hover:bg-gray-900/70 transition-all duration-300"
            >
              <div className="text-purple-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-200 mb-3">
                {item.title}
              </h3>
              <p className="text-gray-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Testimonial Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
        className="py-20 bg-linear-to-br from-amber-900/20 via-gray-900 to-purple-900/20"
      >
        <div className="max-w-6xl mx-auto px-4">
          <motion.div variants={slideUpSpring} className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-100 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Discover why artists, clients, and bookers love using our platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              variants={cardSpring}
              className="p-8 rounded-2xl bg-gray-800/30 border border-gray-700/50 backdrop-blur-sm"
            >
              <p className="text-center text-gray-400 italic">
                "This platform connected me with venues I never thought I'd
                play. My career has completely transformed."
              </p>
              <div className="mt-4 text-center">
                <p className="text-amber-400 font-semibold">- Sarah K.</p>
                <p className="text-sm text-gray-600">Jazz Vocalist</p>
              </div>
            </motion.div>

            <motion.div
              variants={cardSpring}
              className="p-8 rounded-2xl bg-gray-800/30 border border-gray-700/50 backdrop-blur-sm"
            >
              <p className="text-center text-gray-400 italic">
                "Finding reliable talent for our events used to be stressful.
                Now it's effortless."
              </p>
              <div className="mt-4 text-center">
                <p className="text-indigo-400 font-semibold">- James M.</p>
                <p className="text-sm text-gray-600">Event Director</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
        className="py-20 px-4"
      >
        <motion.div
          variants={slideUpSpring}
          className="max-w-4xl mx-auto bg-linear-to-br from-amber-600/20 via-gray-900 to-purple-600/20 rounded-3xl p-12 text-center border border-gray-800/50"
        >
          <h2 className="text-3xl font-bold text-gray-100 mb-6">
            Ready to Transform Your Musical Journey?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of artists, venues, and bookers creating magical
            experiences together.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {user ? (
              <Link
                href={"/authenticate"}
                className="bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold py-4 px-8 rounded-xl text-lg transition-all transform hover:scale-105"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/signup?role=artist"
                  className="bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold py-4 px-8 rounded-xl text-lg transition-all transform hover:scale-105 inline-flex items-center justify-center"
                >
                  <FiMic className="mr-2" /> Join as Artist
                </Link>
                <Link
                  href="/signup?role=client"
                  className="bg-indigo-500 hover:bg-indigo-400 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all transform hover:scale-105 inline-flex items-center justify-center"
                >
                  <FiUsers className="mr-2" /> Join as Client
                </Link>
                <Link
                  href="/signup?role=booker"
                  className="bg-purple-500 hover:bg-purple-400 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all transform hover:scale-105 inline-flex items-center justify-center"
                >
                  <FiBriefcase className="mr-2" /> Join as Booker
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gray-900/50 border-t border-gray-800/50 py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-amber-400">gigUup</h3>
            <p className="text-gray-500">
              Bridging the gap between exceptional talent and unforgettable
              venues since 2024.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-300 mb-4">For Artists</h4>
            <ul className="space-y-2 text-gray-500">
              <li>
                <Link
                  href="/authenticate"
                  className="hover:text-amber-400 transition"
                >
                  Sign Up
                </Link>
              </li>
              <li>
                <Link
                  href="/artist-resources"
                  className="hover:text-amber-400 transition"
                >
                  Resources
                </Link>
              </li>
              <li>
                <Link
                  href="/artist-faq"
                  className="hover:text-amber-400 transition"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-300 mb-4">For Clients</h4>
            <ul className="space-y-2 text-gray-500">
              <li>
                <Link
                  href="/authenticate"
                  className="hover:text-indigo-400 transition"
                >
                  Sign Up
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-indigo-400 transition"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/client-faq"
                  className="hover:text-indigo-400 transition"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-300 mb-4">For Bookers</h4>
            <ul className="space-y-2 text-gray-500">
              <li>
                <Link
                  href="/authenticate"
                  className="hover:text-purple-400 transition"
                >
                  Sign Up
                </Link>
              </li>
              <li>
                <Link
                  href="/booker-resources"
                  className="hover:text-purple-400 transition"
                >
                  Resources
                </Link>
              </li>
              <li>
                <Link
                  href="/booker-faq"
                  className="hover:text-purple-400 transition"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-gray-800/50 text-center text-gray-600">
          <p>© {new Date().getFullYear()} gigUup. All rights reserved.</p>
          <div className="flex justify-center space-x-6 mt-4">
            <Link href="/privacy" className="hover:text-gray-400 transition">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-gray-400 transition">
              Terms
            </Link>
            <Link href="/cookies" className="hover:text-gray-400 transition">
              Cookies
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
