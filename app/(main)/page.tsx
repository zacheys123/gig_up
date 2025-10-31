"use client";
import Image from "next/image";
import { CircularProgress } from "@mui/material";
import {
  useAuth,
  SignInButton,
  SignUpButton,
  SignOutButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import thumbnailImage from "../../public/assets/discover4.webp";
import { useUserStore } from "@/app/stores"; // Import Zustand store
import {
  SaveAll,
  Play,
  Music,
  Users,
  Star,
  ArrowRight,
  Calendar,
  TrendingUp,
  X,
  AlertCircle,
  User,
  Calendar as CalendarIcon,
  Check,
  LogOut,
  Settings,
  Shield,
  Bell,
  Briefcase,
} from "lucide-react";
import LoadingSpinner from "./loading";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import GigLoader from "@/components/(main)/GigLoader";

export default function Home() {
  const { isLoaded, userId } = useAuth();
  const { colors, isDarkMode, mounted, userTheme } = useThemeColors();

  // ✅ Use Zustand store instead of useCurrentUser
  const { user, isLoading, isAuthenticated } = useUserStore();

  const [showVideo, setShowVideo] = useState(false);
  const [isClientSide, setIsClientSide] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    if (isStandalone) {
      console.log("Running as PWA");
    }
  }, []);

  useEffect(() => {
    setIsClientSide(true);
  }, []);

  // ✅ UPDATED: Profile completion logic for all roles
  const isProfileComplete =
    isAuthenticated &&
    user &&
    user.firstTimeInProfile === false &&
    // For musicians: require date of birth + role type
    ((user.isMusician &&
      user.date &&
      user.month &&
      user.year &&
      user.roleType) ||
      // For clients: only require basic profile completion
      (user.isClient && user.firstname) ||
      // For bookers: require basic profile completion
      (user.isBooker && user.firstname));

  const needsRoleSelection =
    isAuthenticated &&
    user?.firstname &&
    !user?.isClient &&
    !user?.isMusician &&
    !user?.isBooker;

  // ✅ UPDATED: Show modal for all roles with incomplete profiles
  const shouldShowProfileModal = isAuthenticated && user && !isProfileComplete;

  useEffect(() => {
    if (isAuthenticated && user) {
      if (shouldShowProfileModal) {
        setShowProfileModal(true);
      } else {
        setShowProfileModal(false);
      }
    }
  }, [isAuthenticated, user, shouldShowProfileModal]);

  const completionPercentage = user?.isMusician
    ? Math.round(
        (((user?.firstname ? 1 : 0) +
          (user?.date ? 1 : 0) +
          (user?.month ? 1 : 0) +
          (user?.year ? 1 : 0) +
          (user?.isMusician ? 1 : 0) +
          (user?.firstTimeInProfile === false ? 1 : 0)) /
          6) *
          100
      )
    : Math.round(
        (((user?.firstname ? 1 : 0) +
          (user?.isClient || user?.isBooker ? 1 : 0) +
          (user?.firstTimeInProfile === false ? 1 : 0)) /
          3) *
          100
      );

  const getDynamicHref = () => {
    if (!userId || !user?.firstname) return `/profile`;
    if (!user?.isClient && !user?.isMusician && !user?.isBooker)
      return `/roles/${userId}`;

    // All roles go to gigs hub with role-specific default tabs
    if (user?.isClient) {
      return !user?.onboardingComplete
        ? `/dashboard`
        : `/hub/gigs?tab=create_gigs`; // Changed from 'create' to 'my-gigs'
    }

    if (user?.isBooker) {
      return !user?.onboardingComplete
        ? `/dashboard`
        : `/hub/gigs?tab=applications`;
    }

    if (user?.isMusician) {
      return !user?.onboardingComplete ? `/dashboard` : `/hub/gigs?tab=all`;
    }

    return `/roles/${userId}`;
  };

  // Show loading spinner while auth, user data, or theme is loading
  if (!isLoaded || !mounted) {
    return <GigLoader title="Loading GigUp..." size="md" fullScreen={true} />;
  }

  if (isLoading) {
    return (
      <GigLoader title="Loading your profile..." size="lg" fullScreen={true} />
    );
  }

  // Features for different user types
  const guestFeatures = [
    {
      icon: <Music className="w-12 h-12 text-amber-500" />,
      title: "Share Your Music",
      description: "Upload and showcase your jam sessions to the world.",
    },
    {
      icon: <Users className="w-12 h-12 text-amber-500" />,
      title: "Connect with Artists",
      description: "Find and collaborate with musicians near you.",
    },
    {
      icon: <Star className="w-12 h-12 text-amber-500" />,
      title: "Book Gigs",
      description: "Discover performance opportunities and get booked.",
    },
    {
      icon: <Play className="w-12 h-12 text-amber-500" />,
      title: "Live Sessions",
      description: "Go live and connect with your audience in real-time.",
    },
  ];

  const musicianFeatures = [
    {
      icon: <Calendar className="w-12 h-12 text-green-500" />,
      title: "Find Gigs",
      description: "Discover performance opportunities in your area.",
    },
    {
      icon: <TrendingUp className="w-12 h-12 text-blue-500" />,
      title: "Grow Your Audience",
      description: "Connect with fans and build your following.",
    },
    {
      icon: <Users className="w-12 h-12 text-purple-500" />,
      title: "Collaborate",
      description: "Find other musicians for your next project.",
    },
    {
      icon: <Star className="w-12 h-12 text-amber-500" />,
      title: "Get Discovered",
      description: "Showcase your talent to venues and event organizers.",
    },
  ];

  const clientFeatures = [
    {
      icon: <Music className="w-12 h-12 text-green-500" />,
      title: "Find Talent",
      description: "Discover perfect musicians for your event.",
    },
    {
      icon: <Calendar className="w-12 h-12 text-blue-500" />,
      title: "Post Gigs",
      description: "Create listings and find the right performers.",
    },
    {
      icon: <Users className="w-12 h-12 text-purple-500" />,
      title: "Manage Bookings",
      description: "Easy scheduling and communication tools.",
    },
    {
      icon: <Star className="w-12 h-12 text-amber-500" />,
      title: "Quality Assurance",
      description: "Read reviews and listen to artist portfolios.",
    },
  ];

  const bookerFeatures = [
    {
      icon: <Briefcase className="w-12 h-12 text-indigo-500" />,
      title: "Talent Management",
      description: "Discover and manage talented musicians for events.",
    },
    {
      icon: <Calendar className="w-12 h-12 text-blue-500" />,
      title: "Event Planning",
      description: "Organize and coordinate multiple gigs and events.",
    },
    {
      icon: <Users className="w-12 h-12 text-purple-500" />,
      title: "Build Teams",
      description: "Create the perfect lineup for any occasion.",
    },
    {
      icon: <TrendingUp className="w-12 h-12 text-green-500" />,
      title: "Grow Your Roster",
      description: "Expand your network of reliable musicians.",
    },
  ];

  const currentFeatures = isAuthenticated
    ? user?.isMusician
      ? musicianFeatures
      : user?.isClient
        ? clientFeatures
        : user?.isBooker
          ? bookerFeatures
          : guestFeatures
    : guestFeatures;

  const getUserRoleDisplay = () => {
    if (user?.isMusician) return "Musician";
    if (user?.isClient) return "Client";
    if (user?.isBooker) return "Booker";
    return "User";
  };

  const getWelcomeMessage = () => {
    if (user?.isMusician) return "Ready to Perform?";
    if (user?.isClient) return "Ready to Hire?";
    if (user?.isBooker) return "Ready to Book?";
    return "Ready to Create?";
  };

  return (
    <>
      <div
        className={cn(
          `font-sans min-h-screen overflow-y-scroll snap-mandatory snap-y scroll-smooth ${showProfileModal ? "overflow-hidden" : ""}`,
          colors.background,
          colors.text
        )}
      >
        {/* Hero Section */}
        <section
          className={cn(
            "relative flex flex-col items-center justify-center min-h-screen text-center snap-start px-4",
            colors.background
          )}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          >
            <source
              src="https://res.cloudinary.com/dsziq73cb/video/upload/v1741577722/gigmeUpload/gww2kwzvdtkx4qxln6qu.mp4"
              type="video/mp4"
            />
          </video>
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-b from-black/60 to-gray-950/90"
            )}
          ></div>

          <motion.div
            className={cn(
              "relative z-10 px-6 py-12 backdrop-blur-xl rounded-2xl shadow-2xl border max-w-4xl w-full",
              colors.card,
              colors.cardBorder
            )}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.h1
              className="text-6xl md:text-7xl font-black tracking-tight leading-tight text-transparent bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 bg-clip-text mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              {isAuthenticated ? (
                <>
                  Welcome{user?.firstname ? `, ${user.firstname}` : " Back"}!
                  <br />
                  {isProfileComplete
                    ? getWelcomeMessage()
                    : "Complete Your Profile"}
                </>
              ) : (
                <>
                  Discover.
                  <br />
                  Create.
                  <br />
                  Perform.
                </>
              )}
            </motion.h1>

            <motion.p
              className={cn(
                "text-xl md:text-2xl mb-8 max-w-2xl mx-auto leading-relaxed",
                colors.textMuted
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              {isAuthenticated
                ? isProfileComplete
                  ? user?.isBooker
                    ? "Manage talent and book amazing performances for your events."
                    : "Continue your music journey and discover new opportunities."
                  : needsRoleSelection
                    ? "Tell us about yourself to unlock all features."
                    : "Let's set up your profile to get started."
                : "Join the ultimate platform connecting musicians, venues, and music lovers worldwide."}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              {isAuthenticated ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href={getDynamicHref()}
                    className="group px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-gray-900 text-lg font-bold rounded-full shadow-2xl hover:shadow-amber-500/25 hover:scale-105 transition-all duration-300 flex items-center gap-2"
                  >
                    {isAuthenticated
                      ? isProfileComplete
                        ? user?.isClient
                          ? "Find Talent" // CHANGED
                          : user?.isBooker
                            ? "Manage Gigs" // CHANGED
                            : "Find Gigs" // CHANGED
                        : needsRoleSelection
                          ? "Choose Your Role"
                          : user?.isClient
                            ? "Post Gigs" // CHANGED
                            : user?.isBooker
                              ? "Set Up Profile"
                              : "Complete Profile"
                      : "Get Started"}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  {isProfileComplete && (
                    <Link
                      href={
                        user?.isMusician
                          ? "/discover"
                          : user?.isBooker
                            ? "/auth/search"
                            : "/browse"
                      }
                      className="px-8 py-4 border-2 border-amber-500 text-amber-400 text-lg font-bold rounded-full hover:bg-amber-500/10 hover:scale-105 transition-all duration-300"
                    >
                      {user?.isMusician
                        ? "Browse Gigs" // CHANGED
                        : user?.isBooker
                          ? "Browse Talent"
                          : "Find Artists"}
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <button className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-gray-900 text-lg font-bold rounded-full shadow-2xl hover:shadow-amber-500/25 hover:scale-105 transition-all duration-300">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="px-8 py-4 border-2 border-amber-500 text-amber-400 text-lg font-bold rounded-full hover:bg-amber-500/10 hover:scale-105 transition-all duration-300">
                      Create Account
                    </button>
                  </SignUpButton>
                </>
              )}
            </motion.div>

            {/* User-specific stats */}
            <motion.div
              className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              style={{
                borderColor: isDarkMode
                  ? "rgba(55, 65, 81, 0.5)"
                  : "rgba(229, 231, 235, 0.5)",
              }}
            >
              {isAuthenticated && isProfileComplete
                ? // User-specific stats for logged-in users with complete profiles
                  [
                    {
                      number: user?.completedGigsCount?.toString() || "0",
                      label: user?.isBooker
                        ? "Events Managed"
                        : "Gigs Completed",
                    },
                    {
                      number: user?.followers?.length.toString() || "0",
                      label: user?.isBooker ? "Artists Managed" : "Followers",
                    },
                    {
                      number: user?.monthlyGigsBooked?.toString() || "0",
                      label: user?.isBooker ? "This Month" : "This Month",
                    },
                  ].map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl md:text-3xl font-bold text-amber-400">
                        {stat.number}
                      </div>
                      <div className={cn("text-sm mt-1", colors.textMuted)}>
                        {stat.label}
                      </div>
                    </div>
                  ))
                : // General stats for guests and incomplete profiles
                  [
                    { number: "10K+", label: "Active Musicians" },
                    { number: "5K+", label: "Gigs Posted" },
                    { number: "50K+", label: "Music Lovers" },
                  ].map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl md:text-3xl font-bold text-amber-400">
                        {stat.number}
                      </div>
                      <div className={cn("text-sm mt-1", colors.textMuted)}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section - Dynamic based on user type */}
        <section
          className={cn(
            "min-h-screen flex flex-col justify-center items-center snap-start py-20 px-4",
            colors.background
          )}
        >
          <motion.div
            className="text-center max-w-6xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl font-black mb-4 text-transparent bg-gradient-to-r from-amber-400 to-pink-500 bg-clip-text">
              {isAuthenticated
                ? isProfileComplete
                  ? `Features for ${getUserRoleDisplay()}s`
                  : "Why Join GigUp?"
                : "Why Choose GigUp?"}
            </h2>
            <p
              className={cn(
                "text-xl mb-16 max-w-2xl mx-auto",
                colors.textMuted
              )}
            >
              {isAuthenticated && isProfileComplete
                ? user?.isBooker
                  ? "Everything you need to manage talent and book amazing events"
                  : user?.isMusician
                    ? "Everything you need to grow your music career"
                    : "Everything you need to find amazing talent"
                : "Everything you need to grow your music career in one place"}
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {currentFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  className={cn(
                    "group backdrop-blur-sm p-8 rounded-2xl border transition-all duration-500 hover:scale-105",
                    colors.card,
                    colors.cardBorder,
                    "hover:border-amber-500/30"
                  )}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="flex justify-center mb-6">{feature.icon}</div>
                  <h3 className={cn("text-xl font-bold mb-3", colors.text)}>
                    {feature.title}
                  </h3>
                  <p className={cn("leading-relaxed", colors.textMuted)}>
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* How It Works Section */}
        <section
          className={cn(
            "min-h-screen flex flex-col justify-center items-center snap-start py-20 px-4",
            colors.background
          )}
        >
          <motion.div
            className="text-center max-w-6xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl font-black mb-4 text-transparent bg-gradient-to-r from-yellow-500 to-pink-600 bg-clip-text">
              {isAuthenticated && isProfileComplete
                ? "Next Steps"
                : "How It Works"}
            </h2>
            <p
              className={cn(
                "text-xl mb-12 max-w-2xl mx-auto",
                colors.textMuted
              )}
            >
              {isAuthenticated && isProfileComplete
                ? "Make the most of your GigUp experience"
                : "Get started in just a few simple steps"}
            </p>

            <div className="flex justify-center mb-12">
              {!showVideo ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1 }}
                  className="cursor-pointer relative group"
                  onClick={() => setShowVideo(true)}
                >
                  <Image
                    src={thumbnailImage}
                    alt="Video Thumbnail"
                    className="w-full max-w-4xl rounded-2xl shadow-2xl group-hover:shadow-amber-500/20 transition-all duration-300"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                      <Play className="w-8 h-8 text-gray-900 ml-1" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/20 rounded-2xl group-hover:bg-black/10 transition-all duration-300"></div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <video
                    controls
                    autoPlay
                    className="w-full max-w-4xl rounded-2xl shadow-2xl"
                    onEnded={() => setShowVideo(false)}
                  >
                    <source
                      src="https://res.cloudinary.com/dsziq73cb/video/upload/v1742520206/ike81qltg0etsoblov4c.mp4"
                      type="video/mp4"
                    />
                  </video>
                </motion.div>
              )}
            </div>

            {/* Dynamic steps based on user status */}
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              {isAuthenticated && isProfileComplete
                ? // Steps for users with complete profiles
                  [
                    {
                      step: "01",
                      title: "Explore",
                      description: user?.isMusician
                        ? "Browse available gigs in your area"
                        : user?.isBooker
                          ? "Discover talented musicians for your events"
                          : "Discover talented musicians",
                    },
                    {
                      step: "02",
                      title: "Connect",
                      description: user?.isMusician
                        ? "Apply for gigs and message clients"
                        : user?.isBooker
                          ? "Build your artist roster and manage events"
                          : "Post gigs and review applications",
                    },
                    {
                      step: "03",
                      title: "Grow",
                      description: user?.isMusician
                        ? "Build your portfolio and reputation"
                        : user?.isBooker
                          ? "Expand your network and event portfolio"
                          : "Build your network of reliable talent",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="text-center p-6"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.2, duration: 0.6 }}
                    >
                      <div className="text-4xl font-black text-amber-500 mb-4">
                        {item.step}
                      </div>
                      <h3 className={cn("text-xl font-bold mb-2", colors.text)}>
                        {item.title}
                      </h3>
                      <p className={cn(colors.textMuted)}>{item.description}</p>
                    </motion.div>
                  ))
                : // Steps for guests and incomplete profiles
                  [
                    {
                      step: "01",
                      title: "Create Profile",
                      description:
                        "Sign up and set up your musician, client, or booker profile",
                    },
                    {
                      step: "02",
                      title: "Connect",
                      description:
                        "Find musicians, gigs, or talent that match your needs",
                    },
                    {
                      step: "03",
                      title: "Perform",
                      description:
                        "Book gigs, share music, manage events, and grow",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="text-center p-6"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.2, duration: 0.6 }}
                    >
                      <div className="text-4xl font-black text-amber-500 mb-4">
                        {item.step}
                      </div>
                      <h3 className={cn("text-xl font-bold mb-2", colors.text)}>
                        {item.title}
                      </h3>
                      <p className={cn(colors.textMuted)}>{item.description}</p>
                    </motion.div>
                  ))}
            </div>
          </motion.div>

          {/* CTA Button for logged-in users */}
          {isAuthenticated && (
            <motion.div
              className="mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link
                href={getDynamicHref()}
                className="group px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-gray-900 text-lg font-bold rounded-full shadow-2xl hover:shadow-amber-500/25 hover:scale-105 transition-all duration-300 flex items-center gap-3"
              >
                <SaveAll className="w-5 h-5" />
                {isProfileComplete
                  ? "Open Dashboard"
                  : needsRoleSelection
                    ? "Choose Your Role"
                    : "Complete Profile"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          )}
        </section>

        {/* Final CTA Section */}
        <section
          className={cn(
            "min-h-screen flex flex-col justify-center items-center snap-start py-20 px-4",
            colors.background
          )}
        >
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl font-black mb-6 text-transparent bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text">
              {isAuthenticated
                ? isProfileComplete
                  ? getWelcomeMessage()
                  : "Ready to Complete Your Profile?"
                : "Ready to Start?"}
            </h2>
            <p
              className={cn("text-xl mb-8 max-w-2xl mx-auto", colors.textMuted)}
            >
              {isAuthenticated
                ? isProfileComplete
                  ? `Continue your journey as a ${getUserRoleDisplay().toLowerCase()}`
                  : "Complete your setup to unlock all features"
                : "Join thousands of musicians, clients, and bookers already on GigUp"}
            </p>

            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <SignUpButton mode="modal">
                  <button className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-gray-900 text-lg font-bold rounded-full shadow-2xl hover:shadow-amber-500/25 hover:scale-105 transition-all duration-300">
                    Get Started Free
                  </button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <button className="px-8 py-4 border-2 border-amber-500 text-amber-400 text-lg font-bold rounded-full hover:bg-amber-500/10 hover:scale-105 transition-all duration-300">
                    I Have an Account
                  </button>
                </SignInButton>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href={getDynamicHref()}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-gray-900 text-lg font-bold rounded-full shadow-2xl hover:shadow-amber-500/25 hover:scale-105 transition-all duration-300"
                >
                  {isProfileComplete
                    ? "Go to Dashboard"
                    : needsRoleSelection
                      ? "Choose Role"
                      : "Complete Profile"}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                {isProfileComplete && (
                  <Link
                    href={
                      user?.isMusician
                        ? "/profile"
                        : user?.isBooker
                          ? "/my-events"
                          : "/my-gigs"
                    }
                    className="px-8 py-4 border-2 border-amber-500 text-amber-400 text-lg font-bold rounded-full hover:bg-amber-500/10 hover:scale-105 transition-all duration-300"
                  >
                    {user?.isMusician
                      ? "My Profile"
                      : user?.isBooker
                        ? "My Events"
                        : "My Gigs"}
                  </Link>
                )}
              </div>
            )}
          </motion.div>
        </section>

        {/* Footer */}
        <footer
          className={cn(
            "min-h-40 flex flex-col justify-center items-center snap-start py-12 px-4 border-t",
            colors.background,
            colors.border
          )}
        >
          <p className={cn("text-center", colors.textMuted)}>
            © {new Date().getFullYear()} GigUp. All rights reserved.
            <br />
            <span className={cn("text-sm mt-2 block", colors.textSecondary)}>
              Connecting musicians, clients, and bookers through music
            </span>
          </p>
          {isAuthenticated && (
            <p className={cn("text-sm mt-4", colors.textMuted)}>
              Logged in as {user?.firstname || user?.username} (
              {getUserRoleDisplay()})
              {userTheme && (
                <span
                  className={cn("text-xs block mt-1", colors.textSecondary)}
                >
                  Theme: {userTheme}
                </span>
              )}
            </p>
          )}
        </footer>
      </div>

      {/* Professional Floating Profile Completion Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Enhanced backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              onClick={() => setShowProfileModal(false)}
            />

            {/* Floating Modal Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
              }}
              className={cn(
                "relative w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden",
                colors.card,
                colors.cardBorder
              )}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Complete Your Profile
                      </h3>
                      <p className="text-amber-100 text-sm">
                        Finish setup to unlock all features
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all duration-200"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Content Area - Improved visibility */}
              <div
                className={cn(
                  "p-6 max-h-[60vh] overflow-y-auto",
                  colors.background
                )}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Missing Information */}
                  <div className="space-y-3">
                    <h4
                      className={cn(
                        "text-lg font-semibold mb-3 flex items-center gap-2",
                        colors.text
                      )}
                    >
                      <User className="w-5 h-5 text-amber-500" />
                      Missing Information
                    </h4>

                    <div className="space-y-2">
                      {user?.isMusician && !user?.date && (
                        <div
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border",
                            colors.danger
                          )}
                        >
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className={cn("text-sm", colors.warningText)}>
                            Birth Date (Day)
                          </span>
                        </div>
                      )}

                      {user?.isMusician && !user?.month && (
                        <div
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border",
                            colors.danger
                          )}
                        >
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className={cn("text-sm", colors.warningText)}>
                            Birth Date (Month)
                          </span>
                        </div>
                      )}

                      {user?.isMusician && !user?.year && (
                        <div
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border",
                            colors.danger
                          )}
                        >
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className={cn("text-sm", colors.warningText)}>
                            Birth Date (Year)
                          </span>
                        </div>
                      )}

                      {!user?.isMusician &&
                        !user?.isClient &&
                        !user?.isBooker && (
                          <div
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg border",
                              colors.danger
                            )}
                          >
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className={cn("text-sm", colors.warningText)}>
                              Account Type
                            </span>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-3">
                    <h4
                      className={cn(
                        "text-lg font-semibold mb-3 flex items-center gap-2",
                        colors.text
                      )}
                    >
                      <Star className="w-5 h-5 text-green-500" />
                      Unlock Benefits
                    </h4>

                    <div className="space-y-2">
                      {[
                        "Full platform access",
                        user?.isBooker
                          ? "Manage talent and events"
                          : user?.isMusician
                            ? "Find gigs"
                            : "Find talent",
                        "Connect with community",
                        "Build your profile",
                      ].map((benefit, index) => (
                        <div
                          key={index}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border",
                            colors.successBg,
                            colors.successBorder
                          )}
                        >
                          <Check className="w-4 h-4 text-green-500" />
                          <span className={cn("text-sm", colors.successText)}>
                            {benefit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Progress Section */}
                <div
                  className={cn(
                    "mb-6 p-4 rounded-xl border",
                    colors.backgroundSecondary,
                    colors.border
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={cn("font-medium", colors.text)}>
                      Profile Completion
                    </span>
                    <span className="text-amber-400 font-bold">
                      {completionPercentage}%
                    </span>
                  </div>
                  <div
                    className={cn(
                      "w-full rounded-full h-2",
                      colors.backgroundMuted
                    )}
                  >
                    <div
                      className="bg-gradient-to-r from-amber-500 to-orange-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          (((user?.firstname ? 1 : 0) +
                            (user?.date ? 1 : 0) +
                            (user?.month ? 1 : 0) +
                            (user?.year ? 1 : 0) +
                            (user?.isMusician ||
                            user?.isClient ||
                            user?.isBooker
                              ? 1
                              : 0)) /
                            5) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                  <Link
                    href="/profile"
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-gray-900 font-semibold rounded-lg hover:shadow-amber-500/25 hover:scale-105 transition-all duration-300 flex items-center gap-2 justify-center"
                    onClick={() => setShowProfileModal(false)}
                  >
                    <User className="w-4 h-4" />
                    Complete Profile
                  </Link>

                  <SignOutButton>
                    <button
                      className={cn(
                        "w-full sm:w-auto px-4 py-2 border text-sm font-medium rounded-lg transition-all duration-300 flex items-center gap-2 justify-center",
                        colors.border,
                        colors.textMuted,
                        "hover:text-red-400 hover:border-red-500 hover:bg-red-500/10"
                      )}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </SignOutButton>
                </div>

                <p className={cn("text-center text-xs mt-4", colors.textMuted)}>
                  Complete your profile for the best experience
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
