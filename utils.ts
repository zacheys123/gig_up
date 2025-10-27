import { Id } from "@/convex/_generated/dataModel";
import { UserProps } from "./types/userTypes";
import { Notification, NotificationType } from "./convex/notificationsTypes";

export const toUserId = (id: string): Id<"users"> => {
  return id as Id<"users">;
};

export const toGigId = (id: string): Id<"gigs"> => {
  return id as Id<"gigs">;
};

export const searchFunc = (users: UserProps[], searchQuery: string) => {
  let sortedData = users;
  console.log(sortedData);
  if (searchQuery) {
    sortedData = sortedData?.filter((user: UserProps) => {
      if (
        user?.firstname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user?.lastname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        // user?.username?.toLowerCase().includes(searchQuery) ||
        user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user?.instrument?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return true;
      }
    });
  }
  return sortedData;
};

// utils/deepseekCostTracker.ts
export class DeepSeekCostTracker {
  private static readonly COST_PER_1K_TOKENS = 0.00014; // $0.00014 per 1K tokens

  static estimateCost(inputTokens: number, outputTokens: number): number {
    const inputCost = (inputTokens / 1000) * this.COST_PER_1K_TOKENS;
    const outputCost = (outputTokens / 1000) * this.COST_PER_1K_TOKENS;
    return inputCost + outputCost;
  }

  // Example: A typical Q&A might use 100 input + 200 output tokens
  static estimateTypicalCost(): number {
    return this.estimateCost(100, 200); // ~$0.000042 per question!
  }

  static calculateMonthlyCost(
    dailyQuestions: number,
    days: number = 30
  ): number {
    const costPerQuestion = this.estimateTypicalCost();
    return costPerQuestion * dailyQuestions * days;
  }
}

// Usage examples:
console.log("Cost per question:", DeepSeekCostTracker.estimateTypicalCost()); // ~$0.000042
console.log(
  "Monthly cost (100 questions/day):",
  DeepSeekCostTracker.calculateMonthlyCost(100)
);

// Fixed TypeScript interfaces
export type PlatformVersion = "v1.0" | "v2.0" | "v3.0";

export interface AIContexts {
  [version: string]: string;
  current: PlatformVersion;
}

export const GIGUP_CONTEXTS: AIContexts = {
  // Version 1.0 - Basic platform
  "v1.0": `
You are GigUp Assistant for GigUp Platform v1.0

PLATFORM VERSION: 1.0
CORE FEATURES:
- Basic gig posting and discovery
- Musician and client profiles  
- Messaging system
- Free/Pro subscription tiers

PRICING:
- Free: 5 gigs/month, 50 messages
- Pro: Unlimited gigs & messages
- Musician: 1500 KES/month
- Client: 2000 KES/month

RESPONSE GUIDELINES:
- Focus on core platform features
- Direct users to basic functionality
- Keep answers simple and direct
`,

  // Version 2.0 - Advanced features
  "v2.0": `
You are GigUp Assistant for GigUp Platform v2.0

PLATFORM VERSION: 2.0 - "PRODUCER EDITION"
NEW FEATURES:
- Multi-vendor event packages
- Video portfolio uploads (max 5 videos)
- Advanced analytics dashboard
- Real-time collaboration tools
- Event planning calendar

CORE FEATURES:
- Gig posting and discovery
- Profile management
- Messaging system
- Free/Pro/Enterprise tiers

PRICING:
- Free: 5 gigs/month, 50 messages, basic analytics
- Pro: Unlimited gigs & messages, video portfolios, advanced analytics - 2000 KES/month
- Enterprise: Multi-vendor events, priority support, custom features - 5000 KES/month

USER ROLES:
- Musicians: Performers, instrumentalists, vocalists
- Clients: Event organizers, venue managers
- Producers: Multi-event planners, talent coordinators (NEW)

RESPONSE GUIDELINES:
- Highlight new v2.0 features when relevant
- Explain multi-vendor capabilities
- Mention video portfolio benefits
- Tailor advice to user's subscription tier
`,

  // Version 3.0 - Future roadmap
  "v3.0": `
You are GigUp Assistant for GigUp Platform v3.0

PLATFORM VERSION: 3.0 - "COLLABORATION SUITE"
NEW FEATURES:
- Live streaming integration
- Virtual event hosting
- Royalty tracking & payments
- Music licensing assistance
- Cross-platform promotions

V2.0 FEATURES:
- Multi-vendor events
- Video portfolios  
- Advanced analytics
- Collaboration tools

PRICING:
- Free: Basic features + 1 live stream/month
- Pro: All v2.0 features + 5 live streams/month - 2500 KES/month
- Enterprise: Full platform + unlimited streams - 7500 KES/month

RESPONSE GUIDELINES:
- Focus on collaboration and growth features
- Explain live streaming capabilities
- Help with music business aspects
`,

  // Current active version - FIXED: Removed 'as const' since the type is already specific
  current: "v1.0",
};

