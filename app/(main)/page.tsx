"use client";
import {
  useAuth,
  SignInButton,
  SignUpButton,
  SignOutButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useUserStore } from "@/app/stores";
import {
  ArrowRight,
  Sparkles,
  Crown,
  Users,
  Music,
  Target,
  Zap,
  Star,
  Check,
  X,
  AlertCircle,
  User,
  LogOut,
  LayoutDashboard,
  Headphones,
  Mic,
  Calendar,
  Wallet,
  TrendingUp,
  Shield,
  Bell,
  Settings,
  Search,
  Plus,
  Music2,
  Disc,
  Radio,
  Volume2,
  Music4,
  Album,
  Mic2,
  Podcast,
  Heart,
  Share2,
  Bookmark,
  MessageSquare,
  ThumbsUp,
  Cpu,
  Cctv,
  Terminal,
  Database,
  Network,
  Server,
  Code,
  Cloud,
  Wifi,
  Satellite,
  Globe,
  RadioTower,
  BarChart,
  PieChart,
  LineChart,
  Activity,
  Filter,
  Menu,
  XIcon,
  CheckCircle,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Volume,
  Clock,
  Grid,
  List,
  Map,
  Navigation,
  Award,
  Briefcase,
  Building,
  DollarSign,
  CreditCard,
  FileText,
  File,
  Folder,
  Upload,
  Download,
  Edit,
  Trash,
  Copy,
  Link as LinkIcon,
  ExternalLink,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Key,
  QrCode,
  Smartphone,
  Monitor,
  Tablet,
  Watch,
  Headset,
  Keyboard,
  Mouse,
  HardDrive,
  Router,
  Bluetooth,
  Battery,
  Power,
  RefreshCw,
  RotateCcw,
  PowerOff,
  Settings as SettingsIcon,
  UserCheck,
  Users as UsersIcon,
  UserPlus,
  UserMinus,
  UserX,
  Video,
  Phone,
  Mail,
  MessageCircle,
  MessageSquare as MessageSquareIcon,
  Send,
  Paperclip,
  Image,
  Video as VideoIcon,
  Film,
  Camera,
  MicOff,
  PhoneOff,
  PhoneCall,
  PhoneForwarded,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Voicemail,
  Rss,
  AtSign,
  Hash,
  Tag,
  BellOff,
  BellRing,
  Megaphone,
  Speaker,
  Radio as RadioIcon,
  Tv,
  Film as FilmIcon,
  Disc as DiscIcon,
  Album as AlbumIcon,
  Music as MusicIcon,
  Headphones as HeadphonesIcon,
  Volume1,
  VolumeX,
  Volume2 as Volume2Icon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/useTheme";
import GigLoader from "@/components/(main)/GigLoader";
import { useCheckTrial } from "@/hooks/useCheckTrial";
import { FeatureDiscovery } from "@/components/features/FeatureDiscovery";
import { ALL_FEATURES, getRoleFeatures } from "@/lib/registry";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
// Tech Gradient Palettes
const TECH_PALETTES = {
  neon: {
    primary: "from-cyan-500 to-blue-500",
    accent: "via-emerald-400",
    light: "cyan-50",
    dark: "blue-950",
  },
  synthwave: {
    primary: "from-purple-500 to-pink-500",
    accent: "via-rose-400",
    light: "purple-50",
    dark: "purple-950",
  },
  cyberpunk: {
    primary: "from-green-500 to-teal-500",
    accent: "via-lime-400",
    light: "green-50",
    dark: "green-950",
  },
  matrix: {
    primary: "from-emerald-500 to-green-500",
    accent: "via-teal-400",
    light: "emerald-50",
    dark: "emerald-950",
  },
  hollywood: {
    primary: "from-red-500 to-orange-500",
    accent: "via-amber-400",
    light: "red-50",
    dark: "red-950",
  },
  studio: {
    primary: "from-violet-500 to-indigo-500",
    accent: "via-purple-400",
    light: "violet-50",
    dark: "violet-950",
  },
};

export default function Home() {
  const { isLoaded, userId } = useAuth();
  const { colors, isDarkMode, mounted } = useThemeColors();
  const { user, isLoading, isAuthenticated } = useUserStore();
  const { isInGracePeriod, daysLeft } = useCheckTrial();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [activePalette, setActivePalette] = useState(TECH_PALETTES.neon);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const featuredTestimonials =
    useQuery(api.controllers.testimonials.getFeaturedTestimonials) || [];

  // Rotate through tech palettes
  useEffect(() => {
    const palettes = Object.values(TECH_PALETTES);
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * palettes.length);
      setActivePalette(palettes[randomIndex]);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Ambient studio sounds
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/sounds/studio-ambient.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.15;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (audioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      setAudioPlaying(!audioPlaying);
    }
  };

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      updateActiveSection();
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const updateActiveSection = () => {
    const sections = ["hero", "platform", "features", "pro"];
    const scrollPosition = window.scrollY + 100;

    for (const section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const { offsetTop, offsetHeight } = element;
        if (
          scrollPosition >= offsetTop &&
          scrollPosition < offsetTop + offsetHeight
        ) {
          setActiveSection(section);
          break;
        }
      }
    }
  };

  // Profile completion logic
  const isProfileComplete =
    isAuthenticated &&
    user &&
    user.firstTimeInProfile === false &&
    ((user.isMusician &&
      user.date &&
      user.month &&
      user.year &&
      user.roleType) ||
      (user.roleType === "teacher" && user.date && user.month && user.year) ||
      (user.isClient && user.firstname) ||
      (user.isBooker && user.firstname));

  const needsUpgrade =
    isAuthenticated && !isInGracePeriod && user?.tier !== "pro";

  // Dynamic navigation
  const getDynamicHref = () => {
    if (!userId || !user?.firstname) return `/profile`;
    if (!user?.isClient && !user?.isMusician && !user?.isBooker)
      return `/roles/${userId}`;
    if (user?.isClient)
      return !user?.onboardingComplete ? `/dashboard` : `/hub/gigs?tab=my_gigs`;
    if (user?.isBooker)
      return !user?.onboardingComplete
        ? `/dashboard`
        : `/hub/gigs?tab=applications`;
    if (user?.isMusician)
      return user?.onboardingComplete ? `/dashboard` : `/hub/gigs?tab=all`;
    return `/roles/${userId}`;
  };

  // User role display
  const getUserRoleDisplay = () => {
    if (user?.isMusician) return "Performer";
    if (user?.roleType === "teacher") return "Instructor";
    if (user?.isClient) return "Event Manager";
    if (user?.isBooker) return "Talent Booker";
    return "New User";
  };

  if (!isLoaded || !mounted || isLoading) {
    return <GigLoader title="Initializing..." size="lg" fullScreen={true} />;
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Studio Audio Toggle */}
      <button
        onClick={toggleAudio}
        className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-lg border border-cyan-500/30 hover:scale-110 transition-all"
        title={audioPlaying ? "Pause studio ambience" : "Play studio ambience"}
      >
        {audioPlaying ? (
          <Volume1 className="w-5 h-5 text-cyan-400" />
        ) : (
          <VolumeX className="w-5 h-5 text-cyan-400" />
        )}
      </button>

      {/* Tech Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Digital Grid */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, ${activePalette.light} 1px, transparent 1px),
                linear-gradient(to bottom, ${activePalette.light} 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        {/* Floating Tech Icons */}
        {[
          <Cpu key="cpu" />,
          <Terminal key="terminal" />,
          <Database key="db" />,
          <Server key="server" />,
          <Code key="code" />,
          <Network key="network" />,
        ].map((Icon, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.sin(i) * 100],
              y: [0, Math.cos(i) * 80, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          >
            {Icon}
          </motion.div>
        ))}

        {/* Digital Particles */}
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, ${activePalette.light.split("-")[0]}-400/30, transparent)`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-500",
          isScrolled
            ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b"
            : "bg-transparent",
          `border-${activePalette.light.split("-")[0]}-500/20`
        )}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                className="relative"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    `bg-gradient-to-br ${activePalette.primary}`
                  )}
                >
                  <Headphones className="w-6 h-6 text-white" />
                </div>
              </motion.div>
              <div>
                <h1
                  className={cn(
                    "text-2xl font-black bg-clip-text text-transparent",
                    `bg-gradient-to-r ${activePalette.primary}`
                  )}
                >
                  GigUpp
                </h1>
                <p
                  className={`text-xs ${activePalette.light.split("-")[0]}-600/60 dark:${activePalette.light.split("-")[0]}-400/60`}
                >
                  Professional Music Platform
                </p>
              </div>
            </Link>

            {/* Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {["platform", "features", "pro"].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={cn(
                    "text-sm font-medium transition-all duration-300 relative group",
                    activeSection === section
                      ? `${activePalette.light.split("-")[0]}-600 dark:${activePalette.light.split("-")[0]}-400`
                      : "text-gray-600 dark:text-gray-300 hover:text-cyan-500"
                  )}
                >
                  <span className="capitalize">
                    {section === "platform"
                      ? "Platform"
                      : section === "features"
                        ? "Features"
                        : "Pro Tools"}
                  </span>
                  <div
                    className={cn(
                      "absolute -bottom-1 left-0 right-0 h-0.5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300",
                      activeSection === section
                        ? `scale-x-100 bg-gradient-to-r ${activePalette.primary}`
                        : `bg-gradient-to-r ${activePalette.primary}`
                    )}
                  />
                </button>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    href={getDynamicHref()}
                    className={cn(
                      "px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300",
                      `bg-gradient-to-r ${activePalette.primary} text-white`,
                      "hover:shadow-lg hover:scale-105"
                    )}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className={cn(
                      "w-9 h-9 rounded-xl border-2 flex items-center justify-center hover:scale-105 transition-all",
                      `border-${activePalette.light.split("-")[0]}-500/30`,
                      `bg-gradient-to-br ${activePalette.light}/10 ${activePalette.dark}/10`
                    )}
                  >
                    <User
                      className={`w-4 h-4 ${activePalette.light.split("-")[0]}-500`}
                    />
                  </button>
                </>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <button className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-cyan-500 transition-colors">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button
                      className={cn(
                        "px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300",
                        `bg-gradient-to-r ${activePalette.primary} text-white`,
                        "hover:shadow-lg hover:scale-105"
                      )}
                    >
                      Get Started
                    </button>
                  </SignUpButton>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      >
        {/* Tech Gradient Background */}
        <div className="absolute inset-0">
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br",
              isDarkMode
                ? `from-${activePalette.dark} via-gray-900 to-black`
                : `from-${activePalette.light} via-white to-gray-100`
            )}
          />

          {/* Animated Grid Overlay */}
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(90deg, ${activePalette.light.split("-")[0]}-500/5 1px, transparent 1px),
                linear-gradient(180deg, ${activePalette.light.split("-")[0]}-500/5 1px, transparent 1px)
              `,
              backgroundSize: "30px 30px",
            }}
            animate={{
              backgroundPosition: ["0px 0px", "30px 30px"],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            {/* Upgrade Banner */}
            {needsUpgrade && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "mb-8 p-4 rounded-2xl backdrop-blur-lg border",
                  `bg-gradient-to-r ${activePalette.primary}/10 ${activePalette.light.split("-")[0]}-500/10`,
                  `border-${activePalette.light.split("-")[0]}-500/20`
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg bg-gradient-to-r ${activePalette.primary}`}
                    >
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p
                        className={`font-semibold ${activePalette.light.split("-")[0]}-600 dark:${activePalette.light.split("-")[0]}-400`}
                      >
                        Upgrade to Pro
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {!isInGracePeriod
                          ? "Your trial has ended. Upgrade for professional features."
                          : `${daysLeft} days left in trial`}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/billing"
                    className={`px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r ${activePalette.primary} text-white hover:scale-105 transition-transform`}
                  >
                    Upgrade Now
                  </Link>
                </div>
              </motion.div>
            )}

            <div className="text-center space-y-12">
              {/* Welcome */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="space-y-8"
              >
                {/* Role Badge */}
                {isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r ${activePalette.light}/10 ${activePalette.dark}/10 border ${activePalette.light.split("-")[0]}-500/20 backdrop-blur-sm`}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`w-2 h-2 rounded-full bg-gradient-to-r ${activePalette.primary}`}
                    />
                    <span
                      className={`text-sm font-semibold ${activePalette.light.split("-")[0]}-600 dark:${activePalette.light.split("-")[0]}-400`}
                    >
                      {getUserRoleDisplay()}
                    </span>
                  </motion.div>
                )}

                {/* Main Heading */}
                <div>
                  <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6">
                    <span
                      className={`text-transparent bg-gradient-to-r ${activePalette.primary} ${activePalette.accent} bg-clip-text`}
                    >
                      {isAuthenticated ? (
                        <>
                          Welcome{user?.firstname ? `, ${user.firstname}` : ""}
                          <br />
                          {isProfileComplete
                            ? "Ready to Perform?"
                            : "Complete Your Profile"}
                        </>
                      ) : (
                        <>
                          Sync Your Talent.
                          <br />
                          Book Your Stage.
                          <br />
                          Amplify Your Career.
                        </>
                      )}
                    </span>
                  </h1>
                  <p
                    className={cn(
                      "text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed",
                      "text-gray-700 dark:text-gray-300"
                    )}
                  >
                    {isAuthenticated
                      ? isProfileComplete
                        ? "The professional platform for musicians, bookers, and event managers"
                        : "Complete your profile to access gigs, bookings, and career opportunities"
                      : "The definitive platform connecting professional musicians with premium performance opportunities"}
                  </p>
                </div>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                {isAuthenticated ? (
                  needsUpgrade ? (
                    <Link
                      href="/dashboard/billing"
                      className="group relative px-10 py-5 text-lg font-semibold rounded-2xl overflow-hidden"
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${activePalette.primary}`}
                      />
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${activePalette.light.split("-")[0]}-600 ${activePalette.light.split("-")[0]}-700 opacity-0 group-hover:opacity-100 transition-opacity`}
                      />
                      <div className="relative flex items-center gap-3 text-white">
                        <Crown className="w-5 h-5" />
                        Upgrade to Pro
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </Link>
                  ) : (
                    <Link
                      href={getDynamicHref()}
                      className="group relative px-10 py-5 text-lg font-semibold rounded-2xl overflow-hidden"
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${activePalette.primary}`}
                      />
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${activePalette.light.split("-")[0]}-600 ${activePalette.light.split("-")[0]}-700 opacity-0 group-hover:opacity-100 transition-opacity`}
                      />
                      <div className="relative flex items-center gap-3 text-white">
                        <Sparkles className="w-5 h-5" />
                        {isProfileComplete
                          ? "Go to Dashboard"
                          : "Complete Profile"}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </Link>
                  )
                ) : (
                  <>
                    <SignUpButton mode="modal">
                      <button className="group relative px-10 py-5 text-lg font-semibold rounded-2xl overflow-hidden">
                        <div
                          className={`absolute inset-0 bg-gradient-to-r ${activePalette.primary}`}
                        />
                        <div
                          className={`absolute inset-0 bg-gradient-to-r ${activePalette.light.split("-")[0]}-600 ${activePalette.light.split("-")[0]}-700 opacity-0 group-hover:opacity-100 transition-opacity`}
                        />
                        <span className="relative text-white">
                          Start Free Trial
                        </span>
                      </button>
                    </SignUpButton>
                    <SignInButton mode="modal">
                      <button
                        className={cn(
                          "px-10 py-5 text-lg font-semibold rounded-2xl border-2",
                          `border-${activePalette.light.split("-")[0]}-500 text-${activePalette.light.split("-")[0]}-500`,
                          "hover:bg-cyan-500/10 transition-colors"
                        )}
                      >
                        Sign In
                      </button>
                    </SignInButton>
                  </>
                )}
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="pt-16"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
                  {[
                    {
                      number: "10K+",
                      label: "Professional Artists",
                      icon: <Mic className="w-6 h-6" />,
                    },
                    {
                      number: "5K+",
                      label: "Premium Venues",
                      icon: <Building className="w-6 h-6" />,
                    },
                    {
                      number: "$2M+",
                      label: "Paid to Artists",
                      icon: <DollarSign className="w-6 h-6" />,
                    },
                    {
                      number: "98%",
                      label: "Booking Success",
                      icon: <CheckCircle className="w-6 h-6" />,
                    },
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="text-center group"
                    >
                      <div
                        className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${activePalette.light}/10 ${activePalette.dark}/10 mb-4 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <div
                          className={`${activePalette.light.split("-")[0]}-500 group-hover:${activePalette.light.split("-")[0]}-400 transition-colors`}
                        >
                          {stat.icon}
                        </div>
                      </div>
                      <div
                        className={`text-3xl font-bold bg-gradient-to-r ${activePalette.primary} bg-clip-text text-transparent`}
                      >
                        {stat.number}
                      </div>
                      <div
                        className={cn(
                          "text-sm mt-2",
                          "text-gray-600 dark:text-gray-400"
                        )}
                      >
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div
            className={`w-6 h-10 rounded-full border-2 ${activePalette.light.split("-")[0]}-500/30 flex items-start justify-center p-1`}
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={`w-1 h-3 rounded-full bg-gradient-to-b ${activePalette.primary}`}
            />
          </div>
        </motion.div>
      </section>

      {/* Platform Section */}
      {/* Platform Section */}
      <section id="platform" className="py-32 px-6 relative overflow-hidden">
        {/* Gradient Background */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-b",
            isDarkMode
              ? `from-${activePalette.dark}/20 via-gray-900/10 to-black/20`
              : `from-${activePalette.light}/30 via-white/20 to-gray-100/30`
          )}
        />

        {/* Animated Circuit Lines */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`circuit-${i}`}
              className="absolute w-full h-1"
              style={{
                background: `linear-gradient(90deg, transparent, ${activePalette.light.split("-")[0]}-500/10, transparent)`,
                top: `${i * 33}%`,
              }}
              animate={{
                x: [-1000, 1000],
              }}
              transition={{
                duration: 15 + i * 3,
                repeat: Infinity,
                delay: i * 1.5,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r ${activePalette.light}/10 ${activePalette.dark}/10 border ${activePalette.light.split("-")[0]}-500/20 mb-6`}
            >
              <Cpu className="w-5 h-5 text-cyan-500" />
              <span
                className={`text-sm font-semibold ${activePalette.light.split("-")[0]}-600 dark:${activePalette.light.split("-")[0]}-400`}
              >
                INTEGRATED PLATFORM
              </span>
            </motion.div>

            <h2 className="text-5xl md:text-6xl font-black mb-8">
              <span
                className={`text-transparent bg-gradient-to-r ${activePalette.primary} bg-clip-text`}
              >
                "GigUpp: Get booked, get paid, repeat"
              </span>
            </h2>
            <p
              className={cn(
                "text-xl max-w-3xl mx-auto",
                "text-gray-700 dark:text-gray-300"
              )}
            >
              {isAuthenticated
                ? user?.isMusician
                  ? "Your talent deserves the perfect stage. Find gigs that match your style."
                  : user?.isClient
                    ? "Find the perfect talent for your event from our curated professional network."
                    : user?.isBooker
                      ? "Discover, book, and manage talent seamlessly across all venues."
                      : "Seamlessly connect with venues, book gigs, manage schedules, and get paid — all in one professional ecosystem"
                : "Seamlessly connect with venues, book gigs, manage schedules, and get paid — all in one professional ecosystem"}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* For Musicians Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="group"
            >
              <div
                className={cn(
                  "relative p-8 rounded-2xl border backdrop-blur-sm h-full",
                  "bg-gradient-to-br from-white/90 to-white/80",
                  "dark:from-gray-900/90 dark:to-gray-800/80",
                  `border-${activePalette.light.split("-")[0]}-500/20 hover:border-${activePalette.light.split("-")[0]}-500/40 transition-all duration-500`
                )}
              >
                <div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <Mic2 className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  For Artists & Performers
                </h3>
                <p
                  className={cn(
                    "text-gray-600 dark:text-gray-400 mb-6",
                    "leading-relaxed"
                  )}
                >
                  Showcase your talent, find paid gigs, manage bookings, and
                  build your music career
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Find paid performance opportunities
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {user?.isMusician && user?.roleType === "teacher"
                        ? "List teaching services and schedule lessons"
                        : user?.isMusician &&
                            user?.roleType === "instrumentalist"
                          ? "Showcase your instrument mastery"
                          : user?.isMusician && user?.roleType === "vocalist"
                            ? "Highlight your vocal range and style"
                            : user?.isMusician && user?.roleType === "dj"
                              ? "Display your mixes and set lists"
                              : user?.isMusician && user?.roleType === "mc"
                                ? "Showcase your hosting skills"
                                : "Create professional artist portfolio"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Manage bookings and calendar
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Secure payment processing
                    </span>
                  </div>
                </div>

                {/* Musician Type Badge */}
                {isAuthenticated && user?.isMusician && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        {user?.roleType === "teacher"
                          ? "Music Instructor"
                          : user?.roleType === "instrumentalist"
                            ? "Instrumentalist"
                            : user?.roleType === "vocalist"
                              ? "Vocalist"
                              : user?.roleType === "dj"
                                ? "DJ"
                                : user?.roleType === "mc"
                                  ? "MC / Host"
                                  : "Performer"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Tech glow effect */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-5 transition-opacity duration-500 -z-10`}
                />
              </div>
            </motion.div>

            {/* For Clients Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group"
            >
              <div
                className={cn(
                  "relative p-8 rounded-2xl border backdrop-blur-sm h-full",
                  "bg-gradient-to-br from-white/90 to-white/80",
                  "dark:from-gray-900/90 dark:to-gray-800/80",
                  `border-${activePalette.light.split("-")[0]}-500/20 hover:border-${activePalette.light.split("-")[0]}-500/40 transition-all duration-500`
                )}
              >
                <div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <Building className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  For Event Planners & Venues
                </h3>
                <p
                  className={cn(
                    "text-gray-600 dark:text-gray-400 mb-6",
                    "leading-relaxed"
                  )}
                >
                  Find the perfect talent for weddings, corporate events,
                  venues, and private parties
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Browse curated professional talent
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Post gigs and receive applications
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Manage event bookings and contracts
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {user?.isClient
                        ? "Access your booked talent dashboard"
                        : "Secure payment and booking system"}
                    </span>
                  </div>
                </div>

                {/* Client Badge */}
                {isAuthenticated && user?.isClient && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        Event Manager
                      </span>
                    </div>
                  </div>
                )}

                {/* Tech glow effect */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-5 transition-opacity duration-500 -z-10`}
                />
              </div>
            </motion.div>

            {/* For Bookers Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="group"
            >
              <div
                className={cn(
                  "relative p-8 rounded-2xl border backdrop-blur-sm h-full",
                  "bg-gradient-to-br from-white/90 to-white/80",
                  "dark:from-gray-900/90 dark:to-gray-800/80",
                  `border-${activePalette.light.split("-")[0]}-500/20 hover:border-${activePalette.light.split("-")[0]}-500/40 transition-all duration-500`
                )}
              >
                <div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <Briefcase className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  For Talent Bookers & Agents
                </h3>
                <p
                  className={cn(
                    "text-gray-600 dark:text-gray-400 mb-6",
                    "leading-relaxed"
                  )}
                >
                  Discover, book, and manage talent across multiple venues and
                  events
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Access premium talent database
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {user?.isBooker
                        ? "Manage your talent roster"
                        : "Negotiate rates and contracts"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Coordinate schedules across venues
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Track commissions and payments
                    </span>
                  </div>
                </div>

                {/* Booker Badge */}
                {isAuthenticated && user?.isBooker && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <UsersIcon className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        Talent Booker
                      </span>
                    </div>
                  </div>
                )}

                {/* Tech glow effect */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-5 transition-opacity duration-500 -z-10`}
                />
              </div>
            </motion.div>
          </div>

          {/* Call to action based on user role */}
          {isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-16 text-center"
            >
              <div
                className={cn(
                  "inline-block px-8 py-4 rounded-2xl border backdrop-blur-sm",
                  `bg-gradient-to-r ${activePalette.light}/10 ${activePalette.dark}/10`,
                  `border-${activePalette.light.split("-")[0]}-500/20`
                )}
              >
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  {user?.isMusician
                    ? user?.roleType === "teacher"
                      ? "Ready to share your knowledge and grow your teaching business?"
                      : user?.roleType === "instrumentalist"
                        ? "Ready to showcase your instrumental skills and find gigs?"
                        : user?.roleType === "vocalist"
                          ? "Ready to share your voice and book performances?"
                          : user?.roleType === "dj"
                            ? "Ready to spin tracks and book shows?"
                            : user?.roleType === "mc"
                              ? "Ready to host events and showcase your skills?"
                              : "Ready to find your next performance opportunity?"
                    : user?.isClient
                      ? "Ready to find the perfect talent for your next event?"
                      : user?.isBooker
                        ? "Ready to discover and book amazing talent?"
                        : "Ready to get started?"}
                </p>
                <div className="mt-4">
                  <Link
                    href={getDynamicHref()}
                    className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${activePalette.primary} text-white font-semibold rounded-xl hover:scale-105 transition-transform`}
                  >
                    {user?.isMusician
                      ? "Find Gigs Now"
                      : user?.isClient
                        ? "Browse Talent"
                        : user?.isBooker
                          ? "Discover Talent"
                          : "Get Started"}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 relative">
        {/* Tech Pattern Background */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${activePalette.light.split("-")[0]}-500 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r ${activePalette.light}/10 ${activePalette.dark}/10 border ${activePalette.light.split("-")[0]}-500/20 mb-6`}
            >
              <Zap className="w-5 h-5 text-amber-500" />
              <span
                className={`text-sm font-semibold ${activePalette.light.split("-")[0]}-600 dark:${activePalette.light.split("-")[0]}-400`}
              >
                PROFESSIONAL FEATURES
              </span>
            </motion.div>

            <h2 className="text-5xl md:text-6xl font-black mb-8">
              <span
                className={`text-transparent bg-gradient-to-r ${activePalette.primary} bg-clip-text`}
              >
                Tools That Power Careers
              </span>
            </h2>
          </div>

          <FeatureDiscovery
            features={ALL_FEATURES}
            variant="mobile"
            title=""
            showLocked={!isAuthenticated}
          />
        </div>
      </section>

      {/* Pro Tools Section */}
      <section id="pro" className="py-32 px-6 relative overflow-hidden">
        {/* Dark Tech Gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-b ${activePalette.dark}/30 via-gray-900/20 to-black/30`}
        />

        {/* Digital Pulse Lines */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`pulse-${i}`}
            className="absolute left-0 right-0 h-px"
            style={{
              top: `${20 + i * 15}%`,
              background: `linear-gradient(90deg, transparent, ${activePalette.light.split("-")[0]}-500/10, transparent)`,
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.6,
            }}
          />
        ))}

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r ${activePalette.light}/10 ${activePalette.dark}/10 border ${activePalette.light.split("-")[0]}-500/20 mb-6`}
            >
              <Crown className="w-5 h-5 text-yellow-500" />
              <span
                className={`text-sm font-semibold ${activePalette.light.split("-")[0]}-600 dark:${activePalette.light.split("-")[0]}-400`}
              >
                PRO TOOLS
              </span>
            </motion.div>

            <h2 className="text-5xl md:text-6xl font-black mb-8">
              <span
                className={`text-transparent bg-gradient-to-r ${activePalette.primary} bg-clip-text`}
              >
                Premium Performance Suite
              </span>
            </h2>
          </div>

          <FeatureDiscovery
            features={
              isAuthenticated && isProfileComplete
                ? getRoleFeatures(user?.roleType || "all")
                : ALL_FEATURES
            }
            variant="dashboard"
            title=""
            showLocked={!isAuthenticated}
            maxFeatures={6}
          />

          {/* Upgrade CTA */}
          {user?.tier === "free" && isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={cn(
                "mt-16 p-10 rounded-3xl border backdrop-blur-lg",
                `bg-gradient-to-br ${activePalette.light}/5 ${activePalette.dark}/5 ${activePalette.light.split("-")[0]}-500/5`,
                `border-${activePalette.light.split("-")[0]}-500/20`
              )}
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div
                    className={`p-4 rounded-2xl bg-gradient-to-r ${activePalette.primary}`}
                  >
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3
                      className={`text-2xl font-bold ${activePalette.light.split("-")[0]}-600 dark:${activePalette.light.split("-")[0]}-400`}
                    >
                      Unlock Professional Tools
                    </h3>
                    <p
                      className={cn(
                        "text-lg mt-2",
                        "text-gray-600 dark:text-gray-400"
                      )}
                    >
                      Access advanced booking, analytics, and premium features
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard/billing"
                  className={`inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r ${activePalette.primary} text-white font-semibold rounded-xl hover:scale-105 transition-transform`}
                >
                  <Crown className="w-5 h-5" />
                  Upgrade to Pro
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Final CTA */}
      <section id="cta" className="py-32 px-6 relative overflow-hidden">
        {/* Dynamic Gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${activePalette.light}/40 ${activePalette.dark}/30 ${activePalette.light.split("-")[0]}-100/20`}
        />

        {/* Animated Tech Elements */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`tech-element-${i}`}
            className="absolute"
            style={{
              bottom: `${Math.random() * 100}%`,
              right: `${Math.random() * 100}%`,
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10 + i * 3,
              repeat: Infinity,
              delay: i * 1.5,
            }}
          >
            <Cpu
              className={`w-6 h-6 ${activePalette.light.split("-")[0]}-400/10`}
            />
          </motion.div>
        ))}

        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className={cn(
              "rounded-3xl p-16 text-center border backdrop-blur-xl",
              "bg-gradient-to-br from-white/90 via-white/80 to-white/70",
              "dark:from-gray-900/90 dark:via-gray-800/80 dark:to-gray-900/70",
              `border-${activePalette.light.split("-")[0]}-500/30 shadow-2xl`
            )}
          >
            <div className="max-w-2xl mx-auto space-y-10">
              <div>
                <h2 className="text-5xl md:text-6xl font-black mb-8">
                  <span
                    className={`text-transparent bg-gradient-to-r ${activePalette.primary} ${activePalette.accent} bg-clip-text`}
                  >
                    {isAuthenticated
                      ? isProfileComplete
                        ? needsUpgrade
                          ? "Go Professional"
                          : "Continue Performing"
                        : "Launch Your Career"
                      : "Start Your Journey"}
                  </span>
                </h2>
                <p
                  className={cn("text-xl", "text-gray-700 dark:text-gray-300")}
                >
                  {isAuthenticated
                    ? isProfileComplete
                      ? needsUpgrade
                        ? "Upgrade to Pro and access premium venues, higher rates, and advanced tools"
                        : "Your next performance opportunity is waiting"
                      : "Complete your profile to start booking gigs"
                    : "Join thousands of professional musicians building their careers"}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                {!isAuthenticated ? (
                  <>
                    <SignUpButton mode="modal">
                      <button className="group relative px-12 py-6 text-xl font-semibold rounded-2xl overflow-hidden">
                        <div
                          className={`absolute inset-0 bg-gradient-to-r ${activePalette.primary}`}
                        />
                        <div
                          className={`absolute inset-0 bg-gradient-to-r ${activePalette.light.split("-")[0]}-600 ${activePalette.dark.split("-")[0]}-700 opacity-0 group-hover:opacity-100 transition-opacity`}
                        />
                        <span className="relative text-white">
                          Start Free Trial
                        </span>
                      </button>
                    </SignUpButton>
                    <SignInButton mode="modal">
                      <button
                        className={cn(
                          "px-12 py-6 text-xl font-semibold rounded-2xl border-2",
                          `border-${activePalette.light.split("-")[0]}-500 text-${activePalette.light.split("-")[0]}-500`,
                          "hover:bg-cyan-500/10 transition-colors"
                        )}
                      >
                        Sign In
                      </button>
                    </SignInButton>
                  </>
                ) : needsUpgrade ? (
                  <Link
                    href="/dashboard/billing"
                    className="group relative px-12 py-6 text-xl font-semibold rounded-2xl overflow-hidden"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${activePalette.primary}`}
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${activePalette.light.split("-")[0]}-600 ${activePalette.dark.split("-")[0]}-700 opacity-0 group-hover:opacity-100 transition-opacity`}
                    />
                    <div className="relative flex items-center gap-3 text-white">
                      <Crown className="w-6 h-6" />
                      Upgrade to Pro
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </Link>
                ) : (
                  <Link
                    href={getDynamicHref()}
                    className="group relative px-12 py-6 text-xl font-semibold rounded-2xl overflow-hidden"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${activePalette.primary}`}
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${activePalette.light.split("-")[0]}-600 ${activePalette.dark.split("-")[0]}-700 opacity-0 group-hover:opacity-100 transition-opacity`}
                    />
                    <div className="relative flex items-center gap-3 text-white">
                      <Mic className="w-6 h-6" />
                      {isProfileComplete ? "Find Gigs Now" : "Complete Profile"}
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={cn(
          "py-16 px-6 border-t",
          `bg-gradient-to-b from-white to-${activePalette.light} dark:from-gray-900 dark:to-gray-800`,
          `border-${activePalette.light.split("-")[0]}-500/20`
        )}
      >
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${activePalette.primary} flex items-center justify-center`}
              >
                <Headphones className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h3
                  className={`text-2xl font-black bg-gradient-to-r ${activePalette.primary} bg-clip-text text-transparent`}
                >
                  GigUpp
                </h3>
                <p
                  className={`text-sm ${activePalette.light.split("-")[0]}-600/60 dark:${activePalette.light.split("-")[0]}-400/60`}
                >
                  Professional Music Platform
                </p>
              </div>
            </div>

            <div className="flex items-center gap-8">
              {["platform", "features", "pro"].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`text-sm text-gray-600 dark:text-gray-400 hover:${activePalette.light.split("-")[0]}-500 transition-colors`}
                >
                  {section === "platform"
                    ? "Platform"
                    : section === "features"
                      ? "Features"
                      : "Pro Tools"}
                </button>
              ))}
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} GigUpp. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Profile Completion Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-lg"
              onClick={() => setShowProfileModal(false)}
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={cn(
                "relative w-full max-w-2xl rounded-3xl border overflow-hidden",
                "bg-gradient-to-br from-white via-white to-white",
                "dark:from-gray-900 dark:via-gray-800 dark:to-gray-900",
                `border-${activePalette.light.split("-")[0]}-500/30`
              )}
            >
              {/* Modal Header */}
              <div className={`bg-gradient-to-r ${activePalette.primary} p-10`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                      <AlertCircle className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white">
                        Complete Your Profile
                      </h3>
                      <p className="text-cyan-100 text-sm mt-2">
                        Unlock gigs, bookings, and professional features
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className={cn("p-10", colors.background)}>
                <div className="grid md:grid-cols-2 gap-10 mb-10">
                  <div>
                    <h4
                      className={cn(
                        "text-xl font-semibold mb-6 flex items-center gap-3",
                        colors.text
                      )}
                    >
                      <User
                        className={`w-6 h-6 ${activePalette.light.split("-")[0]}-500`}
                      />
                      Required Information
                    </h4>
                    <div className="space-y-4">
                      {[
                        { condition: !user?.firstname, label: "Full Name" },
                        { condition: !user?.date, label: "Birth Date" },
                        { condition: !user?.month, label: "Birth Month" },
                        { condition: !user?.year, label: "Birth Year" },
                        {
                          condition: !user?.roleType,
                          label: "Professional Role",
                        },
                      ]
                        .filter((item) => item.condition)
                        .map((item, index) => (
                          <div
                            key={index}
                            className={cn(
                              "flex items-center gap-4 p-4 rounded-xl border",
                              `bg-gradient-to-r ${activePalette.light}/5 ${activePalette.dark}/5`,
                              `border-${activePalette.light.split("-")[0]}-500/20`
                            )}
                          >
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className={`w-3 h-3 rounded-full bg-gradient-to-r ${activePalette.primary}`}
                            />
                            <span
                              className={`${activePalette.light.split("-")[0]}-600 dark:${activePalette.light.split("-")[0]}-400 font-medium`}
                            >
                              {item.label}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <h4
                      className={cn(
                        "text-xl font-semibold mb-6 flex items-center gap-3",
                        colors.text
                      )}
                    >
                      <Star className="w-6 h-6 text-amber-500" />
                      Unlock Features
                    </h4>
                    <div className="space-y-4">
                      {[
                        "Gig Applications",
                        "Booking Management",
                        "Payment Processing",
                        "Professional Network",
                      ].map((benefit, index) => (
                        <div
                          key={index}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-xl border",
                            `bg-gradient-to-r ${activePalette.light}/5 ${activePalette.dark}/5`,
                            `border-${activePalette.light.split("-")[0]}-500/20`
                          )}
                        >
                          <Check
                            className={`w-5 h-5 ${activePalette.light.split("-")[0]}-500`}
                          />
                          <span
                            className={`${activePalette.light.split("-")[0]}-600 dark:${activePalette.light.split("-")[0]}-400 font-medium`}
                          >
                            {benefit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Profile Progress */}
                <div
                  className={cn(
                    "mb-10 p-8 rounded-2xl border",
                    "bg-gradient-to-r from-gray-50 to-gray-100",
                    "dark:from-gray-800 dark:to-gray-900",
                    colors.border
                  )}
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className={cn("font-semibold text-lg", colors.text)}>
                      Profile Completion
                    </span>
                    <span
                      className={`text-3xl font-bold bg-gradient-to-r ${activePalette.primary} bg-clip-text text-transparent`}
                    >
                      {Math.round(
                        (((user?.firstname ? 1 : 0) +
                          (user?.date ? 1 : 0) +
                          (user?.month ? 1 : 0) +
                          (user?.year ? 1 : 0) +
                          (user?.roleType ? 1 : 0)) /
                          5) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div
                    className={cn(
                      "w-full rounded-full h-3",
                      colors.backgroundMuted
                    )}
                  >
                    <div
                      className={`bg-gradient-to-r ${activePalette.primary} h-3 rounded-full transition-all duration-1000`}
                      style={{
                        width: `${
                          (((user?.firstname ? 1 : 0) +
                            (user?.date ? 1 : 0) +
                            (user?.month ? 1 : 0) +
                            (user?.year ? 1 : 0) +
                            (user?.roleType ? 1 : 0)) /
                            5) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-6 justify-between items-center">
                  <Link
                    href="/profile"
                    className="inline-flex items-center gap-3 px-10 py-5 text-lg font-semibold rounded-2xl transition-all duration-300 group"
                    onClick={() => setShowProfileModal(false)}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${activePalette.primary} rounded-2xl`}
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${activePalette.light.split("-")[0]}-600 ${activePalette.dark.split("-")[0]}-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    />
                    <User className="w-6 h-6 relative text-white" />
                    <span className="relative text-white">
                      Complete Profile
                    </span>
                  </Link>

                  <SignOutButton>
                    <button
                      className={cn(
                        "px-8 py-4 border text-sm font-medium rounded-xl transition-all duration-300",
                        "border-gray-300 dark:border-gray-600",
                        "text-gray-600 dark:text-gray-400",
                        "hover:text-red-400 hover:border-red-500 hover:bg-red-500/10"
                      )}
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Sign Out
                    </button>
                  </SignOutButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
