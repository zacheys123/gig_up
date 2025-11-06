import React from "react";
import { PlaceholderSection } from "./PlaceholderSection";

export const InstantGigs = ({ user }: { user: any }) => {
  return (
    <PlaceholderSection
      title="📋 Create urgent gigs"
      description="Create gigs that are urgent to you and choose a musician for that"
      user={user}
      type="urgent-gigs"
    />
  );
};
