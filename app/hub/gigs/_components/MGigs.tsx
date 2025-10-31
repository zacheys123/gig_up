import { PlaceholderSection } from "./PlaceholderSection";

export const MyGigs = ({ user }: { user: any }) => (
  <PlaceholderSection
    title="📋 My Posted Gigs"
    description="Manage gigs you've posted as a client"
    user={user}
    type="my-gigs"
  />
);
