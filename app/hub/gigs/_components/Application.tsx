import { GigSectionHeader } from "./GigSectionHeader";

// components/gigs/Applications.tsx
export const Applications = ({ user }: { user: any }) => (
  <GigSectionHeader
    title="⏳ My Applications"
    description="Gigs you've applied to as a booker"
    user={user}
    type="booker-applications"
  />
);
