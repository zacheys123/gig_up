import { GigSectionHeader } from "./GigSectionHeader";

// components/gigs/CrewManagement.tsx
export const CrewManagement = ({ user }: { user: any }) => (
  <GigSectionHeader
    title="👥 Crew Management"
    description="Manage musicians and build your crews"
    user={user}
    type="crew-management"
  />
);
