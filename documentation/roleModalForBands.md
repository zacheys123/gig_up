BandSetupModal Component Documentation
Overview

BandSetupModal is a responsive, dual-interface modal component for configuring band roles in gig creation and editing workflows. It automatically switches between desktop and mobile interfaces based on screen size.
Table of Contents

    Component Architecture

    Usage in Gig Creation

    Usage in Gig Editing

    Props Interface

    Data Flow

    State Management

    Responsive Behavior

    Common Use Cases

Component Architecture
File Structure
text

app/gigs/\_components/
├── BandSetUpModal.tsx # Main wrapper component
├── DesktopBandSetupModal.tsx # Desktop version (≥768px)
└── MobileBandSetup.tsx # Mobile version (<768px)

Conditional Rendering Logic
typescript

const BandSetupModal: React.FC<BandSetupModalProps> = (props) => {
const isMobile = useMediaQuery("(max-width: 768px)");

return isMobile ? <MobileBandSetupModal {...props} /> : <DesktopBandSetupModal {...props} />;
};

Props Interface
Type Definition
typescript

interface BandSetupModalProps {
// Modal Control
isOpen: boolean; // Controls modal visibility
onClose: () => void; // Callback when modal closes

// Data Handling
onSubmit: (roles: BandRoleInput[]) => void; // Receives configured roles
initialRoles?: BandRoleInput[]; // Pre-populated roles (for editing)
isEditMode?: boolean; // Differentiates create vs edit
}

BandRoleInput Structure
typescript

interface BandRoleInput {
role: string; // Role name (e.g., "Lead Vocalist")
maxSlots: number; // Number of positions needed
maxApplicants?: number; // Max applications allowed (default: 20)
currentApplicants?: number; // Current application count
requiredSkills?: string[]; // Required skills/tags
description?: string; // Role description
price?: number; // Compensation amount
currency?: string; // Currency code (default: "KES")
negotiable?: boolean; // Whether price is negotiable
filledSlots?: number; // Already filled positions
isLocked?: boolean; // Whether role can be modified
// ... other optional fields
}

Usage in Gig Creation
Triggering the Modal

In NormalGigsForm.tsx:
typescript

// When user selects "Create Band" (business category = "other")
const handleBussinessChange = (value: BusinessCategory) => {
setBussinessCategory(value);
setFormValues(prev => ({ ...prev, bussinesscat: value }));

if (value === "other") {
setShowBandSetupModal(true); // Opens the modal
}
};

Modal Initialization (Creation Mode)
typescript

<BandSetupModal
isOpen={showBandSetupModal}
onClose={() => setShowBandSetupModal(false)}
onSubmit={handleBandSetupSubmit} // Receives configured roles
// No initialRoles (starts empty)
isEditMode={false}
/>

Handling Submission
typescript

const handleBandSetupSubmit = (roles: BandRoleInput[]) => {
setBandRoles(roles); // Store roles in parent component state
toast.success(`Band setup complete! ${roles.length} role(s) selected.`);
};

Usage in Gig Editing
Triggering the Modal

In EditGigForm.tsx:
typescript

// When editing an existing band gig
const handleBussinessChange = (value: BusinessCategory) => {
setBussinessCategory(value);
setFormValues(prev => ({ ...prev, bussinesscat: value }));

if (value === "other") {
setShowBandSetupModal(true); // Opens with existing data
}
};

Modal Initialization (Edit Mode)
typescript

<BandSetupModal
isOpen={showBandSetupModal}
onClose={() => setShowBandSetupModal(false)}
onSubmit={handleBandSetupSubmit}
initialRoles={bandRoles} // Pre-populate with existing roles
isEditMode={true} // Enable edit-specific features
/>

Handling Updated Roles
typescript

const handleBandSetupSubmit = (roles: BandRoleInput[]) => {
setBandRoles(roles); // Update existing roles
setHasChanges(true); // Mark form as having unsaved changes
toast.success(`Band setup updated! ${roles.length} role(s) configured.`);
};

Data Flow Diagram
text

Gig Creation/Edit Form
│
▼ (user selects "Create Band")
│
▼ (setShowBandSetupModal(true))
│
┌───────────────────┐
│ BandSetupModal │
│ (Wrapper/Proxy) │
└─────────┬─────────┘
│
(Screen Size Check)
│
┌─────┴─────┐
▼ ▼
Desktop Mobile
Version Version
│ │
└─────┬─────┘
│
(User Configures Roles)
│
▼ (onSubmit callback)
│
Parent Form Receives
BandRoleInput[]

State Management
Parent Component State (Example)
typescript

// In gig creation/editing form
const [showBandSetupModal, setShowBandSetupModal] = useState(false);
const [bandRoles, setBandRoles] = useState<BandRoleInput[]>([]);
const [bussinesscat, setBussinessCategory] = useState<BusinessCategory>(null);

