import { Id } from "@/convex/_generated/dataModel";
import { UserProps } from "./types/userTypes";
import { Notification, NotificationType } from "./convex/notificationsTypes";
import { GigType } from "./convex/gigTypes";
import { BandRoleInput, CustomProps, GigFormInputs } from "./types/gig";
import { LocalGigInputs } from "./drafts";

export const toUserId = (id: string): Id<"users"> => {
  return id as Id<"users">;
};

export const toGigId = (id: string): Id<"gigs"> => {
  return id as Id<"gigs">;
};

export const searchFunc = (
  users: UserProps[],
  searchQuery: string,
  isBookerEnabled: boolean,
): UserProps[] => {
  if (!users || users.length === 0) return [];

  const query = searchQuery.toLowerCase().trim();

  if (!query) return users;

  console.log(`Searching ${users.length} users for: "${query}"`);

  return users.filter((user: UserProps) => {
    // Common fields for all user types
    const basicMatch =
      user?.firstname?.toLowerCase().includes(query) ||
      user?.lastname?.toLowerCase().includes(query) ||
      user?.email?.toLowerCase().includes(query) ||
      user?.username?.toLowerCase().includes(query) ||
      user?.bio?.toLowerCase().includes(query) ||
      user?.city?.toLowerCase().includes(query);

    if (basicMatch) return true;

    // Musician-specific fields
    if (user.isMusician) {
      const musicianMatch =
        user?.instrument?.toLowerCase().includes(query) ||
        user?.roleType?.toLowerCase().includes(query) ||
        user?.musiciangenres?.some((genre) =>
          genre.toLowerCase().includes(query),
        );
      // user?.services?.some((service) =>
      //   service.toLowerCase().includes(query)
      // ) ||
      // user?.expertise?.some((exp) => exp.toLowerCase().includes(query)) ||
      // user?.styles?.some((style) => style.toLowerCase().includes(query));

      if (musicianMatch) return true;
    }

    // Client-specific fields
    if (user.isClient) {
      const clientMatch =
        user?.organization?.toLowerCase().includes(query) ||
        // user?.interests?.some((interest) =>
        //   interest.toLowerCase().includes(query)
        // ) ||
        // user?.eventTypes?.some((eventType) =>
        //   eventType.toLowerCase().includes(query)
        // ) ||
        // user?.preferredGenres?.some((genre) =>
        //   genre.toLowerCase().includes(query)
        // ) ||
        user?.clientType?.toLowerCase().includes(query);

      if (clientMatch) return true;
    }

    // Booker/Manager specific fields
    if (isBookerEnabled) {
      if (user.isBooker) {
        const bookerMatch =
          user?.companyName?.toLowerCase().includes(query) ||
          user?.agencyName?.toLowerCase().includes(query) ||
          user?.managedArtists?.some((artist) =>
            artist.toLowerCase().includes(query),
          );

        if (bookerMatch) return true;
      }
    }

    return false;
  });
};

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
    days: number = 30,
  ): number {
    const costPerQuestion = this.estimateTypicalCost();
    return costPerQuestion * dailyQuestions * days;
  }
}

