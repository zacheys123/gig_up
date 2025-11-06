import { GigSectionHeader } from "./GigSectionHeader";

// components/gigs/ReviewedGigs.tsx
export const ReviewedGigs = ({ user }: { user: any }) => (
  <GigSectionHeader
    title="⭐ Reviewed Gigs"
    description="Gigs you've completed and reviewed"
    user={user}
    type="reviewed-gigs"
  />
);
