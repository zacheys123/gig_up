// InstantGig & ProMusician System Documentation
// Table of Contents

//     System Overview

//     Architecture & Components

//     Core Features & Workflows

//     Data Models & Schemas

//     Algorithms & Matching Logic

//     Tier System & Limits

//     Performance Optimizations

//     Future Enhancements

//     Development Guidelines

// System Overview
// Purpose

// InstantGig is a streamlined musician booking platform that enables clients to:

//     Create reusable gig templates for recurring events

//     Discover and book premium musicians instantly

//     Manage bookings through a unified interface

// ProMusician connects verified professional musicians with clients seeking talent for various event types.
// Key Value Propositions

//     For Clients: Reduce booking time from days to minutes

//     For Musicians: Access premium gig opportunities with clear requirements

//     For Both: Streamlined communication, transparent pricing, reliable matching

// Architecture & Components
// Frontend Structure
// text

// app/hub/gigs/
// ├── page.tsx                    # Main gigUup with role-based tabs
// ├── _components/
// │   ├── InstantGigs.tsx         # Main InstantGig interface
// │   ├── tabs/
// │   │   ├── OnBoardingModal.tsx # New user guidance
// │   │   ├── CreateTemplateTab.tsx # Template creation (3 modes)
// │   │   ├── MyTemplatesTab.tsx  # Template management
// │   │   └── ProMusicianTab.tsx  # Musician discovery
// │   ├── BookingModal.tsx        # Booking workflow
// │   └── GigSectionHeader.tsx    # Reusable header component

// Backend Structure
// text

// convex/
// ├── instantgigs.ts              # Main InstantGig schema & mutations
// ├── controllers/
// │   ├── musicians.ts           # Musician queries & algorithms
// │   └── instantGigs.ts         # Template & gig operations

// Key Hooks

//     useTemplates() - Template management with caching

//     useInstantGigs() - Gig operations

//     useProMusicians() - Musician discovery

//     useCheckTrial() - Tier & trial management

// Core Features & Workflows
// 1. Template Creation System
// Three Creation Modes:

//     Guided (Free Tier)

//         Start with 50+ pre-built templates

//         Quick 2-minute setup

//         Best practices included

//     Custom Creation (Pro Tier)

//         Advanced template customization

//         Modify any template extensively

//         Save custom variations

//     Start from Scratch (Premium Tier)

//         Blank canvas experience

//         Total design control

//         Advanced customization options

// Template Fields:
// typescript

// interface GigTemplate {
//   title: string;
//   description: string;
//   date: string;
//   venue: string;
//   budget: string;
//   gigType: string; // wedding, corporate, etc.
//   duration: string;
//   fromTime?: string;
//   setlist?: string;
//   icon: string;
// }

// 2. Musician Discovery & Booking
// Discovery Features:

//     Smart Filtering: By city, instrument, genre, rating, tier

//     Gig-Type Optimization: Algorithmic matching based on event type

//     Featured Musicians: Curated list of high-quality performers

//     Search & Filters: Real-time search with debouncing

// Booking Flow:

//     Select template → Choose musician → Review compatibility → Send request

//     Real-time status tracking (pending, accepted, declined, deputy-suggested)

// 3. Tier System & Access Control
// User Tiers:

//     Free: 3 templates during trial, basic features

//     Pro: Unlimited templates, custom creation, advanced features

//     Premium: All features + start from scratch, white-glove support

//     Elite: Highest tier with dedicated support

// Trial System:

//     20-day grace period for new users

//     Free users get Pro access during trial

//     Template limits enforced post-trial

// Data Models & Schemas
// InstantGig Schema
// typescript

// // Gig instance
// interface InstantGig {
//   title: string;
//   description: string;
//   date: string;
//   venue: string;
//   budget: string;
//   gigType: string;
//   duration: string;
//   clientId: string;
//   clientName: string;
//   invitedMusicianId: string;
//   status: "pending" | "accepted" | "declined" | "deputy-suggested";
//   createdAt: number;
// }

// // Template schema
// interface GigTemplate {
//   // Same fields as gig + template-specific
//   timesUsed: number;
//   icon: string;
//   clientId: string;
// }

// Musician Schema Extensions
// typescript

// interface EnhancedMusician {
//   // Base user fields
//   firstname: string;
//   lastname: string;
//   instrument: string;
//   city: string;

//   // Rating & experience
//   avgRating: number;
//   completedGigsCount: number;
//   reliabilityScore: number;

//   // Tier & verification
//   tier: "free" | "pro" | "premium" | "elite";
//   verified: boolean;

//   // Rate structure
//   rate: {
//     regular: string;
//     function?: string;
//     corporate?: string;
//     concert?: string;
//   };

//   // Algorithm enhancements
//   gigTypeCompatibility: number;
//   displayRate: string;
//   isOptimalForGigType: boolean;
// }

// Algorithms & Matching Logic
// 1. Gig Type Compatibility Algorithm
// Scoring Components:

//     Instrument Compatibility (50%)

//         Pre-defined instrument-to-gig-type matrix

//         Specialized instruments score higher for relevant gig types

//     Rating & Reliability (30%)

//         Average rating (converted to 0-100 scale)

//         Reliability score based on past performance

//     Experience Bonus (10%)

//         Number of completed gigs

//         Capped at 20 points

//     Tier Bonus (10%)

