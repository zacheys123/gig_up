Gig Creation Flow Documentation
Overview
This system uses a multi-step creation flow with conditional rendering based on business categories. The creation flow is state-managed with a combination of local state, draft persistence, and context/Convex backend integration.

File Connection Map
text
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ CreateGigPage.js │───▶│CreateNormalGigs.js│───▶│NormalGigsForm.js │
│ (Entry Point) │ │ (Options View) │ │ (Main Form) │
└──────────────────┘ └──────────────────┘ └────────┬─────────┘
│
▼
┌──────────────────┐
│ Modal Components │
│ (Talent, Band) │
└──────────────────┘
│
▼
┌──────────────────┐
│ Draft System │
│ (LocalStorage) │
└────────┬─────────┘
│
▼
┌──────────────────┐
│ Convex Backend │
│ (createGig) │
└──────────────────┘
Detailed Component Analysis

1. CreateGigPage.js - The Entry Point
   javascript
   // Purpose: Authentication gate and loading wrapper
   // Connections:
   // 1. ← Uses: `useCurrentUser()` hook to check authentication
   // 2. ← Uses: `useThemeColors()` for styling
   // 3. └──▶ Renders: `CreateNormalGigs` component if authenticated
   // 4. └──▶ Shows: Authentication required UI if not logged in

// Flow:
// Auth Check → Load User → Pass User Data → CreateNormalGigs 2. CreateNormalGigs.js - Options Selection View
javascript
// Purpose: Presents gig type options before form
// Connections:
// 1. ← Receives: `user` prop from CreateGigPage
// 2. ← Uses: `useRouter()` for navigation
// 3. ← Uses: `useThemeColors()` for styling
// 4. └──▶ Conditionally renders: `NormalGigsForm` when option selected
// 5. └──▶ Manages: Local state for `showForm` to toggle between views

// Flow:
// Show Options → User Selects → Set showForm=true → Render NormalGigsForm 3. NormalGigsForm.js - The Main Creation Form (CORE COMPONENT)
javascript
// Purpose: Comprehensive form with conditional sections based on business category
// Key Architecture Patterns:
// 1. Tab-based Navigation (Basic Info, Details, Customize, Security)
// 2. Conditional Rendering based on `bussinesscat`
// 3. Draft Auto-saving system
// 4. Modular modal system for specialized inputs

// CONNECTIONS:
// ← Receives: No direct props (standalone form)
// ← Uses:
// - `useCurrentUser()` for user data
// - `useThemeColors()` for styling
// - `useNetworkStatus()` for offline handling
// - `useGigScheduler()`, `useGigNotifications()`, `useGigData()` stores
// - `useMutation(api.controllers.gigs.createGig)` for backend creation

// └──▶ Manages: Multiple local states:
// - `formValues` (LocalGigInputs)
// - `bandRoles` (BandRoleInput[])
// - `bussinesscat` (BusinessCategory)
// - `draftId`, `drafts` for persistence

// └──▶ Opens Modals Conditionally:
// - `TalentModal` for mc/dj/vocalist categories
// - `BandSetupModal` for "other" (band creation) category
// - `GigCustomization` for styling
// - `SchedulerComponent` for final scheduling
// - `DraftsListModal` for draft management

// └──▶ Handles Submission:
// 1. Validates required fields based on business category
// 2. Calls `prepareGigDataForConvex()` to format data
// 3. Calls `createGig` Convex mutation
// 4. Saves to drafts automatically 4. Modal Components System
javascript
// TalentModal.js
// Purpose: Specialized form for MC/DJ/Vocalist details
// Connections:
// ← Receives: `talentType`, `initialData`, `onSubmit` from NormalGigsForm
// └──▶ Updates: `formValues` in parent via onSubmit callback

// BandSetupModal.js → DesktopBandSetupModal.js / MobileBandSetupModal.js
// Purpose: Complex role configuration for band creation
// Connections:
// ← Receives: `initialRoles`, `onSubmit` from NormalGigsForm
// └──▶ Updates: `bandRoles` state in parent via onSubmit callback

// GigCustomization.js (not shown but referenced)
// Purpose: Visual styling for gig card
// Connections:
// ← Receives/Updates: `gigcustom` state in parent 5. Draft System (draftUtils.ts)
javascript
// Purpose: LocalStorage persistence for gig drafts
// Connections:
// ← Called from: NormalGigsForm auto-save and manual save
// └──▶ Stores: Complete form state including:
// - formValues
// - bandRoles (for band gigs)
// - customization
// - imageUrl
// - schedulingProcedure

