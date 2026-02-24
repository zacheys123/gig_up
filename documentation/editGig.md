Gig Editing Flow Documentation
Overall Architecture
Your editing system consists of the following key components:

text
EditGigPage (page) → EditGigForm (form component) → Convex Backend
↓
Verification Modal
↓
Talent/Band Modals
↓
Customization System
File-by-File Analysis

1. EditGigPage (app/edit/[id]/page.tsx)
   Purpose: Main page wrapper that handles verification before showing edit form

Connections:

Receives: gigId from URL params (params.id)

Uses: useCurrentUser to check user authentication

Handles: Secret verification via SimpleForgotSecretModal

Manages: Customization modal visibility

Passes to EditGigForm:

gigId

customization props (fontColor, font, backgroundColor)

logo state

Key Features:

Verification System: Checks localStorage for recent verification (30-minute validity)

Customization Toggle: Shows/hides GigCustomization modal

Verification Flow: Redirects to secret recovery if needed

State Management: Maintains customization and logo states

2. EditGigForm (app/components/talent/EditGigForm.tsx)
   Purpose: Main form component for editing gig details

Connections:

Receives:

gigId from parent page

customization props (fontColor, font, backgroundColor, logo)

Queries: Uses useQuery(api.controllers.gigs.getGigById) to fetch gig data

if youre going to explain for the backend convex im chnaging to just use a clerkid prop from client and get user not usng identity
Gig Editing Flow Documentation
Overall Architecture
Your editing system consists of the following key components:

text
EditGigPage (page) → EditGigForm (form component) → Convex Backend
↓
Verification Modal
↓
Talent/Band Modals
↓
Customization System
File-by-File Analysis

1. EditGigPage (app/edit/[id]/page.tsx)
   Purpose: Main page wrapper that handles verification before showing edit form

Connections:

Receives: gigId from URL params (params.id)

Uses: useCurrentUser to check user authentication

Handles: Secret verification via SimpleForgotSecretModal

Manages: Customization modal visibility

Passes to EditGigForm:

gigId

customization props (fontColor, font, backgroundColor)

logo state

Key Features:

Verification System: Checks localStorage for recent verification (30-minute validity)

Customization Toggle: Shows/hides GigCustomization modal

Verification Flow: Redirects to secret recovery if needed

State Management: Maintains customization and logo states

2. EditGigForm (app/components/talent/EditGigForm.tsx)
   Purpose: Main form component for editing gig details

Connections:

Receives:

gigId from parent page

customization props (fontColor, font, backgroundColor, logo)

Queries: Uses useQuery(api.controllers.gigs.getGigById) to fetch gig data

Mutations: Uses useMutation(api.controllers.gigs.updateGig) for updates

Utilities: Uses usegigUpdate() custom hook

Services: fileupload for logo uploads

Modal Components:

TalentModal for MC/DJ/Vocalist details

BandSetupModal for band role configuration

GigCustomization for styling

Data Flow:

Initialization: Fetches gig data → Parses talent data → Sets form state

Form Updates: Local state changes → Validation → Prepare update payload

Submission: handleSave() → updateGig() mutation → Convex backend

Customization: Separate state (gigcustom) merged into update payload

Key Functions:

validateForm(): Validates required fields based on business category

handleSave(): Prepares and submits update data

handleTalentSubmit(): Updates talent-specific fields

handleBandSetupSubmit(): Updates band roles

3. Convex Backend (convex/gigs.ts - updateGig mutation)
   Purpose: Server-side mutation to update gig data

Key Changes from Original Implementation:

Authentication: Uses clerkId passed from client instead of getUserIdentity()

User Lookup: Calls getCurrentUser(ctx, args.clerkId) helper

Ownership Validation: Uses validateGigOwnership(ctx, gigId, dbUser.\_id)

Data Processing:

Authentication: Validates user via clerkId

Ownership Check: Ensures user owns the gig

Payload Construction:

Standard fields mapped directly

bandCategory specially formatted with formatBandRolesForUpdate()

time field structured properly

Database Update: ctx.db.patch(gigId, payload)

History Logging: Adds entry to bookingHistory array

Special Handling:

Band Roles: Converts array to proper Convex format

isClientBand: Automatically set based on bandCategory presence

Time Field: Ensures durationFrom/durationTo defaults

4. Verification System
   Components:

SimpleForgotSecretModal: Multi-step secret recovery

useSecretKeyVerification: Custom hook for verification state

Flow:

Check if gig has secret key

Check localStorage for recent verification

If required, show verification modal

Options:

Enter existing secret

