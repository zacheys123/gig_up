"use client";

import Link from "next/link";
import { motion } from "framer-motion";
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

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
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
      <div className={`min-h-screen ${colors.background}`}>
        <GigLoader color="border-green-400" title="Welcome to gigUup..." />
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className={`min-h-screen ${colors.background}`}>
        <GigLoader color="border-green-400" title="Welcome to gigUup..." />
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
    <div
      className={`min-h-screen ${colors.background} ${colors.text} transition-colors duration-300 overflow-y-auto`}
    >
      {/* Hero Section */}

      <section
        className={cn(
          "relative min-h-screen flex items-center justify-center overflow-hidden",
          colors.background,
        )}
      >
        {/* Darker, more subtle gradient background */}
        <div className="absolute inset-0 bg-linear-to-br from-gray-950 via-gray-900 to-gray-950" />

        {/* Founder portrait/avatar decorative element */}
        <div className="absolute top-20 right-20 w-64 h-64 opacity-5">
          <div className="w-full h-full rounded-full bg-linear-to-r from-amber-500 to-purple-500 blur-3xl" />
        </div>

        {/* Main content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left column - Text content */}
            <div className="text-left">
              {/* Founder intro badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 mb-6"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500/50"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span className="text-sm font-medium text-gray-300">
                  Founded by{" "}
                  <span className="text-amber-400 font-semibold">
                    Zacharia Muigai
                  </span>{" "}
                  in 2024
                </span>
              </motion.div>

              {/* Main heading with story */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl md:text-6xl font-bold mb-6 tracking-tight"
              >
                <span className="text-white">From Passion to</span>
                <br />
                <span className="bg-linear-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent">
                  Platform
                </span>
              </motion.h1>

              {/* The story - more personal */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="space-y-4 mb-8"
              >
                <p className="text-lg text-gray-300 leading-relaxed">
                  <span className="text-amber-400 font-semibold">gigUup</span>{" "}
                  was born from a simple observation by founder{" "}
                  <span className="text-amber-400">Zacharia Muigai</span>:
                  talented artists were struggling to find gigs, while venues
                  desperately sought quality entertainment.
                </p>

                <p className="text-lg text-gray-400 leading-relaxed">
                  What started as a small idea in 2024 has grown into a thriving
                  community of{" "}
                  <span className="text-white font-medium">
                    10,000+ artists
                  </span>
                  ,{" "}
                  <span className="text-white font-medium">5,000+ venues</span>,
                  and countless unforgettable performances.
                </p>

                <div className="flex items-center gap-4 pt-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-linear-to-r from-amber-500/30 to-purple-500/30 border-2 border-gray-800"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    Join <span className="text-amber-400">10K+</span> artists
                    already on gigUup
                  </p>
                </div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                {user ? (
                  <Link
                    href={
                      !user?.firstLogin
                        ? user?.isMusician || user?.isClient || user?.isBooker
                          ? "/"
                          : `/roles/${user?.clerkId}`
                        : "/authenticate"
                    }
                    className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-amber-300 bg-gray-800/50 rounded-xl border border-gray-700 hover:bg-gray-800 hover:border-amber-500/30 transition-all duration-300"
                  >
                    <span className="flex items-center gap-3">
                      <span>Go to Dashboard</span>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </span>
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/signup?role=artist"
                      className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-linear-to-r from-amber-600 to-amber-500 rounded-xl hover:from-amber-500 hover:to-amber-400 transition-all duration-300 shadow-lg shadow-amber-500/20"
                    >
                      <span className="flex items-center gap-3">
                        <FiMic className="w-5 h-5" />
                        <span>Join as Artist</span>
                      </span>
                    </Link>

                    <Link
                      href="/signup?role=client"
                      className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-gray-300 bg-gray-800/50 rounded-xl border border-gray-700 hover:bg-gray-800 hover:border-gray-600 transition-all duration-300"
                    >
                      <span className="flex items-center gap-3">
                        <FiUsers className="w-5 h-5" />
                        <span>Join as Client</span>
                      </span>
                    </Link>

                    <Link
                      href="/signup?role=booker"
                      className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-purple-300 bg-gray-800/50 rounded-xl border border-purple-500/20 hover:bg-gray-800 hover:border-purple-500/30 transition-all duration-300"
                    >
                      <span className="flex items-center gap-3">
                        <FiBriefcase className="w-5 h-5" />
                        <span>Join as Booker</span>
                      </span>
                    </Link>
                  </>
                )}
              </motion.div>

              {/* Founder quote */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="mt-12 p-6 rounded-xl bg-gray-800/30 border border-gray-700/50"
              >
                <p className="text-gray-400 italic">
                  "Every artist deserves a stage, every venue deserves magic.
                  That's what we're building at gigUup."
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-10 h-10 rounded-full bg-linear-to-r from-amber-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    RA
                  </div>
                  <div>
                    <p className="text-white font-medium">Zacharia Muigai</p>
                    <p className="text-sm text-gray-500">
                      Founder & CEO, gigUup
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right column - Visual stats */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="hidden lg:block space-y-6"
            >
              {/* Stats cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50">
                  <div className="text-3xl mb-2">🎤</div>
                  <div className="text-2xl font-bold text-white">10K+</div>
                  <div className="text-sm text-gray-500">Active Artists</div>
                </div>
                <div className="p-6 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50">
                  <div className="text-3xl mb-2">🏢</div>
                  <div className="text-2xl font-bold text-white">5K+</div>
                  <div className="text-sm text-gray-500">Verified Venues</div>
                </div>
                <div className="p-6 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50">
                  <div className="text-3xl mb-2">📅</div>
                  <div className="text-2xl font-bold text-white">50K+</div>
                  <div className="text-sm text-gray-500">Gigs Completed</div>
                </div>
                <div className="p-6 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50">
                  <div className="text-3xl mb-2">⭐</div>
                  <div className="text-2xl font-bold text-white">4.9</div>
                  <div className="text-sm text-gray-500">Average Rating</div>
                </div>
              </div>

              {/* Mission card */}
              <div className="p-6 rounded-2xl bg-linear-to-br from-amber-500/10 to-purple-500/10 border border-amber-500/20">
                <h3 className="text-lg font-semibold text-white mb-3">
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
                  <p className="text-white font-semibold">
                    2024 • Nairobi, Kenya
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-gray-950 to-transparent" />
      </section>
      {/* Stats Bar */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className={`${colors.background} py-12 ${colors.shadow}`}
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className={`text-4xl font-bold ${colors.primary} mb-2`}>
              10K+
            </div>
            <div className={colors.textMuted}>Talented Artists</div>
          </div>
          <div>
            <div className={`text-4xl font-bold ${colors.primary} mb-2`}>
              20K+
            </div>
            <div className={colors.textMuted}>Verified Clients</div>
          </div>
          <div>
            <div className={`text-4xl font-bold ${colors.primary} mb-2`}>
              5K+
            </div>
            <div className={colors.textMuted}>Professional Bookers</div>
          </div>
          <div>
            <div className={`text-4xl font-bold ${colors.primary} mb-2`}>
              95%
            </div>
            <div className={colors.textMuted}>Satisfaction Rate</div>
          </div>
        </div>
      </motion.section>

      {/* For Artists Section */}
      <section className={`py-20 px-4 max-w-6xl mx-auto ${colors.background}`}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2
            variants={fadeInUp}
            className={`text-3xl font-bold ${colors.text} mb-4`}
          >
            For <span className={colors.primary}>Artists</span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className={`text-xl ${colors.textMuted} max-w-3xl mx-auto`}
          >
            Find your perfect gig, showcase your talent, and grow your career
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8"
        >
          {[
            {
              icon: <FiMusic className="w-8 h-8" />,
              title: "Premium Opportunities",
              desc: "Access exclusive gigs at top venues that value your artistry.",
            },
            {
              icon: <FiDollarSign className="w-8 h-8" />,
              title: "Fair Compensation",
              desc: "Set your rates and get paid securely through our platform.",
            },
            {
              icon: <FiCalendar className="w-8 h-8" />,
              title: "Booking Management",
              desc: "Easily manage your schedule and bookings in one place.",
            },
            {
              icon: <FiUsers className="w-8 h-8" />,
              title: "Direct Connections",
              desc: "Build relationships with venues and repeat clients.",
            },
            {
              icon: <FiStar className="w-8 h-8" />,
              title: "Profile Showcase",
              desc: "Beautiful portfolio to highlight your work and skills.",
            },
            {
              icon: <FiCheckCircle className="w-8 h-8" />,
              title: "Secure Contracts",
              desc: "Professional agreements that protect both parties.",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className={`${colors.card} p-8 rounded-xl ${colors.shadow} hover:shadow-lg transition-all border-t-4 border-amber-400 ${colors.border}`}
            >
              <div className="text-amber-500 mb-4">{item.icon}</div>
              <h3 className={`text-xl font-bold mb-3 ${colors.text}`}>
                {item.title}
              </h3>
              <p className={colors.textMuted}>{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* For Clients Section */}
      <section className={`py-20 ${colors.backgroundMuted}`}>
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className={`text-3xl font-bold ${colors.text} mb-4`}
            >
              For <span className="text-indigo-600">Clients</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className={`text-xl ${colors.textMuted} max-w-3xl mx-auto`}
            >
              Discover exceptional talent and create unforgettable experiences
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <FiUsers className="w-8 h-8" />,
                title: "Curated Talent",
                desc: "Hand-selected artists across all genres and performance types.",
              },
              {
                icon: <FiClock className="w-8 h-8" />,
                title: "Quick Booking",
                desc: "Find and book the perfect act in minutes, not days.",
              },
              {
                icon: <FiCheckCircle className="w-8 h-8" />,
                title: "Verified Quality",
                desc: "Every artist has been vetted for professionalism.",
              },
              {
                icon: <FiDollarSign className="w-8 h-8" />,
                title: "Transparent Pricing",
                desc: "Clear rates with no hidden fees or surprises.",
              },
              {
                icon: <FiCalendar className="w-8 h-8" />,
                title: "Flexible Scheduling",
                desc: "Find artists available for your specific dates.",
              },
              {
                icon: <FiStar className="w-8 h-8" />,
                title: "Exceptional Support",
                desc: "Our team ensures your event is a success.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className={`${colors.card} p-8 rounded-xl ${colors.shadow} hover:shadow-lg transition-all border-t-4 border-indigo-500 ${colors.border}`}
              >
                <div className="text-indigo-600 mb-4">{item.icon}</div>
                <h3 className={`text-xl font-bold mb-3 ${colors.text}`}>
                  {item.title}
                </h3>
                <p className={colors.textMuted}>{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* For Bookers Section */}
      <section className={`py-20 px-4 max-w-6xl mx-auto ${colors.background}`}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2
            variants={fadeInUp}
            className={`text-3xl font-bold ${colors.text} mb-4`}
          >
            For <span className="text-purple-600">Bookers</span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className={`text-xl ${colors.textMuted} max-w-3xl mx-auto`}
          >
            Manage talent, coordinate events, and build your artist roster
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8"
        >
          {[
            {
              icon: <FiBriefcase className="w-8 h-8" />,
              title: "Talent Management",
              desc: "Discover and manage talented musicians for your events.",
            },
            {
              icon: <FiCalendar className="w-8 h-8" />,
              title: "Event Coordination",
              desc: "Organize and coordinate multiple gigs and performances.",
            },
            {
              icon: <FiUsers className="w-8 h-8" />,
              title: "Artist Rosters",
              desc: "Build and manage your own roster of reliable performers.",
            },
            {
              icon: <FiDollarSign className="w-8 h-8" />,
              title: "Commission Tracking",
              desc: "Track your earnings and manage payments seamlessly.",
            },
            {
              icon: <FiStar className="w-8 h-8" />,
              title: "Industry Connections",
              desc: "Connect with venues and expand your network.",
            },
            {
              icon: <FiCheckCircle className="w-8 h-8" />,
              title: "Professional Tools",
              desc: "All the tools you need to succeed as a talent booker.",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className={`${colors.card} p-8 rounded-xl ${colors.shadow} hover:shadow-lg transition-all border-t-4 border-purple-500 ${colors.border}`}
            >
              <div className="text-purple-500 mb-4">{item.icon}</div>
              <h3 className={`text-xl font-bold mb-3 ${colors.text}`}>
                {item.title}
              </h3>
              <p className={colors.textMuted}>{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Testimonial Section */}
      <section className={`py-14 ${colors.gradientPrimary} text-white`}>
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl font-bold mb-4">
              What Our Users Say
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-blue-100 max-w-3xl mx-auto"
            >
              Discover why artists, clients, and bookers love using our platform
            </motion.p>
          </motion.div>

          {/* Shuffle button */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex justify-center mb-8"
          >
            <button className="flex items-center gap-2 px-6 py-3 bg-indigo-700 hover:bg-indigo-600 text-white rounded-full transition-all duration-300 hover:scale-105">
              <FiRefreshCw className="w-5 h-5" />
              Show Different Testimonials
            </button>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Placeholder testimonials */}
            <div className="bg-indigo-800/50 p-8 rounded-2xl border border-indigo-700">
              <p className="text-center text-blue-200 italic">
                No testimonials available yet. Be the first to share your
                experience!
              </p>
            </div>
            <div className="bg-indigo-800/50 p-8 rounded-2xl border border-indigo-700">
              <p className="text-center text-blue-200 italic">
                Share how our platform has helped you connect with amazing
                talent!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 px-4 ${colors.background}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto bg-linear-to-r from-indigo-600 to-purple-600 rounded-2xl p-12 text-center text-white shadow-xl"
        >
          <h2 className="text-3xl font-bold mb-6">
            Ready to Transform Your Musical Journey?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of artists, venues, and bookers creating magical
            experiences together.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {user ? (
              <Link
                href={"/authenticate"}
                className="bg-white text-gray-900 hover:bg-gray-100 font-bold py-4 px-8 rounded-full text-lg transition-all transform hover:scale-105"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/signup?role=artist"
                  className="bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold py-4 px-8 rounded-full text-lg transition-all transform hover:scale-105 inline-flex items-center justify-center"
                >
                  <FiMic className="mr-2" /> Join as Artist
                </Link>
                <Link
                  href="/signup?role=client"
                  className="bg-white hover:bg-gray-100 text-gray-900 font-bold py-4 px-8 rounded-full text-lg transition-all transform hover:scale-105 inline-flex items-center justify-center"
                >
                  <FiUsers className="mr-2" /> Join as Client
                </Link>
                <Link
                  href="/signup?role=booker"
                  className="bg-purple-500 hover:bg-purple-400 text-white font-bold py-4 px-8 rounded-full text-lg transition-all transform hover:scale-105 inline-flex items-center justify-center"
                >
                  <FiBriefcase className="mr-2" /> Join as Booker
                </Link>
              </>
            )}
          </div>
          <p className="mt-6 text-indigo-100">
            Have questions?{" "}
            <Link href="/contact" className="underline hover:text-white">
              Contact our team
            </Link>
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className={`${colors.navBackground} ${colors.text} py-12 px-4`}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-amber-400">gigUup</h3>
            <p className={colors.textMuted}>
              Bridging the gap between exceptional talent and unforgettable
              venues since 2020.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">For Artists</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/authenticate"
                  className={`${colors.textMuted} ${colors.hoverBg} transition px-2 py-1 rounded`}
                >
                  Sign Up
                </Link>
              </li>
              <li>
                <Link
                  href="/artist-resources"
                  className={`${colors.textMuted} ${colors.hoverBg} transition px-2 py-1 rounded`}
                >
                  Resources
                </Link>
              </li>
              <li>
                <Link
                  href="/artist-faq"
                  className={`${colors.textMuted} ${colors.hoverBg} transition px-2 py-1 rounded`}
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">For Clients</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/authenticate"
                  className={`${colors.textMuted} ${colors.hoverBg} transition px-2 py-1 rounded`}
                >
                  Sign Up
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className={`${colors.textMuted} ${colors.hoverBg} transition px-2 py-1 rounded`}
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/client-faq"
                  className={`${colors.textMuted} ${colors.hoverBg} transition px-2 py-1 rounded`}
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">For Bookers</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/authenticate"
                  className={`${colors.textMuted} ${colors.hoverBg} transition px-2 py-1 rounded`}
                >
                  Sign Up
                </Link>
              </li>
              <li>
                <Link
                  href="/booker-resources"
                  className={`${colors.textMuted} ${colors.hoverBg} transition px-2 py-1 rounded`}
                >
                  Resources
                </Link>
              </li>
              <li>
                <Link
                  href="/booker-faq"
                  className={`${colors.textMuted} ${colors.hoverBg} transition px-2 py-1 rounded`}
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div
          className={`max-w-6xl mx-auto mt-12 pt-8 ${colors.border} text-center ${colors.textMuted}`}
        >
          <p>© {new Date().getFullYear()} gigUup. All rights reserved.</p>
          <div className="flex justify-center space-x-6 mt-4">
            <Link
              href="/privacy"
              className={`${colors.textMuted} ${colors.hoverBg} transition px-2 py-1 rounded`}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className={`${colors.textMuted} ${colors.hoverBg} transition px-2 py-1 rounded`}
            >
              Terms of Service
            </Link>
            <Link
              href="/cookies"
              className={`${colors.textMuted} ${colors.hoverBg} transition px-2 py-1 rounded`}
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
