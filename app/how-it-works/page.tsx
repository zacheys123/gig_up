// app/how-it-works/page.tsx - UPDATED WITH TRUST STARS
"use client";

import { cn } from "@/lib/utils";
import {
  FaAward,
  FaCrown,
  FaFire,
  FaHeart,
  FaRegClock,
  FaStar,
  FaThumbsDown,
  FaShieldAlt,
  FaChartLine,
  FaRocket,
  FaSun,
  FaMoon,
  FaUserCheck,
  FaPhoneAlt,
  FaMoneyBillWave,
  FaUsers,
  FaCalendarCheck,
  FaChartBar,
  FaHandshake,
  FaCertificate,
} from "react-icons/fa";
import {
  IoRibbon,
  IoShieldCheckmark,
  IoSparkles,
  IoCheckmarkCircle,
  IoTrendingUp,
  IoTime,
  IoCard,
  IoPeople,
} from "react-icons/io5";
import { GiAchievement, GiRank3 } from "react-icons/gi";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useThemeColors, useThemeToggle } from "@/hooks/useTheme";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface TierLabelsProps {
  [key: string]: string;
  bronze: string;
  silver: string;
  gold: string;
  platinum: string;
}

interface TierColorsProps {
  [key: string]: string;
  bronze: string;
  silver: string;
  gold: string;
  platinum: string;
}

const getTierTextColor = (tier: string, colors: any) => {
  return tier === "bronze"
    ? colors.warningText
    : tier === "silver"
      ? colors.textSecondary
      : tier === "gold"
        ? "text-yellow-600"
        : "text-purple-600";
};

const getTierMutedTextColor = (tier: string, colors: any) => {
  return tier === "bronze"
    ? "text-amber-700"
    : tier === "silver"
      ? colors.textMuted
      : tier === "gold"
        ? "text-yellow-700"
        : "text-purple-700";
};

const getTierBadgeColor = (tier: string, colors: any) => {
  return tier === "bronze"
    ? colors.warning
    : tier === "silver"
      ? `${colors.backgroundSecondary} ${colors.border} ${colors.text}`
      : tier === "gold"
        ? "bg-yellow-100 text-yellow-800 border-yellow-300"
        : "bg-purple-100 text-purple-800 border-purple-300";
};

const getTierBoxColor = (tier: string, colors: any) => {
  return tier === "bronze"
    ? colors.warning
    : tier === "silver"
      ? `${colors.backgroundSecondary} ${colors.border} ${colors.text}`
      : tier === "gold"
        ? "bg-yellow-50 border-yellow-200 text-yellow-800"
        : "bg-purple-50 border-purple-200 text-purple-800";
};

// Star Display Component
const StarDisplay = ({
  stars,
  size = "sm",
  showValue = true,
}: {
  stars: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}) => {
  const fullStars = Math.floor(stars);
  const hasHalfStar = stars % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const starSize = {
    sm: "w-3.5 h-3.5",
    md: "w-4.5 h-4.5",
    lg: "w-5.5 h-5.5",
  }[size];

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: fullStars }).map((_, i) => (
        <FaStar
          key={`full-${i}`}
          className={`${starSize} text-yellow-400 fill-yellow-400`}
        />
      ))}
      {hasHalfStar && (
        <div className="relative">
          <FaStar className={`${starSize} text-gray-300 fill-gray-300`} />
          <FaStar
            className={`${starSize} absolute left-0 top-0 text-yellow-400 fill-yellow-400`}
            style={{ clipPath: "inset(0 50% 0 0)" }}
          />
        </div>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <FaStar
          key={`empty-${i}`}
          className={`${starSize} text-gray-300 fill-none`}
        />
      ))}
      {showValue && (
        <span className="ml-1.5 font-medium">{stars.toFixed(1)}</span>
      )}
    </div>
  );
};

