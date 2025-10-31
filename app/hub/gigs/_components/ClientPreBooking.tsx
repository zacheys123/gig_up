import { PlaceholderSection } from "./PlaceholderSection";

// components/gigs/ClientPreBooking.tsx
export const ClientPreBooking = ({ user }: { user: any }) => (
  <PlaceholderSection
    title="👥 Pre-Booking Management"
    description="Review applicants for your gigs"
    user={user}
    type="pre-booking"
  />
);
