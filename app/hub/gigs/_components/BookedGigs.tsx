import { GigSectionHeader } from "./GigSectionHeader";

export const BookedGigs = ({ user }: { user: any }) => (
  <GigSectionHeader
    title="✅ Booked Gigs"
    description="Gigs you've successfully booked"
    user={user}
    type="booked-gigs"
  />
);
