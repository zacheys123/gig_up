import { PlaceholderSection } from "./PlaceholderSection";

// components/gigs/SavedGigs.tsx
export const SavedGigs = ({ user }: { user: any }) => (
  <PlaceholderSection
    title="💾 Saved Gigs"
    description="Gigs you've saved for later"
    user={user}
    type="saved-gigs"
  />
);