// Trust Score Tier Cards Component - UPDATED WITH TRUST STARS
const TrustScoreTierCards = ({
  colors,
  router,
}: {
  colors: any;
  router: any;
}) => {
  const tiers = [
    {
      name: "Newcomer",
      emoji: "🌱",
      score: "0-29",
      stars: "0.5-1.9",
      color: "from-gray-400 to-gray-500",
      requirements: [
        { icon: <FaUserCheck />, text: "Basic profile setup", stars: "+0.2" },
        { icon: <IoTime />, text: "Account created", stars: "+0.1" },
      ],
    },
    {
      name: "Rising Star",
      emoji: "⭐",
      score: "30-49",
      stars: "2.0-2.4",
      color: "from-blue-400 to-blue-500",
      requirements: [
        { icon: <FaPhoneAlt />, text: "Phone verified", stars: "+0.8" },
        {
          icon: <FaCalendarCheck />,
          text: "1-2 gigs completed",
          stars: "+0.2",
        },
        { icon: <FaChartBar />, text: "Good response rate", stars: "+0.5" },
      ],
    },
    {
      name: "Verified",
      emoji: "✅",
      score: "50-64",
      stars: "2.5-3.4",
      color: "from-green-400 to-green-500",
      requirements: [
        { icon: <FaCertificate />, text: "Identity verified", stars: "+1.0" },
        { icon: <IoCard />, text: "Payment method added", stars: "+0.6" },
        { icon: <FaMoneyBillWave />, text: "Earnings ≥ $500", stars: "+0.5" },
        {
          icon: <FaCalendarCheck />,
          text: "3-5 gigs completed",
          stars: "+0.3",
        },
      ],
    },
    {
      name: "Trusted",
      emoji: "🤝",
      score: "65-79",
      stars: "3.5-4.4",
      color: "from-purple-400 to-purple-500",
      requirements: [
        {
          icon: <FaCalendarCheck />,
          text: "6-10 gigs completed",
          stars: "+0.6",
        },
        { icon: <FaStar />, text: "4.5+ average rating", stars: "+0.9" },
        { icon: <IoPeople />, text: "Real followers", stars: "+0.5" },
        { icon: <IoTrendingUp />, text: "90%+ response rate", stars: "+0.7" },
      ],
    },
    {
      name: "Elite",
      emoji: "🏆",
      score: "80-100",
      stars: "4.5-5.0",
      color: "from-yellow-400 to-amber-500",
      requirements: [
        {
          icon: <FaCalendarCheck />,
          text: "10+ gigs completed",
          stars: "+1.0",
        },
        { icon: <FaStar />, text: "4.8+ average rating", stars: "+1.0" },
        { icon: <FaHandshake />, text: "Account age 6+ months", stars: "+1.3" },
        { icon: <GiRank3 />, text: "Perfect reliability", stars: "+1.0" },
      ],
    },
  ];

  const handleTierClick = (tierName: string) => {
    router.push(`/onboarding/trust-explained`);
  };

  return (
    <div className="grid md:grid-cols-5 gap-4">
      {tiers.map((tierInfo, index) => (
        <motion.div
          key={tierInfo.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleTierClick(tierInfo.name)}
          className={`bg-gradient-to-br ${tierInfo.color} rounded-xl p-4 text-white text-center cursor-pointer hover:shadow-xl transition-all duration-300 relative overflow-hidden group`}
        >
          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300" />

          <div className="text-3xl mb-2 transform group-hover:scale-110 transition-transform duration-300">
            {tierInfo.emoji}
          </div>
          <div className="font-bold text-lg mb-1 group-hover:text-xl transition-all duration-300">
            {tierInfo.name}
          </div>

          {/* Star Display */}
          <div className="mb-1 flex justify-center">
            <StarDisplay
              stars={parseFloat(tierInfo.stars.split("-")[0])}
              size="sm"
              showValue={false}
            />
          </div>

          <div className="text-xs opacity-90 bg-white/20 px-2 py-1 rounded-full inline-block group-hover:bg-white/30 transition-all duration-300 mb-2">
            {tierInfo.stars} stars
          </div>

          <div className="text-xs opacity-70">({tierInfo.score} points)</div>
        </motion.div>
      ))}
    </div>
  );
};