export const getCurrentContext = () => GIGUP_CONTEXTS[GIGUP_CONTEXTS.current];

export const setPlatformVersion = (version: PlatformVersion) => {
  if (GIGUP_CONTEXTS[version]) {
    GIGUP_CONTEXTS.current = version;
  }
};

// utils/profileCompletion.ts
export interface UserProfile {
  firstname?: string;
  lastname?: string;
  talentbio?: string;
  city?: string;
  phone?: string;
  date?: string;
  month?: string;
  year?: string;
  instrument?: string;
  experience?: string;
  musicianhandles?: any[];
  rate?: {
    regular?: string;
    function?: string;
    concert?: string;
    corporate?: string;
  };
  videosProfile?: any[];
  // Add other fields from your model
  [key: string]: any;
}

export const calculateProfileCompletion = (
  user: UserProfile | null | undefined
): number => {
  if (!user) return 0;

  const isMusician = user.isMusician;

  if (isMusician) {
    // Musician-specific fields with more detailed weighting
    const musicianFields = [
      // Personal Info (30%)
      { check: () => !!(user.firstname && user.firstname.trim()), weight: 5 },
      { check: () => !!(user.lastname && user.lastname.trim()), weight: 5 },
      { check: () => !!(user.city && user.city.trim()), weight: 5 },
      { check: () => !!(user.phone && user.phone.trim()), weight: 5 },
      {
        check: () =>
          !!(
            user.date &&
            user.month &&
            user.year &&
            user.date.trim() &&
            user.month.trim() &&
            user.year.trim()
          ),
        weight: 10,
      },

      // Professional Info (40%)
      { check: () => !!(user.talentbio && user.talentbio.trim()), weight: 10 },
      {
        check: () => !!(user.instrument && user.instrument.trim()),
        weight: 10,
      },
      {
        check: () => !!(user.experience && user.experience.trim()),
        weight: 10,
      },
      {
        check: () => {
          if (!user.rate) return false;
          const rates = Object.values(user.rate);
          return rates.some((rate) => rate && rate.toString().trim() !== "");
        },
        weight: 10,
      },

      // Media & Social (30%)
      {
        check: () => !!(user.videosProfile && user.videosProfile.length > 0),
        weight: 20,
      },
      {
        check: () =>
          !!(user.musicianhandles && user.musicianhandles.length > 0),
        weight: 10,
      },
    ];

    const totalWeight = musicianFields.reduce(
      (sum, field) => sum + field.weight,
      0
    );
    const completedWeight = musicianFields.reduce((sum, field) => {
      return sum + (field.check() ? field.weight : 0);
    }, 0);

    return Math.round((completedWeight / totalWeight) * 100);
  } else {
    // Client-specific fields
    const clientFields = [
      // Personal & Contact Info (50%)
      { check: () => !!(user.firstname && user.firstname.trim()), weight: 15 },
      { check: () => !!(user.lastname && user.lastname.trim()), weight: 15 },
      { check: () => !!(user.city && user.city.trim()), weight: 10 },
      { check: () => !!(user.phone && user.phone.trim()), weight: 10 },

      // Business Info (50%)
      {
        check: () => !!(user.organization && user.organization.trim()),
        weight: 25,
      },
      {
        check: () => !!(user.talentbio && user.talentbio.trim()),
        weight: 25,
      },
    ];

    const totalWeight = clientFields.reduce(
      (sum, field) => sum + field.weight,
      0
    );
    const completedWeight = clientFields.reduce((sum, field) => {
      return sum + (field.check() ? field.weight : 0);
    }, 0);

    return Math.round((completedWeight / totalWeight) * 100);
  }
};

