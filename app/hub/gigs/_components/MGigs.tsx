import { GigSectionHeader } from "./GigSectionHeader";

export const MyGigs = ({ user }: { user: any }) => (
  <GigSectionHeader
    title="📋 My Posted Gigs"
    description="Manage gigs you've posted as a client"
    user={user}
    type="my-gigs"
  />
);