// Custom hook for section navigation
export const useSectionNavigation = () => {
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  const registerSection = (id: string, element: HTMLElement | null) => {
    if (element) {
      sectionRefs.current.set(id, element);
    } else {
      sectionRefs.current.delete(id);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current.get(sectionId);
    if (element) {
      const headerHeight = 80;
      const elementTop = element.offsetTop - headerHeight;

      window.scrollTo({
        top: elementTop,
        behavior: "smooth",
      });
    }
  };

  return { registerSection, scrollToSection };
};

export default function HowItWorksPage() {
  const { colors, isDarkMode, mounted } = useThemeColors();
  const { toggleDarkMode } = useThemeToggle();
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { registerSection, scrollToSection } = useSectionNavigation();

  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({
    overview: null,
    "tier-requirements": null,
    "how-to-earn": null,
    badges: null,
    "getting-started": null,
    "tier-newcomer": null,
    "tier-rising-star": null,
    "tier-verified": null,
    "tier-trusted": null,
    "tier-elite": null,
  });

  // Register sections on mount
  useEffect(() => {
    Object.entries(sectionRefs.current).forEach(([id, element]) => {
      if (element) {
        registerSection(id, element);
      }
    });
  }, [registerSection]);

  // Handle navigation from layout and URL parameters
  useEffect(() => {
    setIsClient(true);

    // Handle navigation events from layout
    const handleSectionNavigate = (event: CustomEvent) => {
      const { section } = event.detail;
      setTimeout(() => {
        scrollToSection(section);
      }, 100);
    };

    // Handle URL parameters
    const sectionParam = searchParams?.get("section");
    const highlightParam = searchParams?.get("highlight");

    if (sectionParam) {
      setTimeout(() => {
        scrollToSection(sectionParam);
      }, 300);
    }

    if (highlightParam) {
      setTimeout(() => {
        scrollToSection(highlightParam);
        // Add highlight effect
        const element = document.getElementById(highlightParam);
        if (element) {
          element.classList.add("ring-4", "ring-yellow-400", "ring-opacity-50");
          setTimeout(() => {
            element.classList.remove(
              "ring-4",
              "ring-yellow-400",
              "ring-opacity-50",
            );
          }, 3000);
        }
      }, 500);
    }

    window.addEventListener(
      "section-navigate",
      handleSectionNavigate as EventListener,
    );

    return () => {
      window.removeEventListener(
        "section-navigate",
        handleSectionNavigate as EventListener,
      );
    };
  }, [searchParams, scrollToSection]);

  const badgeCategories = [
    {
      title: "Trust Score Tiers",
      description: "Progress through tiers by building your reputation",
      badges: [
        {
          name: "Newcomer",
          icon: <IoSparkles className="text-gray-400" size={24} />,
          description: "Just starting your journey",
          requirements: "Stars: 0.5-1.9 • Score: 0-29",
          tier: "bronze",
        },
        {
          name: "Rising Star",
          icon: <GiRank3 className="text-blue-400" size={24} />,
          description: "Building momentum and credibility",
          requirements: "Stars: 2.0-2.4 • Phone verified • 1-2 gigs",
          tier: "silver",
        },
        {
          name: "Verified",
          icon: <IoShieldCheckmark className="text-green-400" size={24} />,
          description: "Trusted performer with verified credentials",
          requirements: "Stars: 2.5-3.4 • ID verified • Payment method",
          tier: "gold",
        },
        {
          name: "Trusted",
          icon: <FaHandshake className="text-purple-400" size={24} />,
          description: "Highly reliable and experienced",
          requirements: "Stars: 3.5-4.4 • 6-10 gigs • 4.5+ rating",
          tier: "gold",
        },
        {
          name: "Elite",
          icon: <FaCrown className="text-amber-400" size={24} />,
          description: "Top-tier performer with proven excellence",
          requirements: "Stars: 4.5-5.0 • 10+ gigs • 4.8+ rating",
          tier: "platinum",
        },
      ],
    },
    {
      title: "Performance Badges",
      description: "Reward for consistent high-quality work",
      badges: [
        {
          name: "Gig Streak",
          icon: <FaFire className="text-orange-400" size={24} />,
          description: "Completed 5 gigs consecutively",
          requirements: "Complete 5 gigs in a row without cancellations",
          tier: "silver",
        },
        {
          name: "Perfect Attendance",
          icon: <IoRibbon className="text-green-400" size={24} />,
          description: "100% reliability with 10+ gigs",
          requirements: "Never cancelled a gig with 10+ completed",
          tier: "platinum",
        },
        {
          name: "Client Favorite",
          icon: <FaHeart className="text-pink-400" size={24} />,
          description: "Consistently high ratings from clients",
          requirements: "4.8+ average rating with 10+ reviews",
          tier: "gold",
        },
      ],
    },
    {
      title: "Verification Badges",
      description: "Proof of authenticity and reliability",
      badges: [
        {
          name: "Identity Verified",
          icon: <FaUserCheck className="text-blue-400" size={24} />,
          description: "Government ID verified",
          requirements: "Complete identity verification",
          tier: "gold",
        },
        {
          name: "Payment Verified",
          icon: <FaMoneyBillWave className="text-green-400" size={24} />,
          description: "Secure payment method on file",
          requirements: "Add and verify payment method",
          tier: "silver",
        },
        {
          name: "Phone Verified",
          icon: <FaPhoneAlt className="text-teal-400" size={24} />,
          description: "Verified phone number",
          requirements: "Verify your mobile number",
          tier: "silver",
        },
      ],
    },
  ];

  const tierColors: TierColorsProps = {
    bronze: colors.warningBg + " " + colors.warningBorder,
    silver: colors.backgroundSecondary + " " + colors.border,
    gold: "bg-yellow-900 border-yellow-200",
    platinum: "bg-purple-750 border-purple-200",
  };

  const tierLabels: TierLabelsProps = {
    bronze: "Bronze",
    silver: "Silver",
    gold: "Gold",
    platinum: "Platinum",
  };

  if (!mounted || !isClient) {
    return (
      <div
        className={cn(
          "flex justify-center items-center min-h-64",
          colors.background,
        )}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen", colors.background, colors.text)}>
      {/* Theme Toggle */}
      <div className={cn("sticky top-4 z-50 flex justify-end px-4 md:px-8")}>
        <motion.button
          onClick={toggleDarkMode}
          className={cn(
            "p-3 rounded-full border shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110",
            colors.card,
            colors.border,
            colors.hoverBg,
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <FaSun className="text-yellow-400" size={20} />
          ) : (
            <FaMoon className="text-blue-600" size={20} />
          )}
        </motion.button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
        {/* Hero Section */}
        <section
          id="overview"
          ref={(el) => {
            sectionRefs.current["overview"] = el;
            registerSection("overview", el);
          }}
          className="scroll-mt-20 text-center space-y-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className={cn("text-4xl md:text-6xl font-bold", colors.text)}>
              gigUpp Trust Rating System
            </h1>
            <p
              className={cn("text-xl mt-4 max-w-2xl mx-auto", colors.textMuted)}
            >
              Build credibility with a 5-star rating system that reflects your
              professionalism and reliability.
            </p>
          </motion.div>
        </section>

        {/* Trust Score Overview */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className={cn("text-3xl font-bold mb-4", colors.text)}>
              Your Trust Rating Journey
            </h2>
            <p className={cn("text-lg max-w-3xl mx-auto", colors.textMuted)}>
              Progress through 5 tiers by building your reputation and
              credibility with clients
            </p>
          </div>

          {/* Clickable Tier Cards */}
          <div className="space-y-6">
            <h3 className={cn("text-xl font-semibold", colors.text)}>
              Trust Rating Tiers
            </h3>
            <p className={cn("text-gray-600 dark:text-gray-400 mb-6")}>
              Click on any tier to view personalized information on your trust
              rating page
            </p>
            <TrustScoreTierCards colors={colors} router={router} />
          </div>

          {/* Trust Score Components - UPDATED WITH STARS */}
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div
              className={cn(
                "p-6 rounded-xl border-2",
                colors.card,
                colors.border,
              )}
            >
              <div className="flex items-center gap-3 mb-4">
                <FaShieldAlt className="text-blue-500" size={24} />
                <h3 className={cn("text-xl font-semibold", colors.text)}>
                  What Builds Your Rating
                </h3>
              </div>
              <ul className={cn("space-y-3 text-sm", colors.textMuted)}>
                <li className="flex items-start gap-3">
                  <FaUserCheck className="text-green-500 mt-0.5" />
                  <div>
                    <strong>Identity Verification:</strong> +1.0 stars
                    <p className="text-xs">Verify your government ID</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FaPhoneAlt className="text-green-500 mt-0.5" />
                  <div>
                    <strong>Phone Verification:</strong> +0.8 stars
                    <p className="text-xs">Verify your mobile number</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FaMoneyBillWave className="text-green-500 mt=0.5" />
                  <div>
                    <strong>Payment Method:</strong> +0.6 stars
                    <p className="text-xs">Add secure payment method</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FaCalendarCheck className="text-green-500 mt-0.5" />
                  <div>
                    <strong>Completed Gigs:</strong> +0.2 per gig (max 1.0)
                    <p className="text-xs">Successfully finish gigs</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FaStar className="text-green-500 mt-0.5" />
                  <div>
                    <strong>Average Rating:</strong> Up to +1.0 stars
                    <p className="text-xs">5.0 rating = 1.0 stars</p>
                  </div>
                </li>
              </ul>
            </div>

            <div
              className={cn(
                "p-6 rounded-xl border-2",
                colors.card,
                colors.border,
              )}
            >
              <div className="flex items-center gap-3 mb-4">
                <FaChartLine className="text-purple-500" size={24} />
                <h3 className={cn("text-xl font-semibold", colors.text)}>
                  Rating Impact
                </h3>
              </div>
              <ul className={cn("space-y-3 text-sm", colors.textMuted)}>
                <li className="flex items-start gap-3">
                  <IoTrendingUp className="text-blue-500 mt-0.5" />
                  <div>
                    <strong>2.0+ Stars:</strong> Higher Search Ranking
                    <p className="text-xs">Get seen by more clients</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FaAward className="text-amber-500 mt-0.5" />
                  <div>
                    <strong>3.5+ Stars:</strong> Premium Opportunities
                    <p className="text-xs">Access exclusive gigs</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FaCertificate className="text-green-500 mt-0.5" />
                  <div>
                    <strong>2.5+ Stars:</strong> Verified Badge
                    <p className="text-xs">Build instant credibility</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <IoPeople className="text-purple-500 mt-0.5" />
                  <div>
                    <strong>4.5+ Stars:</strong> Band Creation
                    <p className="text-xs">Unlock at Elite tier</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FaHandshake className="text-teal-500 mt-0.5" />
                  <div>
                    <strong>3.0+ Stars:</strong> Client Trust Boost
                    <p className="text-xs">Higher booking conversion</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Detailed Tier Requirements - UPDATED WITH STARS */}
        <section
          id="tier-requirements"
          ref={(el) => {
            sectionRefs.current["tier-requirements"] = el;
            registerSection("tier-requirements", el);
          }}
          className="scroll-mt-20 space-y-12"
        >
          <div className="text-center">
            <h2 className={cn("text-3xl font-bold mb-4", colors.text)}>
              Detailed Tier Requirements
            </h2>
            <p className={cn("text-lg max-w-3xl mx-auto", colors.textMuted)}>
              What you need to reach each trust tier
            </p>
          </div>

          {/* Newcomer Tier */}
          <div
            id="tier-newcomer"
            ref={(el) => {
              sectionRefs.current["tier-newcomer"] = el;
              registerSection("tier-newcomer", el);
            }}
            className={cn(
              "p-6 rounded-xl border-2 scroll-mt-20",
              colors.card,
              colors.border,
            )}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="text-xl">🌱</div>
              <div>
                <h3 className={cn("text-xl font-bold", colors.text)}>
                  Newcomer (0.5-1.9 stars)
                </h3>
                <p className={cn("text-gray-600 dark:text-gray-400")}>
                  Getting started on the platform
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className={cn("font-semibold mb-2", colors.text)}>
                  Requirements:
                </h4>
                <ul className={cn("space-y-2 text-sm", colors.textMuted)}>
                  <li>• Basic profile setup (+0.2 stars)</li>
                  <li>• Account creation (+0.1 stars)</li>
                  <li>• Email verification (required)</li>
                </ul>
              </div>
              <div>
                <h4 className={cn("font-semibold mb-2", colors.text)}>
                  Benefits:
                </h4>
                <ul className={cn("space-y-2 text-sm", colors.textMuted)}>
                  <li>• Basic gig browsing</li>
                  <li>• Limited applications</li>
                  <li>• Standard visibility</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Rising Star Tier */}
          <div
            id="tier-rising-star"
            ref={(el) => {
              sectionRefs.current["tier-rising-star"] = el;
              registerSection("tier-rising-star", el);
            }}
            className={cn(
              "p-6 rounded-xl border-2 scroll-mt-20",
              colors.card,
              colors.border,
            )}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="text-xl">⭐</div>
              <div>
                <h3 className={cn("text-xl font-bold", colors.text)}>
                  Rising Star (2.0-2.4 stars)
                </h3>
                <p className={cn("text-gray-600 dark:text-gray-400")}>
                  Building momentum and credibility
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className={cn("font-semibold mb-2", colors.text)}>
                  Requirements:
                </h4>
                <ul className={cn("space-y-2 text-sm", colors.textMuted)}>
                  <li>• Phone verified (+0.8 stars)</li>
                  <li>• 1-2 gigs completed (+0.2 stars)</li>
                  <li>• Good response rate (+0.5 stars)</li>
                  <li>• Profile completeness (+0.5 stars)</li>
                </ul>
              </div>
              <div>
                <h4 className={cn("font-semibold mb-2", colors.text)}>
                  Benefits:
                </h4>
                <ul className={cn("space-y-2 text-sm", colors.textMuted)}>
                  <li>• Higher search ranking</li>
                  <li>• More gig applications</li>
                  <li>• Basic analytics</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Verified Tier */}
          <div
            id="tier-verified"
            ref={(el) => {
              sectionRefs.current["tier-verified"] = el;
              registerSection("tier-verified", el);
            }}
            className={cn(
              "p-6 rounded-xl border-2 scroll-mt-20",
              colors.card,
              colors.border,
            )}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="text-xl">✅</div>
              <div>
                <h3 className={cn("text-xl font-bold", colors.text)}>
                  Verified (2.5-3.4 stars)
                </h3>
                <p className={cn("text-gray-600 dark:text-gray-400")}>
                  Trusted performer with verified credentials
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className={cn("font-semibold mb-2", colors.text)}>
                  Requirements:
                </h4>
                <ul className={cn("space-y-2 text-sm", colors.textMuted)}>
                  <li>• Identity verified (+1.0 stars)</li>
                  <li>• Payment method added (+0.6 stars)</li>
                  <li>• Earnings ≥ $500 (+0.5 stars)</li>
                  <li>• 3-5 gigs completed (+0.3 stars)</li>
                  <li>• 4.0+ average rating (+0.8 stars)</li>
                </ul>
              </div>
              <div>
                <h4 className={cn("font-semibold mb-2", colors.text)}>
                  Benefits:
                </h4>
                <ul className={cn("space-y-2 text-sm", colors.textMuted)}>
                  <li>• Verified badge on profile</li>
                  <li>• Premium gig visibility</li>
                  <li>• Advanced analytics</li>
                  <li>• Priority support</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Trusted Tier */}
          <div
            id="tier-trusted"
            ref={(el) => {
              sectionRefs.current["tier-trusted"] = el;
              registerSection("tier-trusted", el);
            }}
            className={cn(
              "p-6 rounded-xl border-2 scroll-mt-20",
              colors.card,
              colors.border,
            )}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="text-xl">🤝</div>
              <div>
                <h3 className={cn("text-xl font-bold", colors.text)}>
                  Trusted (3.5-4.4 stars)
                </h3>
                <p className={cn("text-gray-600 dark:text-gray-400")}>
                  Highly reliable and experienced
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className={cn("font-semibold mb-2", colors.text)}>
                  Requirements:
                </h4>
                <ul className={cn("space-y-2 text-sm", colors.textMuted)}>
                  <li>• 6-10 gigs completed (+0.6 stars)</li>
                  <li>• 4.5+ average rating (+0.9 stars)</li>
                  <li>• Real followers (+0.5 stars)</li>
                  <li>• 90%+ response rate (+0.7 stars)</li>
                  <li>• Account age 3+ months (+0.8 stars)</li>
                </ul>
              </div>
              <div>
                <h4 className={cn("font-semibold mb-2", colors.text)}>
                  Benefits:
                </h4>
                <ul className={cn("space-y-2 text-sm", colors.textMuted)}>
                  <li>• Top search placement</li>
                  <li>• Exclusive gig invitations</li>
                  <li>• Band creation eligible</li>
                  <li>• Premium networking</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Elite Tier */}
          <div
            id="tier-elite"
            ref={(el) => {
              sectionRefs.current["tier-elite"] = el;
              registerSection("tier-elite", el);
            }}
            className={cn(
              "p-6 rounded-xl border-2 scroll-mt-20",
              colors.card,
              colors.border,
            )}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="text-xl">🏆</div>
              <div>
                <h3 className={cn("text-xl font-bold", colors.text)}>
                  Elite (4.5-5.0 stars)
                </h3>
                <p className={cn("text-gray-600 dark:text-gray-400")}>
                  Top-tier performer with proven excellence
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className={cn("font-semibold mb-2", colors.text)}>
                  Requirements:
                </h4>
                <ul className={cn("space-y-2 text-sm", colors.textMuted)}>
                  <li>• 10+ gigs completed (+1.0 stars)</li>
                  <li>• 4.8+ average rating (+1.0 stars)</li>
                  <li>• Account age 6+ months (+1.3 stars)</li>
                  <li>• Perfect reliability (+1.0 stars)</li>
                  <li>• Consistent excellence (+0.8 stars)</li>
                </ul>
              </div>
              <div>
                <h4 className={cn("font-semibold mb-2", colors.text)}>
                  Benefits:
                </h4>
                <ul className={cn("space-y-2 text-sm", colors.textMuted)}>
                  <li>• Elite badge and recognition</li>
                  <li>• Highest priority for gigs</li>
                  <li>• Featured profile placement</li>
                  <li>• VIP networking events</li>
                  <li>• Premium partnership offers</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How to Earn Section - UPDATED WITH STARS */}
        <section
          id="how-to-earn"
          ref={(el) => {
            sectionRefs.current["how-to-earn"] = el;
            registerSection("how-to-earn", el);
          }}
          className="scroll-mt-20 space-y-8"
        >
          <div className="text-center">
            <h2 className={cn("text-3xl font-bold mb-4", colors.text)}>
              How to Earn Trust Stars
            </h2>
            <p className={cn("text-lg max-w-3xl mx-auto", colors.textMuted)}>
              Specific actions that increase your trust rating
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <FaUserCheck className="text-blue-500" size={32} />,
                title: "Verification Actions",
                stars: "+2.4 total",
                actions: [
                  "Identity verification: +1.0 stars",
                  "Phone verification: +0.8 stars",
                  "Payment method: +0.6 stars",
                ],
              },
              {
                icon: <FaCalendarCheck className="text-green-500" size={32} />,
                title: "Gig Performance",
                stars: "+2.0 total",
                actions: [
                  "Completed gigs: +0.2 per gig (max 1.0)",
                  "Average rating: up to +1.0 stars",
                ],
              },
              {
                icon: <FaChartBar className="text-purple-500" size={32} />,
                title: "Consistency",
                stars: "+1.8 total",
                actions: [
                  "Response rate: up to +0.7 stars",
                  "Account age: up to +1.1 stars",
                ],
              },
            ].map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={cn(
                  "p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg",
                  colors.card,
                  colors.border,
                  "hover:scale-105",
                )}
              >
                <div className="flex items-center gap-3 mb-4">
                  {category.icon}
                  <div>
                    <h3 className={cn("text-lg font-semibold", colors.text)}>
                      {category.title}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-blue-600 font-medium">
                      <FaStar className="text-yellow-500" size={14} />
                      {category.stars}
                    </div>
                  </div>
                </div>
                <ul className="space-y-2">
                  {category.actions.map((action, i) => (
                    <li
                      key={i}
                      className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2"
                    >
                      <IoCheckmarkCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {action}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Badges Section - Updated */}
        <section
          id="badges"
          ref={(el) => {
            sectionRefs.current["badges"] = el;
            registerSection("badges", el);
          }}
          className="scroll-mt-20 space-y-12"
        >
          <div className="text-center">
            <h2 className={cn("text-3xl font-bold mb-4", colors.text)}>
              Badge System
            </h2>
            <p className={cn("text-lg max-w-3xl mx-auto", colors.textMuted)}>
              Earn badges by demonstrating consistent performance, reliability,
              and quality service.
            </p>
          </div>

          {/* Badge Categories */}
          {badgeCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              className="space-y-6"
            >
              <div>
                <h3 className={cn("text-xl font-bold mb-2", colors.text)}>
                  {category.title}
                </h3>
                <p className={cn("text-lg", colors.textMuted)}>
                  {category.description}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.badges.map((badge, badgeIndex) => (
                  <motion.div
                    key={badge.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.4,
                      delay: categoryIndex * 0.1 + badgeIndex * 0.05,
                    }}
                    className={cn(
                      "p-6 rounded-xl border-2 space-y-4 transition-all duration-300 hover:shadow-lg hover:scale-105",
                      tierColors[badge.tier],
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {badge.icon}
                      <div>
                        <h4
                          className={cn(
                            "font-semibold",
                            getTierTextColor(badge.tier, colors),
                          )}
                        >
                          {badge.name}
                        </h4>
                        <span
                          className={cn(
                            "text-xs px-2 py-1 rounded-full border",
                            getTierBadgeColor(badge.tier, colors),
                          )}
                        >
                          {tierLabels[badge.tier]}
                        </span>
                      </div>
                    </div>
                    <p
                      className={cn(
                        "text-sm",
                        getTierMutedTextColor(badge.tier, colors),
                      )}
                    >
                      {badge.description}
                    </p>
                    <div
                      className={cn(
                        "text-xs p-2 rounded border",
                        getTierBoxColor(badge.tier, colors),
                      )}
                    >
                      <strong>Requirements:</strong> {badge.requirements}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </section>

        {/* Getting Started Section */}
        <section
          id="getting-started"
          ref={(el) => {
            sectionRefs.current["getting-started"] = el;
            registerSection("getting-started", el);
          }}
          className={cn(
            "p-8 rounded-xl border-2 text-center transition-all duration-300 scroll-mt-20",
            colors.card,
            colors.border,
            "hover:shadow-xl",
          )}
        >
          <FaRocket className="mx-auto text-blue-500 mb-4" size={48} />
          <h2 className={cn("text-3xl font-bold mb-4", colors.text)}>
            Ready to Build Your Trust Rating?
          </h2>
          <p className={cn("text-lg mb-6 max-w-2xl mx-auto", colors.textMuted)}>
            Start building your reputation today and unlock premium
            opportunities with our transparent 5-star rating system.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => router.replace("/profile")}
              className={cn(
                "px-6 py-3 rounded-lg font-semibold transition-all duration-200",
                colors.primaryBg,
                colors.primaryBgHover,
                colors.textInverted,
                "hover:scale-105 shadow-lg",
              )}
            >
              Complete Your Profile
            </button>
            <Link
              href="/onboarding/trust-explained"
              className={cn(
                "px-6 py-3 rounded-lg font-semibold transition-all duration-200 border-2",
                colors.border,
                colors.text,
                colors.hoverBg,
                "hover:scale-105",
              )}
            >
              View Your Trust Rating
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