export const getProfileCompletionMessage = (percentage: number): string => {
  if (percentage >= 90) return "Excellent! Your profile is complete";
  if (percentage >= 75) return "Great profile! Almost there";
  if (percentage >= 50) return "Good start! Keep going";
  if (percentage >= 25) return "Getting there! Add more details";
  return "Start building your profile";
};

export const getMissingFields = (
  user: UserProfile | null | undefined
): string[] => {
  if (!user) return ["All fields"];

  const isMusician = user.isMusician;
  const missing: string[] = [];

  if (isMusician) {
    // Musician missing fields
    if (!user.firstname?.trim()) missing.push("First Name");
    if (!user.lastname?.trim()) missing.push("Last Name");
    if (!user.city?.trim()) missing.push("City");
    if (!user.phone?.trim()) missing.push("Phone");
    if (!user.date?.trim() || !user.month?.trim() || !user.year?.trim())
      missing.push("Date of Birth");
    if (!user.talentbio?.trim()) missing.push("Bio");
    if (!user.instrument?.trim()) missing.push("Instrument");
    if (!user.experience?.trim()) missing.push("Experience");

    // Check if any rate is set
    const hasRates =
      user.rate &&
      Object.values(user.rate).some((rate) => rate && rate.toString().trim());
    if (!hasRates) missing.push("Performance Rates");

    if (!user.videosProfile?.length) missing.push("Performance Videos");
    if (!user.musicianhandles?.length) missing.push("Social Media");
  } else {
    // Client missing fields
    if (!user.firstname?.trim()) missing.push("First Name");
    if (!user.lastname?.trim()) missing.push("Last Name");
    if (!user.city?.trim()) missing.push("City");
    if (!user.phone?.trim()) missing.push("Phone");
    if (!user.organization?.trim()) missing.push("Organization");
    if (!user.talentbio?.trim()) missing.push("Bio/Description");
  }

  return missing;
};
// utils/formatLastMessage.ts
export function formatLastMessage(
  lastMessage: string,
  currentUserId: string,
  senderId?: string
): string {
  if (!lastMessage) return "No messages yet";

  // Truncate long messages
  const truncated =
    lastMessage.length > 50
      ? lastMessage.substring(0, 50) + "..."
      : lastMessage;

  // Add "You: " prefix for user's own messages
  if (senderId === currentUserId) {
    return `You: ${truncated}`;
  }

  return truncated;
}

// For media messages
export function getLastMessagePreview(
  messageType: string,
  content?: string
): string {
  switch (messageType) {
    case "image":
      return "📷 Image";
    case "file":
      return "📎 File";
    case "audio":
      return "🎤 Voice message";
    default:
      return content || "No messages yet";
  }
}

export interface GroupedNotification {
  _id: string;
  type: "message_group" | "follow_group" | "profile_view_group" | "gig_group";
  title: string;
  description: string;
  count: number;
  notifications: Notification[];
  latestTimestamp: number;
  isRead: boolean;
  metadata: {
    groupedType: string;
    primaryActionUrl?: string;
    // Group-specific metadata
    chatId?: string;
    senderIds?: string[];
    followerIds?: string[];
    viewerIds?: string[];
    gigIds?: string[];
    // For quick access to the latest notification
    latestNotification?: Notification;
  };
}

