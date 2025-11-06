import { GigSectionHeader } from "./GigSectionHeader";

// components/gigs/SavedGigs.tsx
export const SavedGigs = ({ user }: { user: any }) => (
  <GigSectionHeader
    title="💾 Saved Gigs"
    description="Gigs you've saved for later"
    user={user}
    type="saved-gigs"
  />
);