// Initialize from existing gig data (edit mode only)
useEffect(() => {
if (gig?.bandCategory) {
setBandRoles(gig.bandCategory); // Load existing roles
}
}, [gig]);

Responsive Behavior
Desktop Experience (≥768px)

Features:

    Two-panel layout (selection + configuration)

    Grid view for role selection

    Advanced configuration options

    Real-time budget calculations

    Multi-column role cards

Layout:
text

┌─────────────────────────────────────────┐
│ SELECT ROLES │ CONFIGURE ROLES │
│ (Left 1/3) │ (Right 2/3) │
│ • Role search │ • Role cards │
│ • Category filters │ • Configuration │
│ • Grid/list view │ • Preview │
└─────────────────────────────────────────┘

Mobile Experience (<768px)

Features:

    Single-column vertical flow

    Simplified role selection

    Touch-optimized controls

    Progressive disclosure

    Bottom action bar

Layout:
text

┌─────────────────┐
│ SELECT ROLES │
│ (Search/Filter)│
├─────────────────┤
│ ROLE CONFIG 1 │
│ (Compact card) │
├─────────────────┤
│ ROLE CONFIG 2 │
│ (Compact card) │
├─────────────────┤
│ [SAVE] │
└─────────────────┘

Common Use Cases

1. Creating a New Band Gig
   typescript

// User flow:

1. Select business category = "other" (Create Band)
2. BandSetupModal opens with empty state
3. Add roles (Lead Vocalist, Guitarist, Drummer)
4. Configure each role (slots, price, skills)
5. Submit → roles saved to parent form
6. Continue with gig creation

7. Editing Existing Band Setup
   typescript

// User flow:

1. Load existing gig with band roles
2. Click "Edit" on band preview
3. BandSetupModal opens with pre-filled roles
4. Modify role configurations
5. Submit → updated roles saved
6. Save gig with updated band setup

7. Switching Between Instrument Types
   typescript

// User can switch between:
• Full Band (pre-defined ensemble)
• Individual Musician (single instrument)
• Create Band (custom multi-role setup)
• MC/DJ/Vocalist (specialized talent)

Integration Points
With Gig Creation Form
typescript

// Data flows to final gig submission
const handleSubmit = async () => {
const gigData = {
title: formValues.title,
description: formValues.description,
// ... other fields
bandCategory: bandRoles, // ← From BandSetupModal
bussinesscat: "other",
};

await createGig(gigData);
};

With Database Schema
typescript

// Convex schema example
const gigs = defineTable({
// ... other fields
bandCategory: v.array(
v.object({
role: v.string(),
maxSlots: v.number(),
maxApplicants: v.optional(v.number()),
price: v.optional(v.number()),
// ... matches BandRoleInput
})
),
bussinesscat: v.union(
v.literal("full"),
v.literal("personal"),
v.literal("other"),
// ... other categories
),
});

Best Practices

1. Initialization
   typescript

// Always provide initialRoles for edit mode
<BandSetupModal
initialRoles={existingGig?.bandCategory || []}
isEditMode={!!existingGig}
/>

// For creation mode, omit initialRoles or provide empty array

2. Error Handling
   typescript

const handleBandSetupSubmit = (roles: BandRoleInput[]) => {
if (roles.length === 0) {
toast.error("Please add at least one role");
return;
}

if (roles.some(role => role.maxSlots === 0)) {
toast.error("All roles must have at least one position");
return;
}

// Process valid roles
setBandRoles(roles);
};

3. Performance Optimization
   typescript

// Use React.memo for large role lists
const RoleCard = React.memo(({ role, onUpdate, onRemove }) => {
// Component implementation
});

// Debounce expensive calculations
const totalBudget = useMemo(() => {
return bandRoles.reduce((sum, role) => {
return sum + (role.price || 0) \* role.maxSlots;
}, 0);
}, [bandRoles]);

Troubleshooting
Common Issues
Issue Cause Solution
Modal doesn't open isOpen prop is false Check parent state management
Roles not saving onSubmit not implemented Ensure callback updates parent state
Mobile/Desktop mismatch Media query not updating Check viewport meta tag
Initial roles not loading Data format mismatch Verify BandRoleInput structure
Debug Checklist
typescript

// 1. Check modal open state
console.log('Modal isOpen:', showBandSetupModal);

// 2. Verify initial roles
console.log('Initial roles:', initialRoles);

// 3. Check submission callback
console.log('onSubmit function:', typeof onSubmit);

// 4. Validate role data
console.log('Submitted roles:', roles);

Related Components

    TalentModal: For MC/DJ/Vocalist configuration

    GigCustomization: For gig card styling

    SchedulerComponent: For scheduling gig dates

    EditGigForm: Main gig editing interface

    NormalGigsForm: Main gig creation interface

This documentation provides a comprehensive overview of how BandSetupModal integrates with your gig creation and editing workflows, handling both desktop and mobile experiences seamlessly.
