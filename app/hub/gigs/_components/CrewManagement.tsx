import { PlaceholderSection } from "./PlaceholderSection";

// components/gigs/CrewManagement.tsx
export const CrewManagement = ({ user }: { user: any }) => (
  <PlaceholderSection
    title="👥 Crew Management"
    description="Manage musicians and build your crews"
    user={user}
    type="crew-management"
  />
);