export const groupNotifications = (
  notifications: Notification[]
): (Notification | GroupedNotification)[] => {
  const grouped: (Notification | GroupedNotification)[] = [];
  const groups = {
    messages: new Map<string, GroupedNotification>(),
    follows: new Map<string, GroupedNotification>(),
    profileViews: new Map<string, GroupedNotification>(),
    gigs: new Map<string, GroupedNotification>(),
  };

  const seenNotifications = new Set<string>();

  notifications.forEach((notification) => {
    if (seenNotifications.has(notification._id)) return;
    seenNotifications.add(notification._id);

    switch (notification.type) {
      case "new_message":
        groupMessageNotification(notification, groups.messages, grouped);
        break;

      case "new_follower":
      case "follow_request":
      case "follow_accepted":
        groupFollowNotification(notification, groups.follows, grouped);
        break;

      case "profile_view":
        groupProfileViewNotification(
          notification,
          groups.profileViews,
          grouped
        );
        break;

      case "gig_invite":
      case "gig_application":
      case "gig_approved":
      case "gig_rejected":
      case "gig_cancelled":
      case "gig_reminder":
        groupGigNotification(notification, groups.gigs, grouped);
        break;

      default:
        // Don't group other notification types
        grouped.push(notification);
    }
  });

  // Sort all items by latest timestamp
  return grouped.sort((a, b) => {
    const timeA = "latestTimestamp" in a ? a.latestTimestamp : a.createdAt;
    const timeB = "latestTimestamp" in b ? b.latestTimestamp : b.createdAt;
    return timeB - timeA;
  });
};

const groupMessageNotification = (
  notification: Notification,
  groups: Map<string, GroupedNotification>,
  grouped: (Notification | GroupedNotification)[]
) => {
  const chatId = notification.metadata?.chatId;

  if (chatId) {
    const groupKey = `messages_${chatId}`;

    if (groups.has(groupKey)) {
      const group = groups.get(groupKey)!;
      group.notifications.push(notification);
      group.count += 1;
      group.latestTimestamp = Math.max(
        group.latestTimestamp,
        notification.createdAt
      );
      group.isRead = group.isRead && notification.isRead;

      // Update metadata
      if (!group.metadata.senderIds) group.metadata.senderIds = [];
      const senderId = notification.metadata?.senderDocumentId;
      if (senderId && !group.metadata.senderIds.includes(senderId)) {
        group.metadata.senderIds.push(senderId);
      }

      // Update description based on count
      if (group.count === 2) {
        group.description = `2 new messages in chat`;
      } else {
        group.description = `${group.count} new messages in chat`;
      }

      group.metadata.latestNotification = notification;
    } else {
      const group: GroupedNotification = {
        _id: `group_${groupKey}`,
        type: "message_group",
        title: "New Messages",
        description: "1 new message in chat",
        count: 1,
        notifications: [notification],
        latestTimestamp: notification.createdAt,
        isRead: notification.isRead,
        metadata: {
          groupedType: "messages",
          chatId: chatId,
          senderIds: notification.metadata?.senderDocumentId
            ? [notification.metadata.senderDocumentId]
            : [],
          latestNotification: notification,
        },
      };
      groups.set(groupKey, group);
      grouped.push(group);
    }
  } else {
    grouped.push(notification);
  }
};

const groupFollowNotification = (
  notification: Notification,
  groups: Map<string, GroupedNotification>,
  grouped: (Notification | GroupedNotification)[]
) => {
  const followerId =
    notification.metadata?.followerDocumentId ||
    notification.metadata?.requesterDocumentId;

  if (followerId) {
    const groupKey = `follows_${followerId}`;

    if (groups.has(groupKey)) {
      const group = groups.get(groupKey)!;
      group.notifications.push(notification);
      group.count += 1;
      group.latestTimestamp = Math.max(
        group.latestTimestamp,
        notification.createdAt
      );
      group.isRead = group.isRead && notification.isRead;

      // Update title and description based on activities
      const activities = new Set(group.notifications.map((n) => n.type));
      if (
        activities.has("follow_request") &&
        activities.has("follow_accepted")
      ) {
        group.title = "Follow Activities";
        group.description = "Multiple follow activities";
      }

      group.metadata.latestNotification = notification;
    } else {
      const group: GroupedNotification = {
        _id: `group_${groupKey}`,
        type: "follow_group",
        title: getFollowGroupTitle(notification.type),
        description: getFollowGroupDescription(notification, 1),
        count: 1,
        notifications: [notification],
        latestTimestamp: notification.createdAt,
        isRead: notification.isRead,
        metadata: {
          groupedType: "follows",
          followerIds: [followerId],
          latestNotification: notification,
        },
      };
      groups.set(groupKey, group);
      grouped.push(group);
    }
  } else {
    grouped.push(notification);
  }
};

