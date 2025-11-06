import { GigSectionHeader } from "./GigSectionHeader";

export const PendingGigs = ({ user }: { user: any }) => (
  <GigSectionHeader
    title="⏳ Pending Applications"
    description="Gigs you've applied to - waiting for response"
    user={user}
    type="pending-gigs"
  />
);