//         Elite: 20, Premium: 15, Pro: 10, Free: 0

// Instrument Compatibility Matrix:
// typescript

// const INSTRUMENT_COMPATIBILITY = {
//   wedding: {
//     violin: 100, piano: 95, vocalist: 90, guitar: 85, harp: 90
//   },
//   corporate: {
//     piano: 95, dj: 90, saxophone: 80, violin: 75
//   },
//   // ... other gig types
// };

// 2. Rate Display Algorithm
// Gig Type to Rate Field Mapping:
// typescript

// const GIG_TYPE_RATE_MAPPING = {
//   wedding: "function",
//   corporate: "corporate",
//   concert: "concert",
//   // ... falls back to "regular"
// };

// 3. Optimal Match Detection
// Criteria for "Optimal Match":

//     Instrument appears in optimal instruments list for gig type

//     High compatibility score (>80)

//     Specialized experience in that gig type

// typescript

// const optimalInstruments = {
//   wedding: ["violin", "piano", "vocalist", "harp", "string quartet"],
//   corporate: ["piano", "dj", "jazz trio", "background music"],
//   // ... other gig types
// };

// Tier System & Limits
// Template Limits by Tier
// Tier	Template Limit	Creation Modes	Customization
// Free	3 (trial: 3)	Guided Only	Limited
// Pro	Unlimited	Guided + Custom	Full
// Premium	Unlimited	All Modes	Complete
// Trial Period Logic
// typescript

// const TRIAL_DURATION_DAYS = 20;
// const isInGracePeriod = currentTime < (userCreationTime + TRIAL_DURATION_MS);

// Performance Optimizations
// 1. Caching Strategy

//     Local Storage Cache: Templates cached for 5 minutes

//     Optimistic Updates: Immediate UI updates with rollback on failure

//     Stale-While-Revalidate: Show cached data while fetching updates

// 2. Query Optimization

//     Debounced Search: 300ms delay on search inputs

//     Pagination: Limit results with incremental loading

//     Selective Re-renders: Memoized components and callbacks

// 3. State Management

//     Optimistic State: Immediate UI feedback for mutations

//     Error Boundaries: Graceful error handling with rollbacks

//     Loading States: Skeleton screens and progress indicators

// Future Enhancements
// Short-term (Next 3 months)

//     Advanced Filtering

//         Price range filters

//         Availability calendar integration

//         Distance-based sorting

//     Enhanced Booking Flow

//         Multi-musician bookings

//         Recurring gig templates

//         Advanced scheduling options

//     Musician Features

//         Availability management

//         Portfolio enhancements

//         Direct messaging system

// Medium-term (3-6 months)

//     AI-Powered Matching

//         Machine learning compatibility scoring

//         Predictive booking suggestions

//         Smart template recommendations

//     Payment Integration

//         Secure escrow payments

//         Automated payout system

//         Invoice management

//     Analytics Dashboard

//         Booking performance metrics

//         Revenue tracking

//         Customer insights

// Long-term (6+ months)

//     Platform Expansion

//         International market support

//         Multi-currency handling

//         Localization (languages, regions)

//     Enterprise Features

//         Team account management

//         API access for agencies

//         White-label solutions

//     Ecosystem Integration

//         Music equipment rentals

//         Venue partnerships

//         Event planning tools

// Development Guidelines
// Code Standards
// Component Structure
// typescript

// // 1. Import dependencies
// // 2. Interfaces and types
// // 3. Helper functions and constants
// // 4. Main component with proper typing
// // 5. Memoized sub-components
// // 6. Export with displayName

// Performance Best Practices

//     Always memoize:

//         Expensive computations

//         Component props

//         Event handlers

//     Use proper dependencies in hooks

//     Implement loading states for all async operations

//     Handle errors gracefully with user-friendly messages

// State Management
// typescript

// // Good: Optimistic updates with rollback
// const [templates, setTemplates] = useState([]);
// const updateTemplate = async (id, updates) => {
//   const original = templates;
//   setTemplates(optimisticUpdate);
//   try {
//     await api.updateTemplate(id, updates);
//   } catch (error) {
//     setTemplates(original); // Rollback
//   }
// };

// Testing Strategy

//     Unit Tests: Utility functions, algorithms

//     Integration Tests: Component workflows

//     E2E Tests: Critical user journeys

//     Performance Tests: Large datasets, concurrent users

// Monitoring & Analytics

//     Track template creation and usage patterns

//     Monitor booking success rates

//     Measure musician response times

//     User engagement metrics

// Quick Reference
// Key Algorithms Location

//     Compatibility Scoring: convex/controllers/musicians.ts - calculateGigTypeCompatibility()

//     Rate Mapping: convex/controllers/musicians.ts - getMusicianRateForGigType()

//     Optimal Match: convex/controllers/musicians.ts - calculateOptimalForGigType()

// Main Components

//     InstantGigs Entry: app/hub/gigs/_components/InstantGigs.tsx

//     Template Creation: app/hub/gigs/_components/tabs/CreateTemplateTab.tsx

//     Musician Discovery: app/hub/gigs/_components/tabs/ProMusicianTab.tsx

// Critical Hooks

//     useTemplates() - Template management with caching

//     useProMusicians() - Musician data with filters

//     useCheckTrial() - Tier and trial status

// This documentation provides a comprehensive overview of the InstantGig system. For specific implementation details, refer to the inline comments in each component file.
