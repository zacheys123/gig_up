import { PlaceholderSection } from "./PlaceholderSection";

// components/gigs/ReviewedGigs.tsx
export const ReviewedGigs = ({ user }: { user: any }) => (
  <PlaceholderSection
    title="⭐ Reviewed Gigs"
    description="Gigs you've completed and reviewed"
    user={user}
    type="reviewed-gigs"
  />
);
