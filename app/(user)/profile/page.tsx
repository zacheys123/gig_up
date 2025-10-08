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
  const { colors, mounted } = useThemeColors();

  // Use Convex query to get all gigs with user data
  const gigs = useQuery(api.controllers.gigs.getGigsWithUsers) as
    | GigWithUsers[]
    | undefined;

  useEffect(() => {
    if (!isLoading && !user) router.push("/sign-in");
  }, [user, isLoading, router]);

  if (isLoading || (!user && mounted)) {
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
          <div className="grid grid-cols-2 gap-4 mt-6 md:grid-cols-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton
                key={i}
                className={cn("h-32 rounded-xl", colors.backgroundMuted)}
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
      user?.isClient
        ? gig.postedByUser?.clerkId === user?.clerkId
        : gig.bookedByUser?.clerkId === user?.clerkId
    ).length || 0;

  const totalConnections =
    (user?.followers?.length || 0) + (user?.followings?.length || 0);
  console.log(user?.isClient, user?.isMusician);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn("min-h-screen w-full p-4 md:p-8", colors.background)}
    >
      <div className="max-w-4xl mx-auto">
        {/* Simplified Header */}
        <motion.header initial={{ y: -20 }} animate={{ y: 0 }} className="mb-8">
          <div className="text-center">
            <h1
              className={cn(
                "text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-purple-500 mb-2"
              )}
            >
              Welcome Back, {user?.firstname}!
            </h1>
            <p className={cn("text-lg", colors.textMuted)}>
              {user?.isMusician
                ? "Musician"
                : user?.isClient
                  ? "Client"
                  : "Member"}{" "}
              • Joined{" "}
              {user?._creationTime
                ? new Date(user._creationTime).toLocaleDateString()
                : "Recently"}
            </p>
          </div>
        </motion.header>

        {/* Quick Stats Overview */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: <Icons.gig className="h-5 w-5" />,
                title: user?.isClient ? "Gigs Posted" : "Gigs Booked",
                value: userGigsCount,
                color: "from-blue-500/10 to-blue-500/20",
              },
              {
                icon: <Icons.earnings className="h-5 w-5" />,
                title: "Earnings",
                value: `KES ${user?.earnings?.toFixed(0) || "0"}`,
                color: "from-green-500/10 to-green-500/20",
              },
              {
                icon: <Icons.connections className="h-5 w-5" />,
                title: "Connections",
                value: totalConnections,
                color: "from-purple-500/10 to-purple-500/20",
              },
              {
                icon: <Icons.user className="h-5 w-5" />,
                title: "Account Type",
                value: user?.isMusician
                  ? "Musician"
                  : user?.isClient
                    ? "Client"
                    : "Not Set",
                color: "from-amber-500/10 to-amber-500/20",
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -2 }}
                className={cn(
                  "rounded-xl p-4 border text-center",
                  colors.card,
                  colors.border
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-lg bg-gradient-to-br mx-auto w-12 mb-2",
                    stat.color
                  )}
                >
                  {stat.icon}
                </div>
                <p className={cn("text-2xl font-bold", colors.text)}>
                  {stat.value}
                </p>
                <p className={cn("text-sm mt-1", colors.textMuted)}>
                  {stat.title}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Profile Completion */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div
            className={cn("rounded-xl border p-6", colors.card, colors.border)}
          >
            <h2 className={cn("text-xl font-semibold mb-4", colors.text)}>
              Profile Completion
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={cn("text-sm", colors.textMuted)}>
                  Progress
                </span>
                <span className="text-amber-400 font-bold">
                  {Math.round(
                    (((user?.firstname ? 1 : 0) +
                      (user?.date ? 1 : 0) +
                      (user?.month ? 1 : 0) +
                      (user?.year ? 1 : 0) +
                      (user?.isMusician || user?.isClient ? 1 : 0)) /
                      5) *
                      100
                  )}
                  %
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
                        (user?.isMusician || user?.isClient ? 1 : 0)) /
                        5) *
                      100
                    }%`,
                  }}
                />
              </div>
              <p className={cn("text-xs text-center", colors.textMuted)}>
                Complete your profile to unlock all features
              </p>
            </div>
          </div>
        </motion.section>

        {/* Quick Actions */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div
            className={cn(
              "mb-[70px] rounded-xl border p-6",
              colors.card,
              colors.border
            )}
          >
            <h2 className={cn("text-xl font-semibold mb-4", colors.text)}>
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={cn(
                  "p-4 rounded-lg border text-center cursor-pointer transition-all hover:scale-105",
                  colors.secondaryBackground,
                  colors.border,
                  "hover:border-amber-400/30"
                )}
              >
                <Icons.user className="h-6 w-6 mx-auto mb-2 text-amber-400" />
                <h3 className={cn("font-medium", colors.text)}>Edit Profile</h3>
                <p className={cn("text-sm", colors.textMuted)}>
                  Update your information
                </p>
              </div>
              <div
                className={cn(
                  "p-4 rounded-lg border text-center cursor-pointer transition-all hover:scale-105 ",
                  colors.secondaryBackground,
                  colors.border,
                  "hover:border-amber-400/30"
                )}
              >
                <Icons.gig className="h-6 w-6 mx-auto mb-2 text-amber-400" />
                <h3 className={cn("font-medium", colors.text)}>
                  {user?.isClient ? "Post Gig" : "Find Gigs"}
                </h3>
                <p className={cn("text-sm", colors.textMuted)}>
                  {user?.isClient ? "Create a new gig" : "Browse opportunities"}
                </p>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
};

export default ProfilePage;

// Icons component (unchanged)
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