// Usage examples:
console.log("Cost per question:", DeepSeekCostTracker.estimateTypicalCost()); // ~$0.000042
console.log(
  "Monthly cost (100 questions/day):",
  DeepSeekCostTracker.calculateMonthlyCost(100),
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
You are GigUppAssistant for GigUppPlatform v1.0

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
You are GigUppAssistant for GigUppPlatform v2.0

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
You are GigUppAssistant for GigUppPlatform v3.0

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
  user: UserProfile | null | undefined,
): number => {
  if (!user) return 0;

  const isMusician = user.isMusician;
  const isTeacher = user.roleType === "teacher";
  const isDJ = user.roleType === "dj";
  const isMC = user.roleType === "mc";
  const isVocalist = user.roleType === "vocalist";
  const isNonInstrumentMusician = isDJ || isMC || isVocalist;

  if (isMusician) {
    if (isTeacher) {
      // TEACHER-SPECIFIC FIELDS - No videos
      const teacherFields = [
        // Personal Info (35%)
        { check: () => !!(user.firstname && user.firstname.trim()), weight: 7 },
        { check: () => !!(user.lastname && user.lastname.trim()), weight: 7 },
        { check: () => !!(user.city && user.city.trim()), weight: 7 },
        { check: () => !!(user.phone && user.phone.trim()), weight: 7 },
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
          weight: 7,
        },

        // Teaching Professional Info (65%)
        {
          check: () => !!(user.talentbio && user.talentbio.trim()),
          weight: 12,
        },
        {
          check: () => !!(user.instrument && user.instrument.trim()),
          weight: 12,
        },
        {
          check: () => !!(user.experience && user.experience.trim()),
          weight: 12,
        },
        {
          check: () =>
            !!(user.teacherSpecialization && user.teacherSpecialization.trim()),
          weight: 10,
        },
        {
          check: () => !!(user.teachingStyle && user.teachingStyle.trim()),
          weight: 8,
        },
        {
          check: () => !!(user.lessonFormat && user.lessonFormat.trim()),
          weight: 8,
        },
        {
          check: () => !!(user.studentAgeGroup && user.studentAgeGroup.trim()),
          weight: 6,
        },
        {
          check: () =>
            !!(user.musicianhandles && user.musicianhandles.length > 0),
          weight: 7,
        },
      ];

      const totalWeight = teacherFields.reduce(
        (sum, field) => sum + field.weight,
        0,
      );
      const completedWeight = teacherFields.reduce((sum, field) => {
        return sum + (field.check() ? field.weight : 0);
      }, 0);

      return Math.round((completedWeight / totalWeight) * 100);
    } else if (isNonInstrumentMusician) {
      // DJ, MC, VOCALIST - No videos
      const nonInstrumentFields = [
        // Personal Info (40%)
        {
          check: () => !!(user.firstname && user.firstname.trim()),
          weight: 10,
        },
        { check: () => !!(user.lastname && user.lastname.trim()), weight: 10 },
        { check: () => !!(user.city && user.city.trim()), weight: 7 },
        { check: () => !!(user.phone && user.phone.trim()), weight: 7 },
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
          weight: 6,
        },

        // Professional Info (60%) - No instrument, more weight on bio and experience
        {
          check: () => !!(user.talentbio && user.talentbio.trim()),
          weight: 20,
        },
        {
          check: () => !!(user.experience && user.experience.trim()),
          weight: 20,
        },
        {
          check: () => {
            if (!user.rate) return false;
            const rates = Object.values(user.rate);
            return rates.some((rate) => rate && rate.toString().trim() !== "");
          },
          weight: 20,
        },
      ];

      const totalWeight = nonInstrumentFields.reduce(
        (sum, field) => sum + field.weight,
        0,
      );
      const completedWeight = nonInstrumentFields.reduce((sum, field) => {
        return sum + (field.check() ? field.weight : 0);
      }, 0);

      return Math.round((completedWeight / totalWeight) * 100);
    } else {
      // REGULAR INSTRUMENT MUSICIAN FIELDS - No videos
      const musicianFields = [
        // Personal Info (40%)
        { check: () => !!(user.firstname && user.firstname.trim()), weight: 8 },
        { check: () => !!(user.lastname && user.lastname.trim()), weight: 8 },
        { check: () => !!(user.city && user.city.trim()), weight: 8 },
        { check: () => !!(user.phone && user.phone.trim()), weight: 8 },
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
          weight: 8,
        },

        // Professional Info (60%)
        {
          check: () => !!(user.talentbio && user.talentbio.trim()),
          weight: 15,
        },
        {
          check: () => !!(user.instrument && user.instrument.trim()),
          weight: 15,
        },
        {
          check: () => !!(user.experience && user.experience.trim()),
          weight: 15,
        },
        {
          check: () => {
            if (!user.rate) return false;
            const rates = Object.values(user.rate);
            return rates.some((rate) => rate && rate.toString().trim() !== "");
          },
          weight: 15,
        },
      ];

      const totalWeight = musicianFields.reduce(
        (sum, field) => sum + field.weight,
        0,
      );
      const completedWeight = musicianFields.reduce((sum, field) => {
        return sum + (field.check() ? field.weight : 0);
      }, 0);

      return Math.round((completedWeight / totalWeight) * 100);
    }
  } else {
    // CLIENT-SPECIFIC FIELDS - No videos
    const clientFields = [
      // Personal & Contact Info (60%)
      { check: () => !!(user.firstname && user.firstname.trim()), weight: 20 },
      { check: () => !!(user.lastname && user.lastname.trim()), weight: 20 },
      { check: () => !!(user.city && user.city.trim()), weight: 10 },
      { check: () => !!(user.phone && user.phone.trim()), weight: 10 },

      // Business Info (40%)
      {
        check: () => !!(user.organization && user.organization.trim()),
        weight: 20,
      },
      {
        check: () => !!(user.talentbio && user.talentbio.trim()),
        weight: 20,
      },
    ];

    const totalWeight = clientFields.reduce(
      (sum, field) => sum + field.weight,
      0,
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
  user: UserProfile | null | undefined,
): string[] => {
  if (!user) return ["All fields"];

  const isMusician = user.isMusician;
  const isTeacher = user.roleType === "teacher";
  const isDJ = user.roleType === "dj";
  const isMC = user.roleType === "mc";
  const isVocalist = user.roleType === "vocalist";
  const isNonInstrumentMusician = isDJ || isMC || isVocalist;

  const missing: string[] = [];

  if (isMusician) {
    if (isTeacher) {
      // TEACHER MISSING FIELDS - No videos
      if (!user.firstname?.trim()) missing.push("First Name");
      if (!user.lastname?.trim()) missing.push("Last Name");
      if (!user.city?.trim()) missing.push("City");
      if (!user.phone?.trim()) missing.push("Phone");
      if (!user.date?.trim() || !user.month?.trim() || !user.year?.trim())
        missing.push("Date of Birth");
      if (!user.talentbio?.trim()) missing.push("Teaching Bio");
      if (!user.instrument?.trim()) missing.push("Instrument You Teach");
      if (!user.experience?.trim()) missing.push("Teaching Experience");

      // Teacher-specific fields
      if (!user.teacherSpecialization?.trim())
        missing.push("Teaching Specialization");
      if (!user.teachingStyle?.trim()) missing.push("Teaching Style");
      if (!user.lessonFormat?.trim()) missing.push("Lesson Format");
      if (!user.studentAgeGroup?.trim()) missing.push("Student Age Group");

      // Check if any rate is set
      const hasRates =
        user.rate &&
        Object.values(user.rate).some((rate) => rate && rate.toString().trim());
      if (!hasRates) missing.push("Teaching Rates");

      if (!user.musicianhandles?.length) missing.push("Social Media");
    } else if (isNonInstrumentMusician) {
      // DJ, MC, VOCALIST MISSING FIELDS - No videos
      if (!user.firstname?.trim()) missing.push("First Name");
      if (!user.lastname?.trim()) missing.push("Last Name");
      if (!user.city?.trim()) missing.push("City");
      if (!user.phone?.trim()) missing.push("Phone");
      if (!user.date?.trim() || !user.month?.trim() || !user.year?.trim())
        missing.push("Date of Birth");
      if (!user.talentbio?.trim()) missing.push("Bio");
      if (!user.experience?.trim()) missing.push("Experience");

      // Check if any rate is set
      const hasRates =
        user.rate &&
        Object.values(user.rate).some((rate) => rate && rate.toString().trim());
      if (!hasRates) missing.push("Performance Rates");

      if (!user.musicianhandles?.length) missing.push("Social Media");
    } else {
      // REGULAR INSTRUMENT MUSICIAN MISSING FIELDS - No videos
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

      if (!user.musicianhandles?.length) missing.push("Social Media");
    }
  } else {
    // CLIENT MISSING FIELDS
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
  senderId?: string,
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
  content?: string,
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
    chatIds: string[];
    senderIds: string[];
    // Add optional fields for different group types
    followerIds?: string[];
    viewerIds?: string[];
    gigIds?: string[];
    latestNotification?: Notification;
  };
  isGrouped: true;
}

// Type guard to check if it's a grouped notification
export function isGroupedNotification(item: any): item is GroupedNotification {
  return item && item.isGrouped === true;
}

// Type for the combined array
export type NotificationItem = Notification | GroupedNotification;

export const groupNotifications = (
  notifications: Notification[],
): NotificationItem[] => {
  const grouped: NotificationItem[] = [];
  const messageGroup: GroupedNotification = {
    _id: "message_group_all",
    type: "message_group",
    title: "New Messages",
    description: "",
    count: 0,
    notifications: [],
    latestTimestamp: 0,
    isRead: true, // Start as true, will update
    isGrouped: true,
    metadata: {
      groupedType: "messages",
      chatIds: [],
      senderIds: [],
    },
  };

  const seenNotifications = new Set<string>();

  notifications.forEach((notification) => {
    if (seenNotifications.has(notification._id)) return;
    seenNotifications.add(notification._id);

    // Handle message notifications - GROUP ALL TOGETHER
    if (notification.type === "new_message") {
      messageGroup.notifications.push(notification);
      messageGroup.count += 1;
      messageGroup.latestTimestamp = Math.max(
        messageGroup.latestTimestamp,
        notification.createdAt,
      );
      messageGroup.isRead = messageGroup.isRead && notification.isRead;

      // Collect unique chatIds
      const chatId = notification.metadata?.chatId;
      if (chatId && !messageGroup.metadata.chatIds.includes(chatId)) {
        messageGroup.metadata.chatIds.push(chatId);
      }

      // Collect unique senderIds
      const senderId = notification.metadata?.senderDocumentId;
      if (senderId && !messageGroup.metadata.senderIds.includes(senderId)) {
        messageGroup.metadata.senderIds.push(senderId);
      }

      // Update description
      if (messageGroup.count === 1) {
        messageGroup.description = "1 new message";
      } else {
        messageGroup.description = `${messageGroup.count} new messages`;
      }

      messageGroup.metadata.latestNotification = notification;
    } else {
      // For non-message notifications, handle individual grouping as before
      handleNonMessageNotification(notification, grouped);
    }
  });

  // Add message group if there are any messages
  if (messageGroup.count > 0) {
    grouped.push(messageGroup);
  }

  // Sort all items by latest timestamp
  return grouped.sort((a, b) => {
    const timeA = isGroupedNotification(a) ? a.latestTimestamp : a.createdAt;
    const timeB = isGroupedNotification(b) ? b.latestTimestamp : b.createdAt;
    return timeB - timeA;
  });
};

// Handle non-message notifications with individual grouping
const handleNonMessageNotification = (
  notification: Notification,
  grouped: NotificationItem[],
) => {
  switch (notification.type) {
    case "new_follower":
    case "follow_request":
    case "follow_accepted":
      groupFollowNotification(notification, grouped);
      break;

    case "profile_view":
      groupProfileViewNotification(notification, grouped);
      break;

    case "gig_invite":
    case "gig_application":
    case "gig_approved":
    case "gig_rejected":
    case "gig_cancelled":
    case "gig_reminder":
      groupGigNotification(notification, grouped);
      break;

    default:
      // Don't group other notification types
      grouped.push(notification);
  }
};

// Follow grouping function
const groupFollowNotification = (
  notification: Notification,
  grouped: NotificationItem[],
) => {
  const followerId =
    notification.metadata?.followerDocumentId ||
    notification.metadata?.requesterDocumentId;

  if (followerId) {
    // Find existing follow group for this user
    const existingGroup = grouped.find(
      (item) =>
        isGroupedNotification(item) &&
        item.type === "follow_group" &&
        item.metadata.followerIds?.includes(followerId),
    ) as GroupedNotification | undefined;

    if (existingGroup) {
      existingGroup.notifications.push(notification);
      existingGroup.count += 1;
      existingGroup.latestTimestamp = Math.max(
        existingGroup.latestTimestamp,
        notification.createdAt,
      );
      existingGroup.isRead = existingGroup.isRead && notification.isRead;

      existingGroup.metadata.latestNotification = notification;
    } else {
      const group: GroupedNotification = {
        _id: `follow_group_${followerId}`,
        type: "follow_group",
        title: getFollowGroupTitle(notification.type),
        description: getFollowGroupDescription(notification, 1),
        count: 1,
        notifications: [notification],
        latestTimestamp: notification.createdAt,
        isRead: notification.isRead,
        isGrouped: true,
        metadata: {
          groupedType: "follows",
          chatIds: [],
          senderIds: [],
          followerIds: [followerId],
          latestNotification: notification,
        },
      };
      grouped.push(group);
    }
  } else {
    grouped.push(notification);
  }
};

// Profile view grouping function
const groupProfileViewNotification = (
  notification: Notification,
  grouped: NotificationItem[],
) => {
  const viewerId = notification.metadata?.viewerDocumentId;

  if (viewerId) {
    // Find existing profile view group for this user
    const existingGroup = grouped.find(
      (item) =>
        isGroupedNotification(item) &&
        item.type === "profile_view_group" &&
        item.metadata.viewerIds?.includes(viewerId),
    ) as GroupedNotification | undefined;

    if (existingGroup) {
      existingGroup.notifications.push(notification);
      existingGroup.count += 1;
      existingGroup.latestTimestamp = Math.max(
        existingGroup.latestTimestamp,
        notification.createdAt,
      );
      existingGroup.isRead = existingGroup.isRead && notification.isRead;

      existingGroup.description = `${existingGroup.count} profile views from this user`;
      existingGroup.metadata.latestNotification = notification;
    } else {
      const group: GroupedNotification = {
        _id: `profile_view_group_${viewerId}`,
        type: "profile_view_group",
        title: "Profile View",
        description: "1 profile view",
        count: 1,
        notifications: [notification],
        latestTimestamp: notification.createdAt,
        isRead: notification.isRead,
        isGrouped: true,
        metadata: {
          groupedType: "profile_views",
          chatIds: [],
          senderIds: [],
          viewerIds: [viewerId],
          latestNotification: notification,
        },
      };
      grouped.push(group);
    }
  } else {
    grouped.push(notification);
  }
};

// Gig grouping function
const groupGigNotification = (
  notification: Notification,
  grouped: NotificationItem[],
) => {
  const gigId = notification.metadata?.gigId || notification.relatedGigId;

  if (gigId) {
    // Find existing gig group for this gig
    const existingGroup = grouped.find(
      (item) =>
        isGroupedNotification(item) &&
        item.type === "gig_group" &&
        item.metadata.gigIds?.includes(gigId),
    ) as GroupedNotification | undefined;

    if (existingGroup) {
      existingGroup.notifications.push(notification);
      existingGroup.count += 1;
      existingGroup.latestTimestamp = Math.max(
        existingGroup.latestTimestamp,
        notification.createdAt,
      );
      existingGroup.isRead = existingGroup.isRead && notification.isRead;

      existingGroup.title = "Gig Activities";
      existingGroup.description = `${existingGroup.count} updates for this gig`;
      existingGroup.metadata.latestNotification = notification;
    } else {
      const group: GroupedNotification = {
        _id: `gig_group_${gigId}`,
        type: "gig_group",
        title: getGigGroupTitle(notification.type),
        description: "1 gig update",
        count: 1,
        notifications: [notification],
        latestTimestamp: notification.createdAt,
        isRead: notification.isRead,
        isGrouped: true,
        metadata: {
          groupedType: "gigs",
          chatIds: [],
          senderIds: [],
          gigIds: [gigId],
          latestNotification: notification,
        },
      };
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
  count: number,
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

// utils/rateUtils.ts - Rate calculation utilities

export interface RateInfo {
  amount: string;
  currency: string;
  rateType: string;
  displayRate: string;
  category?: string;
  negotiable?: boolean;
  depositRequired?: boolean;
  travelIncluded?: boolean;
  travelFee?: string;
}

export interface MusicianRate {
  baseRate?: string;
  rateType?:
    | "hourly"
    | "daily"
    | "per_session"
    | "per_gig"
    | "monthly"
    | "custom";
  currency?: string;
  categories?: Array<{
    name: string;
    rate: string;
    rateType?: string;
    description?: string;
  }>;
  negotiable?: boolean;
  depositRequired?: boolean;
  travelIncluded?: boolean;
  travelFee?: string;
}

// Gig type to category mapping
const GIG_TYPE_CATEGORY_MAPPING: Record<GigType, string> = {
  wedding: "wedding",
  corporate: "corporate",
  "private-party": "private-party",
  concert: "concert",
  restaurant: "restaurant",
  church: "church",
  festival: "festival",
  club: "club",
  recording: "recording",
  "music-lessons": "music-lessons",
  individual: "individual",
  other: "other",
};

// Helper to format rate type for display
export const formatRateType = (rateType?: string): string => {
  if (!rateType) return "gig";

  const typeMap: Record<string, string> = {
    hourly: "hour",
    daily: "day",
    per_session: "session",
    per_gig: "gig",
    monthly: "month",
    custom: "custom",
  };

  return typeMap[rateType] || rateType.replace("per_", "");
};

// Main function to get rate for specific gig type
export const getRateForGigType = (
  rate: MusicianRate | null | undefined,
  gigType: GigType,
  musicianRole?: string,
): RateInfo | null => {
  if (!rate) {
    return null;
  }

  const category = GIG_TYPE_CATEGORY_MAPPING[gigType] || "other";

  // Try to find rate in categories first
  if (rate.categories && rate.categories.length > 0) {
    // Look for exact category match
    let categoryRate = rate.categories.find(
      (cat) => cat.name.toLowerCase() === category.toLowerCase(),
    );

    // If no exact match, try role-based matching for some gig types
    if (!categoryRate && musicianRole) {
      categoryRate = rate.categories.find(
        (cat) => cat.name.toLowerCase() === musicianRole.toLowerCase(),
      );
    }

    // If still no match, use the first available category
    if (!categoryRate) {
      categoryRate = rate.categories.find((cat) => cat.rate?.trim());
    }

    if (categoryRate && categoryRate.rate?.trim()) {
      const effectiveRateType = categoryRate.rateType || rate.rateType;
      const formattedType = formatRateType(effectiveRateType);

      return {
        amount: categoryRate.rate,
        currency: rate.currency || "KES",
        rateType: effectiveRateType || "per_gig",
        displayRate: `${rate.currency || "KES"} ${categoryRate.rate} per ${formattedType}`,
        category: categoryRate.name,
        negotiable: rate.negotiable,
        depositRequired: rate.depositRequired,
        travelIncluded: rate.travelIncluded,
        travelFee: rate.travelFee,
      };
    }
  }

  // Fallback to base rate
  if (rate.baseRate?.trim()) {
    const formattedType = formatRateType(rate.rateType);

    return {
      amount: rate.baseRate,
      currency: rate.currency || "KES",
      rateType: rate.rateType || "per_gig",
      displayRate: `${rate.currency || "KES"} ${rate.baseRate} per ${formattedType}`,
      negotiable: rate.negotiable,
      depositRequired: rate.depositRequired,
      travelIncluded: rate.travelIncluded,
      travelFee: rate.travelFee,
    };
  }

  return null;
};

// Helper function to get display rate from categories (for general display)
export const getDisplayRate = (
  rate: MusicianRate | null | undefined,
  musicianRole?: string,
): string => {
  if (!rate) return "Contact for rates";

  // Try to get a rate for a common gig type based on role
  let suggestedGigType: GigType = "other";

  if (musicianRole) {
    const roleGigMapping: Record<string, GigType> = {
      dj: "club",
      mc: "private-party",
      vocalist: "concert",
      teacher: "music-lessons",
      instrumentalist: "concert",
    };
    suggestedGigType = roleGigMapping[musicianRole.toLowerCase()] || "other";
  }

  const rateInfo = getRateForGigType(rate, suggestedGigType, musicianRole);

  if (rateInfo) {
    return rateInfo.displayRate;
  }

  // Fallback: use categories or base rate
  if (rate.categories && rate.categories.length > 0) {
    const categoryWithRate = rate.categories.find((cat) => cat.rate?.trim());
    if (categoryWithRate) {
      const rateType = categoryWithRate.rateType || rate.rateType;
      const formattedType = formatRateType(rateType);
      return `${rate.currency || "KES"} ${categoryWithRate.rate} per ${formattedType}`;
    }
  }

  if (rate.baseRate?.trim()) {
    const formattedType = formatRateType(rate.rateType);
    return `${rate.currency || "KES"} ${rate.baseRate} per ${formattedType}`;
  }

  return "Contact for rates";
};

// Function to get all available rates for a musician
export const getAllRates = (
  rate: MusicianRate | null | undefined,
): RateInfo[] => {
  if (!rate) return [];

  const rates: RateInfo[] = [];

  // Add rates from categories
  if (rate.categories) {
    rate.categories.forEach((category) => {
      if (category.rate?.trim()) {
        const rateType = category.rateType || rate.rateType;
        const formattedType = formatRateType(rateType);

        rates.push({
          amount: category.rate,
          currency: rate.currency || "KES",
          rateType: rateType || "per_gig",
          displayRate: `${rate.currency || "KES"} ${category.rate} per ${formattedType}`,
          category: category.name,
          negotiable: rate.negotiable,
          depositRequired: rate.depositRequired,
          travelIncluded: rate.travelIncluded,
          travelFee: rate.travelFee,
        });
      }
    });
  }

  // Add base rate if no categories or as fallback
  if (rates.length === 0 && rate.baseRate?.trim()) {
    const formattedType = formatRateType(rate.rateType);

    rates.push({
      amount: rate.baseRate,
      currency: rate.currency || "KES",
      rateType: rate.rateType || "per_gig",
      displayRate: `${rate.currency || "KES"} ${rate.baseRate} per ${formattedType}`,
      negotiable: rate.negotiable,
      depositRequired: rate.depositRequired,
      travelIncluded: rate.travelIncluded,
      travelFee: rate.travelFee,
    });
  }

  return rates;
};

// Function to check if musician has rate for specific gig type
export const hasRateForGigType = (
  rate: MusicianRate | null | undefined,
  gigType: GigType,
): boolean => {
  return getRateForGigType(rate, gigType) !== null;
};

// Function to get the best matching rate (for search/filtering)
export const getBestMatchingRate = (
  rate: MusicianRate | null | undefined,
  preferredGigTypes: GigType[] = [],
): RateInfo | null => {
  if (!rate) return null;

  // Try preferred gig types in order
  for (const gigType of preferredGigTypes) {
    const rateInfo = getRateForGigType(rate, gigType);
    if (rateInfo) {
      return rateInfo;
    }
  }

  // Fallback to any available rate
  const allRates = getAllRates(rate);
  return allRates.length > 0 ? allRates[0] : null;
};
// utils/index.ts or utils/colors-fonts.ts
export const colors = [
  // Black & White Shades
  "#000000", // Black
  "#0A0A0A", // Rich Black
  "#1A1A1A", // Eerie Black
  "#2C2C2C", // Jet
  "#404040", // Onyx
  "#FFFFFF", // White
  "#F8F9FA", // Cultured
  "#E9ECEF", // Anti-flash White
  "#DEE2E6", // Platinum
  "#CED4DA", // French Gray

  // Red Shades
  "#FF3B30", // Red (iOS)
  "#DC2626", // Red 600
  "#B91C1C", // Red 700
  "#991B1B", // Red 800
  "#7F1D1D", // Red 900
  "#EF4444", // Tailwind Red 500
  "#FCA5A5", // Tailwind Red 300
  "#FECACA", // Tailwind Red 200
  "#FEE2E2", // Tailwind Red 100
  "#DC143C", // Crimson

  // Orange Shades
  "#FF9500", // Orange (iOS)
  "#EA580C", // Tailwind Orange 600
  "#C2410C", // Tailwind Orange 700
  "#9A3412", // Tailwind Orange 800
  "#7C2D12", // Tailwind Orange 900
  "#FF8C00", // Dark Orange
  "#FFA500", // Web Orange
  "#FFB347", // Light Orange
  "#FF7F50", // Coral
  "#FF6347", // Tomato

  // Yellow Shades
  "#FFCC00", // Yellow (iOS)
  "#EAB308", // Tailwind Yellow 500
  "#CA8A04", // Tailwind Yellow 600
  "#A16207", // Tailwind Yellow 700
  "#854D0E", // Tailwind Yellow 800
  "#713F12", // Tailwind Yellow 900
  "#FFD700", // Gold
  "#FFEC19", // Cadmium Yellow
  "#FFEA00", // Safety Yellow
  "#FFC107", // Amber

  // Green Shades
  "#4CD964", // Green (iOS)
  "#22C55E", // Tailwind Green 500
  "#16A34A", // Tailwind Green 600
  "#15803D", // Tailwind Green 700
  "#166534", // Tailwind Green 800
  "#14532D", // Tailwind Green 900
  "#32CD32", // Lime Green
  "#2E8B57", // Sea Green
  "#228B22", // Forest Green
  "#006400", // Dark Green

  // Blue Shades
  "#5AC8FA", // Blue (iOS)
  "#007AFF", // Primary Blue (iOS)
  "#0EA5E9", // Tailwind Sky 500
  "#0284C7", // Tailwind Sky 600
  "#0369A1", // Tailwind Sky 700
  "#075985", // Tailwind Sky 800
  "#0C4A6E", // Tailwind Sky 900
  "#1E90FF", // Dodger Blue
  "#4682B4", // Steel Blue
  "#4169E1", // Royal Blue

  // Purple Shades
  "#5856D6", // Purple (iOS)
  "#8B5CF6", // Tailwind Violet 500
  "#7C3AED", // Tailwind Violet 600
  "#6D28D9", // Tailwind Violet 700
  "#5B21B6", // Tailwind Violet 800
  "#4C1D95", // Tailwind Violet 900
  "#9370DB", // Medium Purple
  "#6A5ACD", // Slate Blue
  "#9932CC", // Dark Orchid
  "#9400D3", // Dark Violet

  // Pink Shades
  "#FF2D55", // Pink (iOS)
  "#EC4899", // Tailwind Pink 500
  "#DB2777", // Tailwind Pink 600
  "#BE185D", // Tailwind Pink 700
  "#9D174D", // Tailwind Pink 800
  "#831843", // Tailwind Pink 900
  "#FF69B4", // Hot Pink
  "#FF1493", // Deep Pink
  "#C71585", // Medium Violet Red
  "#DB7093", // Pale Violet Red

  // Brown Shades
  "#8B4513", // Saddle Brown
  "#A0522D", // Sienna
  "#D2691E", // Chocolate
  "#CD853F", // Peru
  "#BC8F8F", // Rosy Brown
  "#8B7355", // Burly Wood
  "#654321", // Dark Brown
  "#5C4033", // Very Dark Brown
  "#A0522D", // Sienna
  "#6F4E37", // Coffee

  // Teal & Cyan Shades
  "#20B2AA", // Light Sea Green
  "#00CED1", // Dark Turquoise
  "#48D1CC", // Medium Turquoise
  "#40E0D0", // Turquoise
  "#00FFFF", // Cyan
  "#00BFFF", // Deep Sky Blue
  "#5F9EA0", // Cadet Blue
  "#4682B4", // Steel Blue
  "#008080", // Teal
  "#008B8B", // Dark Cyan

  // Gold & Metallic Shades
  "#DAA520", // Golden Rod
  "#FFD700", // Gold
  "#F0E68C", // Khaki
  "#EEE8AA", // Pale Golden Rod
  "#B8860B", // Dark Golden Rod
  "#CD853F", // Peru
  "#DAA520", // Golden Rod
  "#BDB76B", // Dark Khaki
  "#F4A460", // Sandy Brown
  "#DEB887", // Burly Wood

  // Pastel Shades
  "#FFB6C1", // Light Pink
  "#FFDAB9", // Peach Puff
  "#E6E6FA", // Lavender
  "#D8BFD8", // Thistle
  "#B0E0E6", // Powder Blue
  "#AFEEEE", // Pale Turquoise
  "#98FB98", // Pale Green
  "#FFFACD", // Lemon Chiffon
  "#FFE4E1", // Misty Rose
  "#F5F5DC", // Beige

  // Dark & Rich Colors
  "#2F4F4F", // Dark Slate Gray
  "#696969", // Dim Gray
  "#808080", // Gray
  "#A9A9A9", // Dark Gray
  "#C0C0C0", // Silver
  "#800000", // Maroon
  "#8B0000", // Dark Red
  "#483D8B", // Dark Slate Blue
  "#2E8B57", // Sea Green
  "#556B2F", // Dark Olive Green

  // Vibrant Modern Colors
  "#00FF7F", // Spring Green
  "#7FFF00", // Chartreuse
  "#FF00FF", // Magenta
  "#FF4500", // Orange Red
  "#DA70D6", // Orchid
  "#BA55D3", // Medium Orchid
  "#9370DB", // Medium Purple
  "#8A2BE2", // Blue Violet
  "#4B0082", // Indigo
  "#2E8B57", // Sea Green
];

export const fonts = [
  "Arial, sans-serif",
  "Helvetica, sans-serif",
  "Times New Roman, serif",
  "Georgia, serif",
  "Verdana, sans-serif",
  "Tahoma, sans-serif",
  "Trebuchet MS, sans-serif",
  "Impact, sans-serif",
  "Comic Sans MS, cursive",
  "Courier New, monospace",
  "Lucida Console, monospace",
  "Palatino Linotype, serif",
  "Garamond, serif",
  "Bookman Old Style, serif",
  "Arial Black, sans-serif",
  "Brush Script MT, cursive",
  "Lucida Handwriting, cursive",
  "Copperplate, fantasy",
  "Papyrus, fantasy",
  "Rockwell, serif",
  "Didot, serif",
  "Optima, sans-serif",
  "Futura, sans-serif",
  "Baskerville, serif",
  "Bodoni MT, serif",
  "Franklin Gothic Medium, sans-serif",
  "Gill Sans, sans-serif",
  "Segoe UI, sans-serif",
  "Calibri, sans-serif",
  "Candara, sans-serif",
  // Modern Fonts
  "Inter, sans-serif",
  "Poppins, sans-serif",
  "Roboto, sans-serif",
  "Montserrat, sans-serif",
  "Open Sans, sans-serif",
  "Lato, sans-serif",
  "Raleway, sans-serif",
  "Nunito, sans-serif",
  "Source Sans Pro, sans-serif",
  "Ubuntu, sans-serif",
  // Serif Modern
  "Playfair Display, serif",
  "Merriweather, serif",
  "Libre Baskerville, serif",
  "Crimson Text, serif",
  "Source Serif Pro, serif",
  // Monospace Modern
  "Roboto Mono, monospace",
  "Source Code Pro, monospace",
  "Fira Code, monospace",
  "Cascadia Code, monospace",
  "JetBrains Mono, monospace",
  // Display Fonts
  "Oswald, sans-serif",
  "Anton, sans-serif",
  "Bebas Neue, sans-serif",
  "Lobster, cursive",
  "Pacifico, cursive",
  "Dancing Script, cursive",
  "Great Vibes, cursive",
  "Parisienne, cursive",
  "Sacramento, cursive",
  "Shadows Into Light, cursive",
];

// You can also create utility functions for handling colors
export const colorUtils = {
  // Convert hex to RGB
  hexToRgb: (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  },

  // Check if color is light (for determining text color)
  isLightColor: (color: string): boolean => {
    const { r, g, b } = colorUtils.hexToRgb(color);
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  },

  // Get contrasting text color (black or white)
  getContrastColor: (backgroundColor: string): string => {
    return colorUtils.isLightColor(backgroundColor) ? "#000000" : "#FFFFFF";
  },

  // Generate random color from the palette
  getRandomColor: (): string => {
    return colors[Math.floor(Math.random() * colors.length)];
  },

  // Generate gradient colors
  generateGradient: (
    color1: string,
    color2: string,
    angle: number = 45,
  ): string => {
    return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
  },

  // Darken a color
  darkenColor: (color: string, percent: number): string => {
    const { r, g, b } = colorUtils.hexToRgb(color);
    const darken = (value: number) =>
      Math.max(0, Math.floor(value * (1 - percent / 100)));
    return `#${darken(r).toString(16).padStart(2, "0")}${darken(g)
      .toString(16)
      .padStart(2, "0")}${darken(b).toString(16).padStart(2, "0")}`;
  },

  // Lighten a color
  lightenColor: (color: string, percent: number): string => {
    const { r, g, b } = colorUtils.hexToRgb(color);
    const lighten = (value: number) =>
      Math.min(255, Math.floor(value * (1 + percent / 100)));
    return `#${lighten(r).toString(16).padStart(2, "0")}${lighten(g)
      .toString(16)
      .padStart(2, "0")}${lighten(b).toString(16).padStart(2, "0")}`;
  },
};

// Font utility functions
export const fontUtils = {
  // Get random font
  getRandomFont: (): string => {
    return fonts[Math.floor(Math.random() * fonts.length)];
  },

  // Get font family name (remove fallbacks)
  getFontName: (font: string): string => {
    return font.split(",")[0];
  },

  // Check if font is serif
  isSerif: (font: string): boolean => {
    const serifFonts = [
      "serif",
      "Times",
      "Georgia",
      "Palatino",
      "Garamond",
      "Bookman",
      "Baskerville",
      "Bodoni",
    ];
    return serifFonts.some((serif) =>
      font.toLowerCase().includes(serif.toLowerCase()),
    );
  },

  // Check if font is sans-serif
  isSansSerif: (font: string): boolean => {
    const sansSerifFonts = [
      "sans-serif",
      "Arial",
      "Helvetica",
      "Verdana",
      "Tahoma",
      "Trebuchet",
      "Impact",
      "Segoe",
      "Calibri",
    ];
    return sansSerifFonts.some((sans) =>
      font.toLowerCase().includes(sans.toLowerCase()),
    );
  },

  // Check if font is monospace
  isMonospace: (font: string): boolean => {
    const monoFonts = ["monospace", "Courier", "Lucida Console"];
    return monoFonts.some((mono) =>
      font.toLowerCase().includes(mono.toLowerCase()),
    );
  },

  // Check if font is cursive/script
  isCursive: (font: string): boolean => {
    const cursiveFonts = ["cursive", "Comic", "Brush", "Lucida Handwriting"];
    return cursiveFonts.some((cursive) =>
      font.toLowerCase().includes(cursive.toLowerCase()),
    );
  },
};

// Preset combinations for quick selection
export const presets = {
  // Professional presets
  professional: {
    font: "Arial, sans-serif",
    fontColor: "#000000",
    backgroundColor: "#FFFFFF",
  },
  elegant: {
    font: "Garamond, serif",
    fontColor: "#333333",
    backgroundColor: "#F8F8F8",
  },
  modern: {
    font: "Helvetica, sans-serif",
    fontColor: "#FFFFFF",
    backgroundColor: "#007AFF",
  },

  // Creative presets
  vibrant: {
    font: "Comic Sans MS, cursive",
    fontColor: "#FFFFFF",
    backgroundColor: "#FF2D55",
  },
  artistic: {
    font: "Brush Script MT, cursive",
    fontColor: "#8B4513",
    backgroundColor: "#FFCC00",
  },
  retro: {
    font: "Courier New, monospace",
    fontColor: "#FF9500",
    backgroundColor: "#000000",
  },

  // Minimalist presets
  minimalist: {
    font: "Calibri, sans-serif",
    fontColor: "#5856D6",
    backgroundColor: "#FFFFFF",
  },
  clean: {
    font: "Segoe UI, sans-serif",
    fontColor: "#2E8B57",
    backgroundColor: "#F5F5F5",
  },

  // Dark mode presets
  darkElegant: {
    font: "Times New Roman, serif",
    fontColor: "#FFFFFF",
    backgroundColor: "#1A1A1A",
  },
  darkModern: {
    font: "Arial Black, sans-serif",
    fontColor: "#32CD32",
    backgroundColor: "#000000",
  },
};

// Default export
export default {
  colors,
  fonts,
  colorUtils,
  fontUtils,
  presets,
};

export const prepareGigDataForConvex = (
  formValues: LocalGigInputs,
  userId: Id<"users">,
  gigcustom: CustomProps,
  imageUrl: string,
  schedulingProcedure: any,
  bandRoles: BandRoleInput[],
  durationFrom?: string,
  durationTo?: string,
) => {
  // 1. VALIDATE REQUIRED FIELDS FIRST
  if (!formValues.bussinesscat) {
    throw new Error("Business category is required");
  }
  if (!formValues.title?.trim()) {
    throw new Error("Title is required");
  }
  if (!formValues.secret?.trim() || formValues.secret.length < 4) {
    throw new Error("Secret passphrase is required (minimum 4 characters)");
  }
  if (!userId) {
    throw new Error("User ID is required");
  }

  // 2. FIX LOGO - NEVER PASS EMPTY STRING
  const logoUrl = imageUrl?.trim() ? imageUrl : "/default-gig-logo.png";

  // 3. FIX DATE HANDLING - ENSURE IT'S A TIMESTAMP
  let scheduleDate: number;
  let publishType: string;

  if (!schedulingProcedure || !schedulingProcedure.type) {
    publishType = "create";
    scheduleDate = Date.now();
  } else {
    publishType = schedulingProcedure.type;

    if (schedulingProcedure.type === "automatic" && schedulingProcedure.date) {
      try {
        const dateObj =
          schedulingProcedure.date instanceof Date
            ? schedulingProcedure.date
            : new Date(schedulingProcedure.date);

        scheduleDate = dateObj.getTime();

        // Validate it's a valid date
        if (isNaN(scheduleDate) || scheduleDate <= Date.now()) {
          console.warn("Invalid schedule date, using current time");
          scheduleDate = Date.now();
        }
      } catch (error) {
        console.warn("Error parsing schedule date, using current time:", error);
        scheduleDate = Date.now();
      }
    } else {
      scheduleDate = Date.now();
    }
  }

  // 4. FIX TIME OBJECT - MUST HAVE ALL REQUIRED PROPERTIES
  const time = {
    start: formValues.start?.trim() || "19:00",
    end: formValues.end?.trim() || "22:00",
    durationFrom: durationFrom || formValues.durationfrom || "pm",
    durationTo: durationTo || formValues.durationto || "pm",
  };

  // 5. CALCULATE TOTAL SLOTS
  let totalSlots = 1;
  if (formValues.bussinesscat === "full") {
    totalSlots = formValues.maxSlots || 5;
  } else if (formValues.bussinesscat === "other") {
    totalSlots = bandRoles.reduce((sum, role) => sum + role.maxSlots, 0) || 1;
  } else if (formValues.bussinesscat === "personal") {
    totalSlots = formValues.maxSlots || 1;
  }

  // 6. PROCESS INTEREST WINDOW - FIXED VERSION
  let acceptInterestStartTime: number | undefined;
  let acceptInterestEndTime: number | undefined;

  console.log("=== DEBUG: Processing interest window ===");
  console.log("Form values:", {
    enableInterestWindow: formValues.enableInterestWindow,
    startTime: formValues.acceptInterestStartTime,
    endTime: formValues.acceptInterestEndTime,
    days: formValues.interestWindowDays,
  });

  if (formValues.enableInterestWindow) {
    // Convert string dates to timestamps
    if (formValues.acceptInterestStartTime) {
      try {
        // The datetime-local input gives format: "YYYY-MM-DDTHH:MM"
        const startDate = new Date(formValues.acceptInterestStartTime);

        if (isNaN(startDate.getTime())) {
          console.warn(
            "Invalid start date string:",
            formValues.acceptInterestStartTime,
          );
        } else {
          acceptInterestStartTime = startDate.getTime();
          console.log(
            "Start time converted:",
            acceptInterestStartTime,
            "(",
            new Date(acceptInterestStartTime).toISOString(),
            ")",
          );
        }
      } catch (error) {
        console.warn("Error parsing acceptInterestStartTime:", error);
      }
    }

    if (formValues.acceptInterestEndTime) {
      try {
        const endDate = new Date(formValues.acceptInterestEndTime);
        if (isNaN(endDate.getTime())) {
          console.warn(
            "Invalid end date string:",
            formValues.acceptInterestEndTime,
          );
        } else {
          acceptInterestEndTime = endDate.getTime();
          console.log(
            "End time converted:",
            acceptInterestEndTime,
            "(",
            new Date(acceptInterestEndTime).toISOString(),
            ")",
          );
        }
      } catch (error) {
        console.warn("Error parsing acceptInterestEndTime:", error);
      }
    }

    // If using days window instead of specific dates
    if (formValues.interestWindowDays && !acceptInterestEndTime) {
      const startTime = acceptInterestStartTime || Date.now();
      acceptInterestEndTime =
        startTime + formValues.interestWindowDays * 24 * 60 * 60 * 1000;
      console.log("Calculated end time from days:", acceptInterestEndTime);
    }

    // Validate window is sensible
    if (acceptInterestStartTime && acceptInterestEndTime) {
      if (acceptInterestEndTime <= acceptInterestStartTime) {
        console.warn(
          "Invalid interest window: end time must be after start time",
        );
        acceptInterestStartTime = undefined;
        acceptInterestEndTime = undefined;
      }
    }
  }

  // 7. BUILD BAND CATEGORY
  const bandCategory =
    formValues.bussinesscat === "other"
      ? bandRoles.map((role) => ({
          role: role.role,
          maxSlots: role.maxSlots,
          filledSlots: 0,
          applicants: [],
          bookedUsers: [],
          requiredSkills: role.requiredSkills || [],
          description: role.description || "",
          price: role.price || undefined,
          currency: role.currency || formValues.currency || "KES",
          negotiable: role.negotiable ?? formValues.negotiable ?? false,
          maxApplicants: role.maxApplicants || 20,
          currentApplicants: 0,
          isLocked: false,
        }))
      : [];

  // 8. BUILD THE FINAL DATA OBJECT
  const result = {
    // 🔴 REQUIRED FIELDS (Convex checks these)
    postedBy: userId,
    title: formValues.title.trim(),
    secret: formValues.secret.trim(), // Must be non-empty
    bussinesscat: formValues.bussinesscat,
    date: scheduleDate, // Must be number timestamp
    time: time, // Must have start, end, durationFrom, durationTo
    logo: logoUrl, // Must be non-empty string

    // Optional fields with defaults
    description: formValues.description?.trim() || "",
    phone: formValues.phoneNo?.trim() || "", // Note: Convex expects 'phone' not 'phoneNo'
    phoneNo: formValues.phoneNo?.trim() || "", // For compatibility
    price: parseFloat(formValues.price) || 0,
    category: formValues.category?.trim() || "",
    location: formValues.location?.trim() || "",
    font: gigcustom.font?.trim() || "Arial, sans-serif",
    fontColor: gigcustom.fontColor?.trim() || "#000000",
    backgroundColor: gigcustom.backgroundColor?.trim() || "#FFFFFF",
    gigtimeline: formValues.gigtimeline?.trim() || "",
    otherTimeline: formValues.otherTimeline?.trim() || "",
    day: formValues.day?.trim() || "",

    // Talent-specific fields
    mcType: formValues.mcType?.trim() || "",
    mcLanguages: formValues.mcLanguages?.trim() || "",
    djGenre: formValues.djGenre?.trim() || "",
    djEquipment: formValues.djEquipment?.trim() || "",
    vocalistGenre: formValues.vocalistGenre || [],

    // Other fields
    pricerange: formValues.pricerange?.trim() || "",
    currency: formValues.currency?.trim() || "KES",
    scheduleDate: scheduleDate,
    schedulingProcedure: publishType,

    // 🔴 CRITICAL FIX: INTEREST WINDOW FIELDS
    ...(acceptInterestStartTime && { acceptInterestStartTime }),
    ...(acceptInterestEndTime && { acceptInterestEndTime }),

    // Band setup
    isClientBand: formValues.bussinesscat === "other",
    maxSlots: formValues.maxSlots || totalSlots,
    bandCategory: bandCategory,

    // Negotiable
    negotiable: formValues.negotiable || false,

    // Duration fields (for Convex schema)
    durationFrom: durationFrom || formValues.durationfrom || "pm",
    durationTo: durationTo || formValues.durationto || "pm",
  };

  console.log("=== DEBUG: Final prepared data ===");
  console.log("Interest window fields:", {
    hasStartTime: !!result.acceptInterestStartTime,
    hasEndTime: !!result.acceptInterestEndTime,
    startTime: result.acceptInterestStartTime
      ? new Date(result.acceptInterestStartTime).toISOString()
      : "undefined",
    endTime: result.acceptInterestEndTime
      ? new Date(result.acceptInterestEndTime).toISOString()
      : "undefined",
  });

  return result;
};

// Function to format gig price for display
export const formatGigPrice = (
  price: number,
  currency: string = "KES",
): string => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return formatter.format(price);
};

// Function to format date for display
export const formatGigDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Function to get gig status badge color
export const getGigStatusColor = (status: {
  isTaken: boolean;
  isPending: boolean;
  isActive: boolean;
}): string => {
  if (status.isTaken)
    return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
  if (status.isPending)
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
  if (!status.isActive)
    return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
  return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
};

// Function to get talent type icon
export const getTalentTypeIcon = (type: string): string => {
  switch (type) {
    case "mc":
      return "🎤";
    case "dj":
      return "🎧";
    case "vocalist":
      return "🎵";
    case "personal":
      return "👤";
    case "full":
      return "🎸";
    case "other":
      return "🎭";
    default:
      return "🎶";
  }
};

// Function to validate gig form
export const validateGigForm = (
  formData: GigFormInputs,
  bussinesscat: string | null,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (formData) {
    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }

    if (formData?.description && !formData?.description.trim()) {
      errors.description = "Description is required";
    }

    if (formData?.location && !formData?.location.trim()) {
      errors.location = "Location is required";
    }

    if (!bussinesscat) {
      errors.bussinesscat = "Please select a business category";
    }

    if (formData?.phone && !formData.phone.trim()) {
      errors.phoneNo = "Phone number is required";
    }

    // Validate talent-specific fields
    if (bussinesscat === "mc") {
      if (!formData.mcType?.trim()) {
        errors.mcType = "MC type is required";
      }
      if (!formData.mcLanguages?.trim()) {
        errors.mcLanguages = "Languages are required";
      }
    } else if (bussinesscat === "dj") {
      if (!formData.djGenre?.trim()) {
        errors.djGenre = "DJ genre is required";
      }
      if (!formData.djEquipment?.trim()) {
        errors.djEquipment = "DJ equipment is required";
      }
    } else if (bussinesscat === "vocalist") {
      if (!formData.vocalistGenre?.length) {
        errors.vocalistGenre = "At least one genre is required";
      }
    }
  }

  return errors;
};
// utils/gigLimits.ts or add to your existing utils
// Add this helper function at the top of your createGig mutation file
export const checkGigLimit = (user: any, isInGracePeriod: boolean) => {
  const userTier = user?.tier?.toLowerCase() || "free";
  const trustScore = user?.trustScore || 0;

  // Get current week start (Monday)
  const now = new Date();
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
  currentWeekStart.setHours(0, 0, 0, 0);

  const weekStartTimestamp = currentWeekStart.getTime();

  // Get weekly gigs posted - CORRECT FIELD NAME
  const gigsThisWeek = user?.gigsPostedThisWeek || { count: 0, weekStart: 0 };
  const weeklyGigsPosted =
    gigsThisWeek.weekStart === weekStartTimestamp ? gigsThisWeek.count : 0;

  // Check if grace period (26 days from account creation)
  const accountAge = Date.now() - (user._creationTime || Date.now());
  const isGracePeriod =
    isInGracePeriod || accountAge <= 26 * 24 * 60 * 60 * 1000; // 26 days in ms

  let canPost = true;
  let errorMessage = "";
  let weeklyLimit = 0;

  if (userTier === "free") {
    if (isGracePeriod) {
      // Grace period: 3 gigs PER WEEK (same as Pro with trust score >= 40)
      weeklyLimit = 3;
      if (weeklyGigsPosted >= 3) {
        canPost = false;
        errorMessage =
          "Grace period users are limited to 3 gigs per week. You've reached your weekly limit.";
      }
    } else {
      // Post-grace period free users: 0 gigs
      canPost = false;
      errorMessage =
        "Your grace period has ended. Upgrade to continue posting gigs.";
    }
  } else if (userTier === "pro") {
    if (trustScore >= 40) {
      // Pro with trust score >= 40: 3 gigs per week
      weeklyLimit = 3;
      if (weeklyGigsPosted >= 3) {
        canPost = false;
        errorMessage =
          "Pro users are limited to 3 gigs per week. You've reached your weekly limit.";
      }
    } else {
      // Pro with low trust score: 1 gig per week
      weeklyLimit = 1;
      if (weeklyGigsPosted >= 1) {
        canPost = false;
        errorMessage =
          "Pro users with trust score below 40 are limited to 1 gig per week.";
      }
    }
  } else if (userTier === "premium" || userTier === "elite") {
    if (trustScore >= 40) {
      // Premium/Elite with trust score >= 40: 5 gigs per week
      weeklyLimit = 5;
      if (weeklyGigsPosted >= 5) {
        canPost = false;
        errorMessage =
          "Premium/Elite users are limited to 5 gigs per week. You've reached your weekly limit.";
      }
    } else {
      // Premium/Elite with low trust score: 2 gigs per week
      weeklyLimit = 2;
      if (weeklyGigsPosted >= 2) {
        canPost = false;
        errorMessage =
          "Premium/Elite users with trust score below 40 are limited to 2 gigs per week.";
      }
    }
  }

  return {
    canPost,
    errorMessage,
    weeklyLimit,
    weeklyGigsPosted,
    isGracePeriod,
    userTier,
    trustScore,
  };
};

export const updateWeeklyGigCount = (currentWeeklyData: any) => {
  // Get current week start (Monday)
  const now = new Date();
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
  currentWeekStart.setHours(0, 0, 0, 0);

  const weekStartTimestamp = currentWeekStart.getTime();
  const currentGigsThisWeek = currentWeeklyData || { count: 0, weekStart: 0 };

  // Reset if new week
  if (currentGigsThisWeek.weekStart !== weekStartTimestamp) {
    return {
      count: 1,
      weekStart: weekStartTimestamp,
    };
  }

  // Increment if same week
  return {
    count: currentGigsThisWeek.count + 1,
    weekStart: weekStartTimestamp,
  };
};
// Create or update this function

export const getInterestWindowStatus = (gig: {
  acceptInterestStartTime?: string | number | Date;
  acceptInterestEndTime?: string | number | Date;
}) => {
  if (!gig.acceptInterestStartTime && !gig.acceptInterestEndTime) {
    return {
      hasWindow: false,
      status: "always_open",
      message: "Always Open",
    };
  }

  const now = Date.now();
  let startTime = 0;
  let endTime = 0;

  // Parse start time
  if (gig.acceptInterestStartTime) {
    startTime =
      typeof gig.acceptInterestStartTime === "number"
        ? gig.acceptInterestStartTime
        : new Date(gig.acceptInterestStartTime).getTime();
  }

  // Parse end time
  if (gig.acceptInterestEndTime) {
    endTime =
      typeof gig.acceptInterestEndTime === "number"
        ? gig.acceptInterestEndTime
        : new Date(gig.acceptInterestEndTime).getTime();
  }

  if (now < startTime) {
    // Window hasn't opened yet
    return {
      hasWindow: true,
      status: "not_open",
      message: "Opens Soon",
    };
  } else if (endTime && now > endTime) {
    // Window has closed
    return {
      hasWindow: true,
      status: "closed",
      message: "Closed",
    };
  } else {
    // Window is open
    return {
      hasWindow: true,
      status: "open",
      message: "Open Now",
    };
  }
};

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) return `in ${diffDays} day${diffDays !== 1 ? "s" : ""}`;
  if (diffHours > 0) return `in ${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
  return "soon";
}

export type GigUserStatus = {
  // Basic status
  isGigPoster: boolean;
  hasShownInterest: boolean;
  isInApplicants: boolean;
  isInBookedUsers: boolean;
  isInBandApplication: boolean;

  // Position info
  position: number | null;
  bandRoleApplied: string | null;
  bandApplicationId: Id<"bands"> | null;

  // Derived messages
  statusMessage: string;
  statusBadgeVariant: "default" | "outline" | "secondary" | "destructive";

  // Action info
  canApply: boolean;
  canWithdraw: boolean;
  canManage: boolean;
  isPending: boolean;
  isBooked: boolean; // This should already be boolean

  // Role-specific info
  roleDetails?: {
    role: string;
    maxSlots: number;
    filledSlots: number;
    isRoleFull: boolean;
    applicantsCount: number;
    bookedCount: number;
  };
};

// Update your GigForStatusCheck interface to include missing properties
export interface GigForStatusCheck {
  _id: Id<"gigs">;
  postedBy: Id<"users">;
  interestedUsers?: Id<"users">[];
  bandCategory?: Array<{
    role: string;
    maxSlots: number;
    filledSlots: number;
    applicants: Id<"users">[];
    bookedUsers: Id<"users">[];
  }>;
  // Band applications (for band gigs)
  bookCount?: Array<{
    bandId: Id<"bands">;
    appliedBy: Id<"users">;
    performingMembers: Array<{ userId: Id<"users"> }>;
    status?: string;
  }>;
  isClientBand?: boolean;
  isTaken?: boolean;
  isPending?: boolean;

  // ADD THESE MISSING PROPERTIES
  bussinesscat: string; // Required for determining gig type
  maxSlots?: number; // For full band gigs
}

export const getUserGigStatus = (
  gig: GigForStatusCheck,
  currentUserId: Id<"users"> | null,
): GigUserStatus => {
  if (!currentUserId) {
    return {
      isGigPoster: false,
      hasShownInterest: false,
      isInApplicants: false,
      isInBookedUsers: false,
      isInBandApplication: false,
      position: null,
      bandRoleApplied: null,
      bandApplicationId: null,
      statusMessage: "Sign in to interact",
      statusBadgeVariant: "secondary",
      canApply: false,
      canWithdraw: false,
      canManage: false,
      isPending: false,
      isBooked: false,
    };
  }

  const isGigPoster = gig.postedBy === currentUserId;

  // Determine gig type based on bussinesscat
  const getGigType = () => {
    switch (gig.bussinesscat) {
      case "full":
        return "full_band";
      case "other":
        return "client_band_creation";
      case "personal":
        return "individual_musician";
      case "mc":
        return "mc";
      case "dj":
        return "dj";
      case "vocalist":
        return "vocalist";
      default:
        return "individual_musician";
    }
  };

  const gigType = getGigType();

  // Initialize base status
  const baseStatus: GigUserStatus = {
    isGigPoster,
    hasShownInterest: false,
    isInApplicants: false,
    isInBookedUsers: false,
    isInBandApplication: false,
    position: null,
    bandRoleApplied: null,
    bandApplicationId: null,
    statusMessage: "",
    statusBadgeVariant: "default",
    canApply: false,
    canWithdraw: false,
    canManage: false,
    isPending: false,
    isBooked: false,
  };

  // ========== REGULAR GIGS (individual musicians) ==========
  // Use interestedUsers for individual gigs (mc, dj, vocalist, personal)
  // ========== REGULAR GIGS (individual musicians) ==========
  if (
    gigType === "individual_musician" ||
    gigType === "mc" ||
    gigType === "dj" ||
    gigType === "vocalist"
  ) {
    const interestedUsers = gig.interestedUsers || [];
    const hasShownInterest = interestedUsers.includes(currentUserId);
    const position = hasShownInterest
      ? interestedUsers.indexOf(currentUserId) + 1
      : null;

    baseStatus.hasShownInterest = hasShownInterest;
    baseStatus.position = position;

    // FIXED: Use Boolean() or explicit false fallback
    baseStatus.isBooked = Boolean(gig.isTaken) && hasShownInterest;
    baseStatus.isPending = !baseStatus.isBooked && hasShownInterest;

    if (isGigPoster) {
      baseStatus.statusMessage = gig.isTaken
        ? "Your gig (Booked)"
        : "Your gig (Manage)";
      baseStatus.statusBadgeVariant = "default";
      baseStatus.canManage = true;
    } else if (gig.isTaken) {
      // This also needs fixing
      baseStatus.statusMessage = "Gig is booked";
      baseStatus.statusBadgeVariant = "secondary";
    } else if (hasShownInterest) {
      baseStatus.statusMessage = baseStatus.isBooked
        ? "Booked ✓"
        : baseStatus.isPending
          ? `Pending (#${position})`
          : `Interested (#${position})`;
      baseStatus.statusBadgeVariant = baseStatus.isBooked
        ? "default"
        : "outline";
      baseStatus.canWithdraw = true;
    } else {
      baseStatus.statusMessage = "Available";
      baseStatus.statusBadgeVariant = "outline";
      baseStatus.canApply = !gig.isTaken;
    }

    return baseStatus;
  }

  // ========== CLIENT BAND CREATION (with roles) ==========
  // Use bandCategory.applicants for client_band_creation
  if (gigType === "client_band_creation") {
    const bandRoles = gig.bandCategory || [];
    let foundRole = null;

    // Check each role for user's status
    for (const role of bandRoles) {
      const isApplicant = role.applicants.includes(currentUserId);
      const isBooked = role.bookedUsers.includes(currentUserId);

      if (isApplicant || isBooked) {
        foundRole = role;
        baseStatus.isInApplicants = isApplicant;
        baseStatus.isInBookedUsers = isBooked;
        baseStatus.bandRoleApplied = role.role;
        baseStatus.position = isApplicant
          ? role.applicants.indexOf(currentUserId) + 1
          : null;
        baseStatus.isBooked = isBooked;
        baseStatus.isPending = isApplicant && !isBooked;
        break;
      }
    }

    if (isGigPoster) {
      baseStatus.statusMessage = "Your band gig";
      baseStatus.statusBadgeVariant = "default";
      baseStatus.canManage = true;
    } else if (foundRole) {
      // User is found in a role
      if (baseStatus.isBooked) {
        baseStatus.statusMessage = `Booked as ${baseStatus.bandRoleApplied} ✓`;
        baseStatus.statusBadgeVariant = "default";
      } else if (baseStatus.isPending) {
        baseStatus.statusMessage = `Pending as ${baseStatus.bandRoleApplied} (#${baseStatus.position})`;
        baseStatus.statusBadgeVariant = "outline";
        baseStatus.canWithdraw = true;
      } else {
        baseStatus.statusMessage = `Applied as ${baseStatus.bandRoleApplied}`;
        baseStatus.statusBadgeVariant = "outline";
        baseStatus.canWithdraw = true;
      }
    } else {
      // User not found in any role - check if can apply
      const availableRoles = bandRoles.filter(
        (role) => role.filledSlots < role.maxSlots,
      );
      baseStatus.canApply = availableRoles.length > 0;
      baseStatus.statusMessage = baseStatus.canApply
        ? "Available"
        : "All roles full";
      baseStatus.statusBadgeVariant = baseStatus.canApply
        ? "outline"
        : "secondary";
    }

    // Add role details if found
    if (foundRole) {
      baseStatus.roleDetails = {
        role: foundRole.role,
        maxSlots: foundRole.maxSlots,
        filledSlots: foundRole.filledSlots,
        isRoleFull: foundRole.filledSlots >= foundRole.maxSlots,
        applicantsCount: foundRole.applicants.length,
        bookedCount: foundRole.bookedUsers.length,
      };
    }

    return baseStatus;
  }

  // ========== FULL BAND GIGS ==========
  // Use bookCount for full_band gigs
  if (gigType === "full_band") {
    const bookCount = gig.bookCount || [];

    // Find user's band application
    const userBandApplication = bookCount.find((application) => {
      // Check if user is the applicant OR part of performing members
      return (
        application.appliedBy === currentUserId ||
        application.performingMembers?.some(
          (member) => member.userId === currentUserId,
        )
      );
    });

    if (userBandApplication) {
      baseStatus.isInBandApplication = true;
      baseStatus.bandApplicationId = userBandApplication.bandId;
      baseStatus.position = bookCount.indexOf(userBandApplication) + 1;

      // Determine status based on application status
      const status = userBandApplication.status || "applied";
      baseStatus.isBooked =
        status === "booked" || status === "confirmed" || status === "completed";
      baseStatus.isPending =
        !baseStatus.isBooked &&
        (status === "applied" ||
          status === "shortlisted" ||
          status === "interviewed");
    }

    if (isGigPoster) {
      baseStatus.statusMessage = "Your band gig";
      baseStatus.statusBadgeVariant = "default";
      baseStatus.canManage = true;
    } else if (userBandApplication) {
      // User has a band application
      if (baseStatus.isBooked) {
        baseStatus.statusMessage = `Band Booked ✓ (#${baseStatus.position})`;
        baseStatus.statusBadgeVariant = "default";
      } else if (baseStatus.isPending) {
        baseStatus.statusMessage = `Band Pending (#${baseStatus.position})`;
        baseStatus.statusBadgeVariant = "outline";
        baseStatus.canWithdraw = true;
      } else {
        baseStatus.statusMessage = `Band Applied (#${baseStatus.position})`;
        baseStatus.statusBadgeVariant = "outline";
        baseStatus.canWithdraw = true;
      }
    } else {
      // User has no band application
      const maxBands = gig.maxSlots || 1; // FIXED: Now gig has maxSlots property
      const currentBands = bookCount.length;
      const isFull = currentBands >= maxBands;

      baseStatus.canApply = !isFull;
      baseStatus.statusMessage = isFull ? "Bands full" : "Available for bands";
      baseStatus.statusBadgeVariant = isFull ? "secondary" : "outline";
    }

    return baseStatus;
  }

  // Default fallback
  return baseStatus;
};

// Helper function to get action button configuration
export type ActionButtonConfig = {
  label: string;
  variant: "default" | "outline" | "secondary" | "destructive";
  icon: React.ReactNode;
  action: "apply" | "withdraw" | "manage" | "none";
  disabled: boolean;
  className?: string;
};

// Helper to get stats for user across all gigs
export const getUserGigStats = (
  gigs: GigForStatusCheck[],
  userId: Id<"users"> | null,
) => {
  const stats = {
    posted: 0,
    interested: 0,
    applied: 0,
    booked: 0,
  };

  gigs.forEach((gig) => {
    const status = getUserGigStatus(gig, userId);
    if (status.isGigPoster) stats.posted++;
    if (status.hasShownInterest) stats.interested++;
    if (status.isInApplicants || status.isInBandApplication) stats.applied++;
    if (status.isBooked) stats.booked++;
  });

  return stats;
};