// Key Functions:
// - `saveGigDraft()`: Called on form changes (auto-save)
// - `getGigDrafts()`: Loads drafts for modal
// - `getGigDraftById()`: Loads specific draft
// - `deleteGigDraft()`: Removes draft 6. Backend Connection (createGig Convex Mutation)
javascript
// Location: Convex backend (provided snippet)
// Purpose: Creates gig record in database
// Connections:
// ← Receives: Formatted data from `prepareGigDataForConvex()`
// └──▶ Handles: Complex logic based on business category:
// - Band creation (bussinesscat="other") → sets up bandCategory array
// - Full band → simple gig
// - Individual/Talent → specific field handling

// Key Features:
// 1. User validation and gig limit checking
// 2. Band role processing for "other" category
// 3. Notification creation for relevant musicians
// 4. Weekly gig count tracking
// 5. First gig bonus application
Data Flow for Creation

1. Form Data Flow
   text
   User Input → NormalGigsForm State → Draft System (LocalStorage)
   ↓
   Validation & Formatting
   ↓
   prepareGigDataForConvex()
   ↓
   createGig Convex Mutation
   ↓
   Database + Notifications
2. Business Category-Specific Flows
   A. Band Creation (bussinesscat="other")
   text
3. User selects "Create Band" option
4. BandSetupModal opens → configures roles
5. Band roles saved to `bandRoles` state
6. Submission: bandRoles → bandCategory in database
7. Special notifications to musicians open to band work
   B. Talent Types (mc, dj, vocalist)
   text
8. User selects talent type
9. TalentModal opens → collects specialized data
10. Data saved to formValues (mcType, djGenre, etc.)
11. Submission: Talent-specific fields to database
12. Notifications filtered by roleType
    C. Simple Gigs (full, personal)
    text
13. Standard form with instrument selection (personal)
14. Basic validation (price, category)
15. Direct submission without special processing
16. Draft System Flow
    text
    Form Changes → Auto-save Timer (30s) → saveGigDraft()
    ↓
    LocalStorage (encrypted)
    ↓
    DraftsListModal for management
    ↓
    Load Draft → Populate form states
    Key Architectural Patterns
17. Conditional Component Rendering
    javascript
    // Based on business category
    if (bussinesscat === "other") {
    // Show band setup preview and modal
    return <BandSetupPreview ... />;
    } else if (["mc", "dj", "vocalist"].includes(bussinesscat)) {
    // Show talent preview and modal
    return <TalentPreview ... />;
    }
18. Tab-Based Form Organization
    Basic Info: Title, Description, Business Category

Details: Location, Timing, Contact, Price

Customize: Visual styling

Security: Secret passphrase, interest windows

3. Modular Modal System
   Each modal handles specialized data

Callback pattern for data flow back to parent

Responsive design (mobile/desktop variants)

4. Type Safety
   Extensive TypeScript interfaces (LocalGigInputs, BandRoleInput, etc.)

Type guards for safe conversions

Consistent type usage across components

5. State Management
   Local state for form values

Context/hooks for global state (theme, network, gig data)

Draft system for persistence

Convex for backend state

Validation Rules by Category
Required for All Categories:
Title

Description

Location

Secret passphrase (min 4 chars)

Business category

Timeline (date/day based on type)

Category-Specific Requirements:
MC: MC Type, Languages

DJ: Genre, Equipment

Vocalist: At least one genre

Personal: Instrument, Price

Full: Price

Other: At least one band role

Error Handling

1. Form Validation Errors
   Field-level error display

Validation summary component

Real-time validation on blur/change

2. Network Errors
   Offline notification

Draft saving as fallback

Retry mechanisms

3. Submission Errors
   Toast notifications

Error state preservation

User-friendly error messages

Performance Optimizations

1. Memoization
   React.memo for form components

useMemo for filtered lists

useCallback for event handlers

2. Lazy Loading
   Modal components loaded conditionally

Band setup modal has mobile/desktop variants

3. Debounced Auto-save
   30-second auto-save timer

Prevents excessive localStorage writes

Security Features

1. Authentication
   User must be logged in

User ID attached to all gigs

2. Secret Passphrase
   Required for all gigs

Minimum 4 characters

Used for gig access/editing

3. Input Sanitization
   Form validation before submission

Type-safe data handling

Convex schema validation

This architecture provides a robust, scalable foundation for gig creation with clear separation of concerns, reusable components, and comprehensive error handling.