Email recovery → Security question → Set new secret

Backend Mutations Used:

api.controllers.verifyGig.verifyGigSecret

api.controllers.verifyGig.requestSecretReset

api.controllers.verifyGig.verifySecurityAnswerAndReset

5. Talent Modals System
   Modal Components:

MCLanguagesModal: For MC type, languages, experience

DJGenreModal: For DJ genres, equipment, setup

VocalistGenreModal: For vocalist genres

BaseTalentModal: Shared modal wrapper

Integration:

Triggered when bussinesscat changes to "mc", "dj", or "vocalist"

Data stored in form state, then sent to backend

Talent data parsed/combined into string fields for Convex storage

6. Band Setup System
   Component: BandSetupModal
   Purpose: Configure multiple band roles with slots, skills, pricing
   Data Structure: Array of BandRoleInput objects
   Backend Format: Converted via formatBandRolesForUpdate() in Convex

7. Customization System
   Component: GigCustomization
   Fields Managed:

fontColor: Text color

font: Font family

backgroundColor: Background color

logo: Image URL

Storage: Saved directly to gig document fields

Data Transformation Flow
Frontend → Backend Data Mapping
typescript
// EditGigForm prepares this:
const updateData = {
gigId: gigId as Id<"gigs">,
clerkId: user.clerkId, // ← Authentication key
title: formValues.title,
// ... other fields
// Talent data converted to strings:
mcLanguages: Array.isArray(formValues.mcLanguages)
? formValues.mcLanguages.join(", ")
: formValues.mcLanguages,
// Customization fields:
font: gigcustom.font,
fontColor: gigcustom.fontColor,
backgroundColor: gigcustom.backgroundColor,
logo: imageUrl,
// Band roles specially formatted
bandCategory: formattedBandRoles,
};

// Convex backend receives and processes:
async function updateGig(ctx, args) {
const { dbUser } = await getCurrentUser(ctx, args.clerkId); // ← User lookup
// ... validation
await ctx.db.patch(gigId, payload);
}
Key Integration Points

1. Authentication Flow
   text
   Client (EditGigForm) → passes clerkId → Convex (updateGig) → getCurrentUser() → User validation
2. Talent Data Flow
   text
   TalentModal → EditGigForm state → String conversion → Convex storage
3. Band Role Flow
   text
   BandSetupModal → BandRoleInput[] → formatBandRolesForUpdate() → Convex array
4. Customization Flow
   text
   GigCustomization component → EditGigForm state → Direct field mapping → Convex
5. Verification Flow
   text
   EditGigPage → localStorage check → SimpleForgotSecretModal → Verification mutations
   Error Handling & Validation
   Frontend Validation (EditGigForm):
   Required field validation based on bussinesscat

Secret key minimum length (4 characters)

Band role validation for "other" category

Date/day validation based on timeline type

Backend Validation (updateGig):
User ownership validation

Data type validation via Convex schema

Band role structure validation

State Management
Local State (EditGigForm):
formValues: Main form data

gigcustom: Customization data

bandRoles: Band configuration

hasChanges: Tracks unsaved changes

Persistent State:
localStorage: Verification timestamps

Convex Database: Gig document updates

Performance Optimizations
Memoized Components: MemoizedInput, MemoizedTextarea, TalentPreview

Conditional Rendering: Only show relevant sections based on bussinesscat

Optimistic Updates: Could be added via Convex mutations

Image Upload: Separate fileupload utility with progress tracking

Security Considerations
Ownership Verification: Every update validates user owns the gig

Secret Protection: Required for editing, with recovery flow

Data Validation: Both frontend and backend validation

Authentication: Clerk ID passed and validated server-side

Common Update Scenarios

1. Basic Gig Update
   typescript
   // Fields: title, description, location, price, etc.
   await updateGig({ gigId, clerkId, title: "New Title", ... });
2. Talent-Specific Update
   typescript
   // For MC gigs
   await updateGig({
   gigId,
   clerkId,
   mcType: "Wedding MC",
   mcLanguages: "English, Swahili"
   });
3. Band Setup Update
   typescript
   // Multiple roles with configurations
   await updateGig({
   gigId,
   clerkId,
   bandCategory: [
   { role: "Lead Guitar", maxSlots: 1, price: 5000 },
   { role: "Drummer", maxSlots: 1, price: 4000 }
   ]
   });
4. Customization Update
   typescript
   // Styling changes
   await updateGig({
   gigId,
   clerkId,
   font: "Arial",
   fontColor: "#333333",
   backgroundColor: "#FFFFFF",
   logo: "https://..."
   });