const groupProfileViewNotification = (
  notification: Notification,
  groups: Map<string, GroupedNotification>,
  grouped: (Notification | GroupedNotification)[]
) => {
  const viewerId = notification.metadata?.viewerDocumentId;

  if (viewerId) {
    const groupKey = `profile_views_${viewerId}`;

    if (groups.has(groupKey)) {
      const group = groups.get(groupKey)!;
      group.notifications.push(notification);
      group.count += 1;
      group.latestTimestamp = Math.max(
        group.latestTimestamp,
        notification.createdAt
      );
      group.isRead = group.isRead && notification.isRead;

      group.description = `${group.count} profile views from this user`;
      group.metadata.latestNotification = notification;
    } else {
      const group: GroupedNotification = {
        _id: `group_${groupKey}`,
        type: "profile_view_group",
        title: "Profile View",
        description: "1 profile view",
        count: 1,
        notifications: [notification],
        latestTimestamp: notification.createdAt,
        isRead: notification.isRead,
        metadata: {
          groupedType: "profile_views",
          viewerIds: [viewerId],
          latestNotification: notification,
        },
      };
      groups.set(groupKey, group);
      grouped.push(group);
    }
  } else {
    grouped.push(notification);
  }
};

const groupGigNotification = (
  notification: Notification,
  groups: Map<string, GroupedNotification>,
  grouped: (Notification | GroupedNotification)[]
) => {
  const gigId = notification.metadata?.gigId || notification.relatedGigId;

  if (gigId) {
    const groupKey = `gigs_${gigId}`;

    if (groups.has(groupKey)) {
      const group = groups.get(groupKey)!;
      group.notifications.push(notification);
      group.count += 1;
      group.latestTimestamp = Math.max(
        group.latestTimestamp,
        notification.createdAt
      );
      group.isRead = group.isRead && notification.isRead;

      // Update title to show multiple gig activities
      group.title = "Gig Activities";
      group.description = `${group.count} updates for this gig`;
      group.metadata.latestNotification = notification;
    } else {
      const group: GroupedNotification = {
        _id: `group_${groupKey}`,
        type: "gig_group",
        title: getGigGroupTitle(notification.type),
        description: "1 gig update",
        count: 1,
        notifications: [notification],
        latestTimestamp: notification.createdAt,
        isRead: notification.isRead,
        metadata: {
          groupedType: "gigs",
          gigIds: [gigId],
          latestNotification: notification,
        },
      };
      groups.set(groupKey, group);
      grouped.push(group);
    }
  } else {
    grouped.push(notification);
  }
};

// Helper functions
const getFollowGroupTitle = (type: NotificationType): string => {
  switch (type) {
    case "new_follower":
      return "New Follower";
    case "follow_request":
      return "Follow Request";
    case "follow_accepted":
      return "Follow Accepted";
    default:
      return "Follow Activity";
  }
};

const getFollowGroupDescription = (
  notification: Notification,
  count: number
): string => {
  const name =
    notification.metadata?.followerName ||
    notification.metadata?.requesterName ||
    "Someone";

  if (count === 1) {
    switch (notification.type) {
      case "new_follower":
        return `${name} started following you`;
      case "follow_request":
        return `${name} sent a follow request`;
      case "follow_accepted":
        return `${name} accepted your follow request`;
      default:
        return "New follow activity";
    }
  } else {
    return `${count} follow activities from ${name}`;
  }
};

const getGigGroupTitle = (type: NotificationType): string => {
  switch (type) {
    case "gig_invite":
      return "Gig Invite";
    case "gig_application":
      return "Gig Application";
    case "gig_approved":
      return "Gig Approved";
    case "gig_rejected":
      return "Gig Rejected";
    case "gig_cancelled":
      return "Gig Cancelled";
    case "gig_reminder":
      return "Gig Reminder";
    default:
      return "Gig Update";
  }
};
