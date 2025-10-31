import { PlaceholderSection } from "./PlaceholderSection";

export const BookedGigs = ({ user }: { user: any }) => (
  <PlaceholderSection
    title="✅ Booked Gigs"
    description="Gigs you've successfully booked"
    user={user}
    type="booked-gigs"
  />
);
