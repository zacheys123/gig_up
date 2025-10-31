import { PlaceholderSection } from "./PlaceholderSection";

// components/gigs/Applications.tsx
export const Applications = ({ user }: { user: any }) => (
  <PlaceholderSection
    title="⏳ My Applications"
    description="Gigs you've applied to as a booker"
    user={user}
    type="booker-applications"
  />
);
