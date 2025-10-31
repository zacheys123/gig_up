import { PlaceholderSection } from "./PlaceholderSection";

export const PendingGigs = ({ user }: { user: any }) => (
  <PlaceholderSection
    title="⏳ Pending Applications"
    description="Gigs you've applied to - waiting for response"
    user={user}
    type="pending-gigs"
  />
);
