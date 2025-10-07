"use client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Skeleton } from "@/components/ui/skeleton";
import { SVGProps, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

type Gig = Doc<"gigs">;
type User = Doc<"users">;

interface GigWithUsers extends Gig {
  postedByUser: User | null;
  bookedByUser: User | null;
}

const ProfilePage = () => {
  const { user, isLoading } = useCurrentUser();
  const router = useRouter();
  const { colors } = useThemeColors();

  // Use Convex query to get all gigs with user data
  const gigs = useQuery(api.controllers.gigs.getGigsWithUsers) as
    | GigWithUsers[]
    | undefined;

  useEffect(() => {
    if (!isLoading && !user) router.push("/sign-in");
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className={cn("min-h-screen w-full p-4", colors.background)}>
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="space-y-3">
            <Skeleton
              className={cn(
                "h-8 w-48 rounded-lg md:h-10 md:w-64",
                colors.backgroundMuted
              )}
            />
            <Skeleton
              className={cn(
                "h-5 w-36 rounded-lg md:h-6 md:w-48",
                colors.backgroundMuted
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton
                key={i}
                className={cn(
                  "h-10 rounded-lg md:h-12",
                  colors.backgroundMuted
                )}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 md:grid-cols-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton
                key={i}
                className={cn(
                  "h-40 rounded-xl md:h-54",
                  colors.backgroundMuted
                )}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate user-specific stats
  const userGigsCount =
    gigs?.filter((gig) =>
      user.isClient
        ? gig.postedByUser?.clerkId === user.clerkId
        : gig.bookedByUser?.clerkId === user.clerkId
    ).length || 0;

  const totalConnections =
    (user.followers?.length || 0) + (user.followings?.length || 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn("min-h-screen w-full p-4 md:p-8", colors.background)}
    >
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <motion.header
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="mb-8 md:mb-12"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1
                className={cn(
                  "text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-purple-500"
                )}
              >
                Welcome to Your Profile Page
              </h1>
              <p className={cn("text-lg mt-2", colors.textMuted)}>
                Hello,{" "}
                <span className={cn("font-medium", colors.text)}>
                  {user.firstname}!
                </span>
              </p>
            </div>

            <div
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-full border transition-all",
                colors.secondaryBackground,
                colors.border
              )}
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500/10 to-purple-500/10 flex items-center justify-center">
                <Icons.user className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className={cn("text-sm font-medium", colors.textMuted)}>
                  Member since
                </p>
                <p className="text-xs text-amber-400">
                  {new Date(user._creationTime).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Profile Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 md:mb-14"
        >
          <div
            className={cn(
              "rounded-2xl border p-6 md:p-8 backdrop-blur-sm",
              colors.card,
              colors.border
            )}
          >
            {/* Replace with your RouteProfile component */}
            <div className="text-center py-8">
              <h3 className={cn("text-xl font-semibold mb-4", colors.text)}>
                Profile Management
              </h3>
              <p className={colors.textMuted}>
                Your profile management section will appear here
              </p>
            </div>
          </div>
        </motion.section>

        {/* Musicians Section - Only show if user is a musician */}
        {user.isMusician && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8 md:mb-16"
          >
            <div
              className={cn(
                "rounded-2xl border p-6 md:p-8 backdrop-blur-sm",
                colors.card,
                colors.border
              )}
            >
              <h2
                className={cn(
                  "text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-purple-400 mb-6"
                )}
              >
                Musician Dashboard
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  className={cn(
                    "p-4 rounded-xl border",
                    colors.secondaryBackground,
                    colors.border
                  )}
                >
                  <h3 className={cn("text-lg font-semibold mb-2", colors.text)}>
                    Your Gigs
                  </h3>
                  <p className={colors.textMuted}>
                    Manage your booked performances
                  </p>
                </div>
                <div
                  className={cn(
                    "p-4 rounded-xl border",
                    colors.secondaryBackground,
                    colors.border
                  )}
                >
                  <h3 className={cn("text-lg font-semibold mb-2", colors.text)}>
                    Your Portfolio
                  </h3>
                  <p className={colors.textMuted}>
                    Showcase your work and skills
                  </p>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Stats Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-12 md:mb-16"
        >
          <div
            className={cn(
              "rounded-2xl border p-6 md:p-8 backdrop-blur-sm",
              colors.card,
              colors.border
            )}
          >
            <h2
              className={cn(
                "text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-purple-400 mb-6 flex items-center gap-3"
              )}
            >
              <Icons.activity className="h-6 w-6 text-amber-400" />
              Your Activity Overview
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {[
                {
                  icon: <Icons.gig className="h-5 w-5" />,
                  title: user.isClient ? "Gigs Posted" : "Gigs Booked",
                  value: userGigsCount,
                  change: "+12%",
                  color: "from-blue-500/10 to-blue-500/20",
                },
                {
                  icon: <Icons.earnings className="h-5 w-5" />,
                  title: "Earnings",
                  value: `KES ${user.earnings?.toFixed(0) || "0"}`,
                  change: "+8%",
                  color: "from-green-500/10 to-green-500/20",
                },
                {
                  icon: <Icons.connections className="h-5 w-5" />,
                  title: "Connections",
                  value: totalConnections,
                  change: "+5",
                  color: "from-purple-500/10 to-purple-500/20",
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className={cn(
                    "rounded-xl p-5 border transition-all group",
                    colors.secondaryBackground,
                    colors.border,
                    "hover:border-amber-400/30"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={cn(
                        "p-2 rounded-lg bg-gradient-to-br group-hover:opacity-80 transition-colors",
                        stat.color
                      )}
                    >
                      {stat.icon}
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-900/30 text-green-400">
                      {stat.change}
                    </span>
                  </div>
                  <h3 className={cn("text-sm mt-4", colors.textMuted)}>
                    {stat.title}
                  </h3>
                  <p className={cn("text-2xl font-bold mt-2", colors.text)}>
                    {stat.value}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div
                className={cn(
                  "rounded-xl p-4 border",
                  colors.secondaryBackground,
                  colors.border
                )}
              >
                <h3 className={cn("text-lg font-semibold mb-3", colors.text)}>
                  Account Type
                </h3>
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium border",
                      user.isMusician
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        : user.isClient
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                    )}
                  >
                    {user.isMusician
                      ? "Musician"
                      : user.isClient
                        ? "Client"
                        : "Not Set"}
                  </div>
                  <span className={cn("text-sm", colors.textMuted)}>
                    {user.tier === "pro" ? "Pro Member" : "Free Tier"}
                  </span>
                </div>
              </div>

              <div
                className={cn(
                  "rounded-xl p-4 border",
                  colors.secondaryBackground,
                  colors.border
                )}
              >
                <h3 className={cn("text-lg font-semibold mb-3", colors.text)}>
                  Profile Completion
                </h3>
                <div
                  className={cn(
                    "w-full rounded-full h-2 mb-2",
                    colors.backgroundMuted
                  )}
                >
                  <div
                    className="bg-gradient-to-r from-amber-500 to-orange-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        (((user.firstname ? 1 : 0) +
                          (user.date ? 1 : 0) +
                          (user.month ? 1 : 0) +
                          (user.year ? 1 : 0) +
                          (user.isMusician || user.isClient ? 1 : 0)) /
                          5) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <p className={cn("text-sm", colors.textMuted)}>
                  {Math.round(
                    (((user.firstname ? 1 : 0) +
                      (user.date ? 1 : 0) +
                      (user.month ? 1 : 0) +
                      (user.year ? 1 : 0) +
                      (user.isMusician || user.isClient ? 1 : 0)) /
                      5) *
                      100
                  )}
                  % Complete
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Recent Activity Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <div
            className={cn(
              "rounded-2xl border p-6 md:p-8 backdrop-blur-sm",
              colors.card,
              colors.border
            )}
          >
            <h2
              className={cn(
                "text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-purple-400 mb-6"
              )}
            >
              Recent Activity
            </h2>

            {gigs && gigs.length > 0 ? (
              <div className="space-y-4">
                {gigs
                  .filter((gig) =>
                    user.isClient
                      ? gig.postedByUser?.clerkId === user.clerkId
                      : gig.bookedByUser?.clerkId === user.clerkId
                  )
                  .slice(0, 5)
                  .map((gig, index) => (
                    <motion.div
                      key={gig._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border transition-all",
                        colors.secondaryBackground,
                        colors.border,
                        "hover:border-amber-400/30"
                      )}
                    >
                      <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                      <div className="flex-1">
                        <h3 className={cn("font-semibold", colors.text)}>
                          {gig.title}
                        </h3>
                        <p className={cn("text-sm", colors.textMuted)}>
                          {user.isClient ? "Posted" : "Booked"} •{" "}
                          {new Date(gig.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium",
                          gig.isTaken
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        )}
                      >
                        {gig.isTaken ? "Completed" : "Active"}
                      </div>
                    </motion.div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className={colors.textMuted}>No recent activity found.</p>
                <p className={cn("text-sm mt-2", colors.textMuted)}>
                  {user.isClient
                    ? "Post your first gig to get started!"
                    : "Book your first gig to get started!"}
                </p>
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
};

export default ProfilePage;

// Icons component
const Icons = {
  user: (props: SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  activity: (props: SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  gig: (props: SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  earnings: (props: SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  connections: (props: SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </svg>
  ),
};
