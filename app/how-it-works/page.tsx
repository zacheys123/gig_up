// app/how-it-works/page.tsx
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
} from "react-icons/fa";
import {
  IoRibbon,
  IoShieldCheckmark,
  IoSparkles,
  IoCheckmarkCircle,
  IoTrendingUp,
} from "react-icons/io5";
import { GiAchievement } from "react-icons/gi";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useThemeColors, useThemeToggle } from "@/hooks/useTheme";
import { useRouter } from "next/navigation";

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

// Helper functions using your theme colors
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

export default function HowItWorksPage() {
  const { colors, isDarkMode, mounted } = useThemeColors();
  const { toggleDarkMode } = useThemeToggle();
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  useEffect(() => {
    setIsClient(true);

    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 500);
    }
  }, []);

  const badgeCategories = [
    {
      title: "Performance Badges",
      description: "Reward for consistent high-quality work",
      badges: [
        {
          name: "Newcomer",
          icon: <IoSparkles className="text-gray-400" size={24} />,
          description: "Completed your first gig successfully",
          requirements: "Complete 1 gig",
          tier: "bronze",
        },
        {
          name: "Reliable Gigster",
          icon: <IoShieldCheckmark className="text-blue-400" size={24} />,
          description: "Proven track record of reliability",
          requirements: "Complete 5+ gigs with 90%+ reliability",
          tier: "silver",
        },
        {
          name: "Top Performer",
          icon: <FaAward className="text-yellow-400" size={24} />,
          description: "Exceptional performance and reliability",
          requirements: "Complete 10+ gigs with 95%+ reliability",
          tier: "gold",
        },
        {
          name: "Gig Champion",
          icon: <FaCrown className="text-purple-400" size={24} />,
          description: "Elite status among performers",
          requirements: "Complete 25+ gigs with 98%+ reliability",
          tier: "platinum",
        },
      ],
    },
    {
      title: "Quality Badges",
      description: "Recognition for outstanding service quality",
      badges: [
        {
          name: "Highly Rated",
          icon: <FaStar className="text-amber-300" size={24} />,
          description: "Consistently high ratings from clients",
          requirements: "Maintain 4.5+ average rating across 5+ gigs",
          tier: "gold",
        },
        {
          name: "Client Favorite",
          icon: <FaHeart className="text-pink-400" size={24} />,
          description: "Beloved by clients for exceptional service",
          requirements: "Receive 10+ positive reviews (4.8+ rating)",
          tier: "gold",
        },
        {
          name: "Perfect Attendance",
          icon: <IoRibbon className="text-green-400" size={24} />,
          description: "Flawless reliability record",
          requirements: "100% reliability with 10+ gigs",
          tier: "platinum",
        },
      ],
    },
    {
      title: "Milestone Badges",
      description: "Celebrate significant achievements and milestones",
      badges: [
        {
          name: "Gig Streak",
          icon: <FaFire className="text-orange-400" size={24} />,
          description: "Consistent performance without breaks",
          requirements: "Complete 5 gigs in a row without cancellations",
          tier: "silver",
        },
        {
          name: "Seasoned Performer",
          icon: <GiAchievement className="text-blue-400" size={24} />,
          description: "Vast experience in the industry",
          requirements: "Complete 50+ gigs with 90%+ reliability",
          tier: "platinum",
        },
        {
          name: "Early Bird",
          icon: <FaRegClock className="text-green-400" size={24} />,
          description: "Always punctual and prepared",
          requirements: "Consistently early arrivals to gigs",
          tier: "silver",
        },
      ],
    },
    {
      title: "Accountability Badges",
      description: "Transparent track record indicators",
      badges: [
        {
          name: "Cancellation Risk",
          icon: <FaThumbsDown className="text-red-400" size={24} />,
          description: "Multiple cancellations affecting reliability",
          requirements: "Cancel 3+ gigs",
          tier: "bronze",
        },
        {
          name: "Frequent Canceller",
          icon: <FaThumbsDown className="text-red-500" size={24} />,
          description: "Significant cancellation history",
          requirements: "Cancel 5+ gigs",
          tier: "bronze",
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
          colors.background
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
            colors.hoverBg
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
        <section className="text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className={cn("text-4xl md:text-6xl font-bold", colors.text)}>
              How GigUppWorks
            </h1>
            <p
              className={cn("text-xl mt-4 max-w-2xl mx-auto", colors.textMuted)}
            >
              Learn how our badge system rewards quality, reliability, and
              exceptional performance in the gig economy.
            </p>
          </motion.div>
        </section>
        {/* Overview Section */}
        <section id="overview" className="space-y-8">
          <div className="text-center">
            <h2 className={cn("text-3xl font-bold mb-4", colors.text)}>
              Building Trust Through Transparency
            </h2>
            <p className={cn("text-lg max-w-3xl mx-auto", colors.textMuted)}>
              Our badge system helps clients find reliable performers and helps
              performers showcase their skills and reliability.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <FaShieldAlt className="text-blue-500" size={32} />,
                title: "Trust & Safety",
                description:
                  "Verified performance history and reliability scores help build trust between clients and performers.",
              },
              {
                icon: (
                  <IoCheckmarkCircle className="text-green-500" size={32} />
                ),
                title: "Quality Assurance",
                description:
                  "Badges represent proven track records of successful gigs and satisfied clients.",
              },
              {
                icon: <IoTrendingUp className="text-purple-500" size={32} />,
                title: "Career Growth",
                description:
                  "Earn better gigs and higher rates as you build your reputation through consistent performance.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={cn(
                  "p-6 rounded-xl border-2 text-center transition-all duration-300 hover:shadow-lg",
                  colors.card,
                  colors.border,
                  "hover:scale-105"
                )}
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className={cn("text-xl font-semibold mb-2", colors.text)}>
                  {feature.title}
                </h3>
                <p className={cn("text-sm", colors.textMuted)}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>
        {/* Badges Section */}
        <section id="badges" className="space-y-12">
          <div className="text-center">
            <h2 className={cn("text-3xl font-bold mb-4", colors.text)}>
              Badge System
            </h2>
            <p className={cn("text-lg max-w-3xl mx-auto", colors.textMuted)}>
              Earn badges by demonstrating consistent performance, reliability,
              and quality service.
            </p>
          </div>

          {/* Tier Legend */}
          <div
            className={cn(
              "p-6 rounded-xl border-2",
              colors.card,
              colors.border
            )}
          >
            <h3 className={cn("text-xl font-semibold mb-4", colors.text)}>
              Badge Tiers
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(tierLabels).map(([tier, label]) => (
                <div
                  key={tier}
                  className={cn(
                    "p-4 rounded-lg border-2 text-center transition-all duration-300 hover:scale-105",
                    tierColors[tier as keyof typeof tierColors]
                  )}
                >
                  <span className={cn("font-semibold capitalize", colors.text)}>
                    {label}
                  </span>
                  <p className={cn("text-xs mt-1", colors.textMuted)}>
                    {tier === "bronze" && "Beginner achievements"}
                    {tier === "silver" && "Intermediate level"}
                    {tier === "gold" && "Advanced performance"}
                    {tier === "platinum" && "Elite status"}
                  </p>
                </div>
              ))}
            </div>
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
                <h3 className={cn("text-2xl font-bold mb-2", colors.text)}>
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
                      tierColors[badge.tier]
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {badge.icon}
                      <div>
                        <h4
                          className={cn(
                            "font-semibold",
                            getTierTextColor(badge.tier, colors)
                          )}
                        >
                          {badge.name}
                        </h4>
                        <span
                          className={cn(
                            "text-xs px-2 py-1 rounded-full border",
                            getTierBadgeColor(badge.tier, colors)
                          )}
                        >
                          {tierLabels[badge.tier]}
                        </span>
                      </div>
                    </div>
                    <p
                      className={cn(
                        "text-sm",
                        getTierMutedTextColor(badge.tier, colors)
                      )}
                    >
                      {badge.description}
                    </p>
                    <div
                      className={cn(
                        "text-xs p-2 rounded border",
                        getTierBoxColor(badge.tier, colors)
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

        {/* Ratings Section */}
        <section id="ratings" className="space-y-8">
          <div className="text-center">
            <h2 className={cn("text-3xl font-bold mb-4", colors.text)}>
              Rating System
            </h2>
            <p className={cn("text-lg max-w-3xl mx-auto", colors.textMuted)}>
              Our comprehensive rating system ensures fair and transparent
              feedback for both performers and clients.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div
              className={cn(
                "p-6 rounded-xl border-2",
                colors.card,
                colors.border
              )}
            >
              <div className="flex items-center gap-3 mb-4">
                <FaStar className="text-yellow-500" size={24} />
                <h3 className={cn("text-xl font-semibold", colors.text)}>
                  Star Ratings
                </h3>
              </div>
              <p className={cn("text-sm mb-4", colors.textMuted)}>
                Clients rate performers on a 1-5 star scale based on:
              </p>
              <ul className={cn("space-y-2 text-sm", colors.textMuted)}>
                <li className="flex items-center gap-2">
                  <IoCheckmarkCircle className="text-green-500" />
                  Quality of work
                </li>
                <li className="flex items-center gap-2">
                  <IoCheckmarkCircle className="text-green-500" />
                  Professionalism
                </li>
                <li className="flex items-center gap-2">
                  <IoCheckmarkCircle className="text-green-500" />
                  Communication
                </li>
                <li className="flex items-center gap-2">
                  <IoCheckmarkCircle className="text-green-500" />
                  Timeliness
                </li>
              </ul>
            </div>

            <div
              className={cn(
                "p-6 rounded-xl border-2",
                colors.card,
                colors.border
              )}
            >
              <div className="flex items-center gap-3 mb-4">
                <FaChartLine className="text-blue-500" size={24} />
                <h3 className={cn("text-xl font-semibold", colors.text)}>
                  Rating Impact
                </h3>
              </div>
              <p className={cn("text-sm mb-4", colors.textMuted)}>
                How ratings affect your profile and opportunities:
              </p>
              <ul className={cn("space-y-2 text-sm", colors.textMuted)}>
                <li className="flex items-center gap-2">
                  <IoTrendingUp className="text-green-500" />
                  Higher visibility in search results
                </li>
                <li className="flex items-center gap-2">
                  <FaAward className="text-amber-500" />
                  Eligibility for premium badges
                </li>
                <li className="flex items-center gap-2">
                  <FaCrown className="text-purple-500" />
                  Access to exclusive gigs
                </li>
                <li className="flex items-center gap-2">
                  <IoShieldCheckmark className="text-blue-500" />
                  Increased client trust
                </li>
              </ul>
            </div>
          </div>

          <div
            className={cn(
              "p-6 rounded-xl border-2",
              colors.card,
              colors.border
            )}
          >
            <h3 className={cn("text-xl font-semibold mb-4", colors.text)}>
              Rating Guidelines
            </h3>
            <div className="grid md:grid-cols-5 gap-4 text-center">
              {[
                { stars: 5, label: "Excellent", color: "text-green-500" },
                { stars: 4, label: "Good", color: "text-blue-500" },
                { stars: 3, label: "Average", color: "text-yellow-500" },
                { stars: 2, label: "Poor", color: "text-orange-500" },
                { stars: 1, label: "Unacceptable", color: "text-red-500" },
              ].map((rating) => (
                <div key={rating.stars} className="space-y-2">
                  <div className={cn("text-2xl font-bold", rating.color)}>
                    {rating.stars} ★
                  </div>
                  <div className={cn("text-xs", colors.textMuted)}>
                    {rating.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* Reliability Section */}
        <section id="reliability" className="space-y-8">
          <div className="text-center">
            <h2 className={cn("text-3xl font-bold mb-4", colors.text)}>
              Reliability Scoring
            </h2>
            <p className={cn("text-lg max-w-3xl mx-auto", colors.textMuted)}>
              Track and improve your reliability score to build trust and unlock
              better opportunities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <IoCheckmarkCircle className="text-green-500" size={32} />
                ),
                title: "Completion Rate",
                description:
                  "Percentage of accepted gigs successfully completed",
                details: "Based on finished vs accepted gigs",
              },
              {
                icon: <FaRegClock className="text-blue-500" size={32} />,
                title: "On-Time Performance",
                description: "Punctuality and adherence to schedules",
                details: "Arrival time and deadline compliance",
              },
              {
                icon: <FaShieldAlt className="text-purple-500" size={32} />,
                title: "Cancellation History",
                description: "Frequency and timing of gig cancellations",
                details: "Early vs last-minute cancellations",
              },
            ].map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={cn(
                  "p-6 rounded-xl border-2 text-center transition-all duration-300 hover:shadow-lg",
                  colors.card,
                  colors.border,
                  "hover:scale-105"
                )}
              >
                <div className="flex justify-center mb-4">{metric.icon}</div>
                <h3 className={cn("text-xl font-semibold mb-2", colors.text)}>
                  {metric.title}
                </h3>
                <p className={cn("text-sm mb-3", colors.textMuted)}>
                  {metric.description}
                </p>
                <p className={cn("text-xs", colors.textSecondary)}>
                  {metric.details}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div
              className={cn(
                "p-6 rounded-xl border-2",
                colors.card,
                colors.border
              )}
            >
              <h3 className={cn("text-xl font-semibold mb-4", colors.text)}>
                Improving Your Score
              </h3>
              <ul className={cn("space-y-3 text-sm", colors.textMuted)}>
                <li className="flex items-start gap-3">
                  <IoCheckmarkCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Accept gigs you're confident you can complete</span>
                </li>
                <li className="flex items-start gap-3">
                  <IoCheckmarkCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Communicate early if issues arise</span>
                </li>
                <li className="flex items-start gap-3">
                  <IoCheckmarkCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Arrive early and be prepared</span>
                </li>
                <li className="flex items-start gap-3">
                  <IoCheckmarkCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Complete all required tasks thoroughly</span>
                </li>
              </ul>
            </div>

            <div
              className={cn(
                "p-6 rounded-xl border-2",
                colors.card,
                colors.border
              )}
            >
              <h3 className={cn("text-xl font-semibold mb-4", colors.text)}>
                Score Impact
              </h3>
              <div className="space-y-4">
                {[
                  {
                    range: "90-100%",
                    level: "Excellent",
                    color: "text-green-500",
                  },
                  { range: "80-89%", level: "Good", color: "text-blue-500" },
                  { range: "70-79%", level: "Fair", color: "text-yellow-500" },
                  {
                    range: "Below 70%",
                    level: "Needs Improvement",
                    color: "text-red-500",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className={cn("text-sm font-medium", colors.text)}>
                      {item.range}
                    </span>
                    <span className={cn("text-sm font-semibold", item.color)}>
                      {item.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        {/* Getting Started Section */}
        <section
          id="getting-started"
          className={cn(
            "p-8 rounded-xl border-2 text-center transition-all duration-300",
            colors.card,
            colors.border,
            "hover:shadow-xl"
          )}
        >
          <FaRocket className="mx-auto text-blue-500 mb-4" size={48} />
          <h2 className={cn("text-3xl font-bold mb-4", colors.text)}>
            Ready to Get Started?
          </h2>
          <p className={cn("text-lg mb-6 max-w-2xl mx-auto", colors.textMuted)}>
            Join thousands of performers building their reputation and earning
            more through our transparent badge system.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => router.replace("/profile")}
              className={cn(
                "px-6 py-3 rounded-lg font-semibold transition-all duration-200",
                colors.primaryBg,
                colors.primaryBgHover,
                colors.textInverted,
                "hover:scale-105 shadow-lg"
              )}
            >
              Create Profile
            </button>
            <button
              className={cn(
                "px-6 py-3 rounded-lg font-semibold transition-all duration-200 border-2",
                colors.border,
                colors.text,
                colors.hoverBg,
                "hover:scale-105"
              )}
            >
              Learn More
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
