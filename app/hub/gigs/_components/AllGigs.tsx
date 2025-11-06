import { GigSectionHeader } from "./GigSectionHeader";

// components/gigs/AllGigs.tsx
export const AllGigs = ({ user }: { user: any }) => (
  <GigSectionHeader
    title="🎵 All Available Gigs"
    description="Browse all available gigs in your area"
    user={user}
    type="all-gigs"
  />
);
