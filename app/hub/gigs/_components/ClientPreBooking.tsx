import { GigSectionHeader } from "./GigSectionHeader";

// components/gigs/ClientPreBooking.tsx
export const ClientPreBooking = ({ user }: { user: any }) => (
  <GigSectionHeader
    title="👥 Pre-Booking Management"
    description="Review applicants for your gigs"
    user={user}
    type="pre-booking"
  />
);
