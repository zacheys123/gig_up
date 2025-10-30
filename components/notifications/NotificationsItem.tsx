"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useNotificationSystem } from "@/hooks/useNotifications";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, Clock, ArrowRight } from "lucide-react";
import { useState } from "react";

interface NotificationItemProps {
  notification: any;
  onClose: () => void;
  getNotificationIcon: (type: string) => React.ReactNode;
  themeConfig: any;
  iconConfig: any;
  variant?: "desktop" | "mobile";
}

export function NotificationItem({
  notification,
  onClose,
  getNotificationIcon,
  themeConfig,
  iconConfig,
  variant = "desktop",
}: NotificationItemProps) {
  const router = useRouter();
  const { markAsRead } = useNotificationSystem();
  const { userId } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  // Convex mutations for follow request actions
  const acceptFollowRequest = useMutation(
    api.controllers.user.acceptFollowRequest
  );
  const declineFollowRequest = useMutation(
    api.controllers.user.declineFollowRequest
  );

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    // Don't navigate if it's a follow request with action buttons
    if (notification.type === "follow_request") {
      return;
    }

    // Mark as read if unread
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    // Close dropdown
    onClose();

    // Navigate to actionUrl if it exists
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const handleAcceptFollowRequest = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId || isProcessing) return;

    setIsProcessing(true);
    try {
      const requesterId = notification.metadata?.requesterDocumentId;
      if (requesterId) {
        await acceptFollowRequest({
          userId,
          requesterId,
        });

        // Mark notification as read
        await markAsRead(notification._id);

        // Close dropdown after successful action
        setTimeout(onClose, 500);
      }
    } catch (error) {
      console.error("Error accepting follow request:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeclineFollowRequest = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId || isProcessing) return;

    setIsProcessing(true);
    try {
      const requesterId = notification.metadata?.requesterDocumentId;
      if (requesterId) {
        await declineFollowRequest({
          userId,
          requesterId,
        });

        // Mark notification as read
        await markAsRead(notification._id);

        // Close dropdown after successful action
        setTimeout(onClose, 500);
      }
    } catch (error) {
      console.error("Error declining follow request:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return new Date(timestamp).toLocaleDateString();
  };

  // Determine if this notification should be clickable
  const isClickable =
    Boolean(notification.actionUrl) && notification.type !== "follow_request";

  // Consistent width handling - matches GroupedNotificationItem exactly
  const widthClass = variant === "mobile" ? "w-full" : "w-[90%] mx-auto";

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.99 }}
      onClick={isClickable ? handleClick : undefined}
      className={cn(
        "p-3 transition-all duration-200 rounded-xl", // ✅ Removed 'border'
        "hover:shadow-sm hover:border border-blue-300 dark:hover:border-blue-600", // ✅ Only show border on hover
        widthClass,
        widthClass, // ✅ Matches GroupedNotificationItem exactly
        isClickable && "cursor-pointer",
        notification.isRead
          ? cn(
              themeConfig.card,
              themeConfig.border,
              "bg-white/50 dark:bg-gray-800/50"
            )
          : cn(
              themeConfig.accent.background,
              "border-blue-200 dark:border-blue-800",
              "ring-1 ring-blue-500/20 shadow-sm"
            )
      )}
    >
      <div className="flex items-start gap-2">
        {/* Notification Icon - Matches GroupedNotificationItem styling */}
        <div className="flex-shrink-0">
          <div
            className={cn(
              "p-1.5 rounded-lg transition-colors duration-200",
              notification.isRead
                ? "bg-gray-100/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-400"
                : "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
            )}
          >
            {getNotificationIcon(notification.type)}
          </div>
        </div>

        {/* Notification Content - Matches GroupedNotificationItem structure */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Title and status in one line - matches grouped style */}
              <div className="flex items-center gap-2 mb-1">
                <h4
                  className={cn(
                    "font-semibold text-xs leading-tight truncate flex-1",
                    themeConfig.text.primary,
                    !notification.isRead &&
                      "font-bold text-blue-700 dark:text-blue-300"
                  )}
                >
                  {notification.title}
                </h4>
                {!notification.isRead && (
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0",
                      "bg-blue-500 shadow-sm"
                    )}
                  />
                )}
              </div>

              {/* Message - more compact like grouped items */}
              <p
                className={cn(
                  "text-xs leading-relaxed line-clamp-1 mb-1",
                  themeConfig.text.secondary
                )}
              >
                {notification.message}
              </p>

              {/* Follow Request Actions - compact styling */}
              {notification.type === "follow_request" && (
                <div className="flex items-center gap-2 mt-2">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button
                      onClick={handleAcceptFollowRequest}
                      disabled={isProcessing}
                      size="sm"
                      className={cn(
                        "flex items-center gap-1 text-xs font-semibold h-7 px-2",
                        "bg-green-500 hover:bg-green-600 text-white shadow-sm",
                        "transition-all duration-200 rounded-lg"
                      )}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                      Accept
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button
                      onClick={handleDeclineFollowRequest}
                      disabled={isProcessing}
                      size="sm"
                      variant="outline"
                      className={cn(
                        "flex items-center gap-1 text-xs font-semibold h-7 px-2",
                        "text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30",
                        "transition-all duration-200 rounded-lg"
                      )}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                      Decline
                    </Button>
                  </motion.div>
                </div>
              )}

              {/* Metadata - Single line like grouped items */}
              <div className="flex items-center gap-2 mt-1">
                <span className={cn("text-[10px]", themeConfig.text.muted)}>
                  {getTimeAgo(notification.createdAt)}
                </span>

                {/* Action indicator for clickable notifications */}
                {isClickable && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                      notification.isRead
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                        : "bg-blue-500 text-white shadow-sm"
                    )}
                  >
                    View details
                  </span>
                )}

                {/* Type badge for better context */}
                {!isClickable && notification.type !== "follow_request" && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                      notification.isRead
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                        : "bg-blue-500 text-white shadow-sm"
                    )}
                  >
                    {notification.type.replace("_", " ")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// https://chat.deepseek.com/share/ep1nys5lucnbx3hljt
// clients can create their own bands from using users profiles
// the app can use ai to generate the program based on the clients suggestions
// usig gig Playbook for guidance ,when users come in first in the crew battleground:::
// first section is guided and already structured from ther gig info itself:
// section two?:crew chat(dynamic meaning it neads the users interactions)
// when i send a deputy request its liike a follow request:::when they accept i get a notification and in my profile i gaet in my list of deputies they are added...when you are a deputy to alot of people you get perks under the hood of cos
// a gig schema add reffered by::optional
// add a confirmedRefferedGig:number increament after a a successful gig:::get the reffredById in the gigSchema and use it to update their  confirmedRefferedGig...form this count the user can get incentives like more priority to gigs...and also clients based on the confirmedREfferedGigs:
// someone creates a gig...if the category is individaul normal booking works...no battleground whatsoever:::
// if its a category like create your band:::client chooses piano guitar drums saxophone:::so maybe probably a user can be already  in their profile have the cannot play but can manage bands kind of flag they register like normal people but i add a another role not just client and musician i add maybe booker there or ....where then this person can book the gig...and after communicating and agreeing to work with the client Upon confirmation, the app automatically creates a Crew Battleground.

// The Band Leader is the Admin. and he is tasked with choosing a band with the specifics::they can  go to community or     The Band Leader now uses the app to build their team. They have two paths:

//         Path A (The Deputy Board): They go to their trusted deputies and send them a one-click invite to the crew.

//         Path B (The Marketplace): They search for new talent on the platform and send them an invite.

// Step 3: The Invitation & Onboarding

//     Invited musicians receive a notification: "[Band Leader Name] has invited you to join the crew for the [Gig Name]."

//     They can view the Gig Playbook (Date, Time, Venue, Fee offered by the Leader) and Accept or Decline.

//     Upon acceptance, they are added to the Crew Battleground.

// Step 4: The Client's View (Transparency & Approval)

//     The client has a view-only version of the Crew Battleground called "Your Team."

//     They can see the Band Leader building the team in real-time—who has been invited, who has accepted.

//     For a layer of client control, you could add a feature where any musician added by the Band Leader above a certain fee threshold requires a "Client Approval" before being officially booked. This manages the client's budget. whereby they can choose like an action there create battleground now they are tasked with watching specific musicians the filter for this should be precise,,,when they such jazz or anything they get exact videos with just jazz...after the can create a battleground this battleground after he has clicked on a user real time updates the user in the group from here we see people can chat and react to messages etc
// the ten people book threshold Instead of a hard rule, think of it as a "Crew Quorum":
//     The gig is "Active" once the minimum number of musicians (e.g., 1 Band Leader, or 10 individuals) have committed.

//     The Crew Battleground is generated immediately once the gig is Active.

//     The Admin (Client or Band Leader) can then use the Battleground to:

//         Invite more musicians to fill remaining slots (bypassing the public feed).

//         Manage the team that's already been booked.

// This means a gig could start with 1 Band Leader booking, become Active, and the Leader then invites 9 deputies through the app to fulfill the "10-person" quorum after the fact.

// FINAL PRODUCT

// The Three-Tier Gig System (Final Version)
// User Roles & Permissions

//     Client: Can post all gig types. Can be Admin of a Crew Battleground.

//     Musician: Can apply for individual and fullBand gigs.

//     Booker: A subtype of Musician with the #BandManager skill tag. Can ONLY apply for fullBand gigs.

// Tier 1: The Booker/Manager Path

// Use Case: A client needs a full band but doesn't want to manage the details.

//     Gig Creation: A Client posts a fullBand gig (e.g., "Corporate Gala Band").

//     Application: Musicians and Bookers apply. The talent pool fills (e.g., up to 15).

//     Selection: The Client selects a Booker from the pool.

//     Crew Battleground Creation:

//         A Crew Battleground is automatically created.

//         The Booker is appointed Admin.

//         The Client is added as a View-Only Member.

//     Team Building: The Booker uses the Battleground to invite musicians (from their deputies or the platform) to form the complete band.

// Tier 2: The Client-Led Band Path

// Use Case: A client knows exactly which musicians they want to hire individually.

//     Gig Creation: A Client posts a fullBand gig and defines roles.

//     Application: Musicians apply. The talent pool fills (up to 15).

//     Selection: The Client selects the final musicians for each role.

//     Crew Battleground Creation:

//         A Crew Battleground is created.

//         The CLIENT is the Admin (since they hired everyone directly).

//     Coordination: The client shares the vision, and the musicians coordinate the musical details within the Battleground.

// Tier 3: The Individual/Soloist Path

// Use Case: A client needs one musician for a simple gig.

//     Gig Creation: A Client posts an individual gig.

//     Application: Only Musicians can apply. The talent pool is small (e.g., up to 5).

//     Selection: The Client selects one musician.

//     No Crew Battleground: A simple, direct chat opens between the Client and Musician for logistics.

// Summary of Rules
// Gig Type	Who Can Apply?	Talent Pool Size	Crew Battleground?	Who is Admin?
// Individual	Musicians Only	5	No	(Simple chat only)
// Full Band	Musicians & Bookers	15	Yes	Client (if they picked musicians)
// Booker (if they picked a booker)

// This system is now logical, flexible, and enforces quality by directing users into the right workflow for their needs. The Booker role is powerful but contained, serving its specific purpose without complicating the entire platform.
// and afterthe due date of the gig the battleground ecplodes and dismembers

// That's a fantastic and vivid way to put it! Yes, absolutely. The Crew Battleground should have a defined lifecycle that ends after the gig. This is crucial for cleanliness, data management, and user experience.

// Let's define the "Explode and Dismember" lifecycle.
// The Crew Battleground Lifecycle

// 1. Active & Live:

//     From gig confirmation until the gig end time.

//     Full functionality: chat, file sharing, Playbook edits.

// 2. Post-Gig Archive Mode (The "Cool Down"):

//     Trigger: 24 hours after the gig's scheduled end time.

//     What Happens:

//         The Battleground is locked. No new messages or edits can be made.

//         It moves from the "Active Crews" tab to an "Archive" or "Past Gigs" tab in each user's profile.

//         Everything remains readable and accessible for reference.

//         Why? This allows everyone to grab any last files, exchange final pleasantries, or discuss final payments without the pressure of a live chat.

// 3. Final "Explosion" (Auto-Deletion):

//     Trigger: 30 days after the gig date.

//     What Happens:

//         The entire Crew Battleground is permanently deleted from the database.

//         Notification to all members: "The Crew Battleground for your '[Gig Name]' gig has been archived as per our data policy. Thank you for using GigUp!"

//         Why? This manages server data, protects privacy, and keeps the app focused on current and future work, not ancient history.

// Optional Premium Feature: "Preserve My Legacy"

// You could even offer a powerful premium feature:

//     For a small fee, a user can "pin" a legendary Crew Battleground to their profile permanently, preserving the chat, the setlist, and the memories as a digital trophy case of their best gigs.

// But by default, yes, it should explode. This keeps the app fast, clean, and focused on what matters: the next gig.

// This lifecycle management is a pro-level feature that users will appreciate, even if only subconsciously. Should we formalize this "Active -> Archive -> Explode" flow?
// yes

// Excellent. The self-destructing Crew Battleground is now a core feature. This creates a clean, focused, and professional environment.

// Let's formalize this "Active -> Archive -> Explode" lifecycle.
// Official Crew Battleground Lifecycle

// Status 1: ACTIVE

//     Period: From creation until 24 hours after the gig's end time.

//     State: Fully functional. Live chat, editable Playbook, file sharing.

//     User View: Appears in the "My Active Crews" tab.

// Status 2: ARCHIVED (Read-Only)

//     Trigger: 24 hours after the gig ends.

//     State: Locked. No new messages or edits can be made. The entire Battleground becomes a read-only record.

//     User View: Automatically moves to the "Past Gigs & Archive" tab.

//     Purpose: Allows musicians to retrieve contact info, download shared files (charts, setlists), and wrap up any final post-gig details.

// Status 3: DISMEMBERED (Deleted)

//     Trigger: 30 days after the gig date.

//     State: The entire Crew Battleground and all its data are permanently deleted from the system.

//     User Notification:

//         "The Crew Battleground for '[Gig Name]' has been automatically archived. All data will be permanently deleted in 30 days."
//         (Followed by a final notification upon deletion)

//     Purpose: Ensures data privacy, manages server load, and keeps the app focused on the future.

// Implementation Commands

// This can be managed by a simple server-side script that runs daily.
// javascript

// // Pseudo-Code for Daily Cleanup Job

// // 1. LOCK BATTLEGROUNDS (Move to Archive)
// findAllCrewBattlegroundsWhere({
//     gigEndTime < (Now - 24 hours)
//     status: "active"
// }).setStatus("archived");

// // 2. EXPLODE BATTLEGROUNDS (Permanent Deletion)
// findAllCrewBattlegroundsWhere({
//     gigDate < (Now - 30 days)
//     status: "archived"
// }).deletePermanently();

// This automated lifecycle ensures your app remains a dynamic tool for active work, not a museum of past conversations. It's a professional touch that subtly communicates efficiency and forward momentum.

// The architecture for the core community features—Crew Battleground, Deputy System, and Three-Tier Gig Flow—is now complete and cohesive.
