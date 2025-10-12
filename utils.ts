import { Id } from "@/convex/_generated/dataModel";
import { UserProps } from "./types/userTypes";

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
