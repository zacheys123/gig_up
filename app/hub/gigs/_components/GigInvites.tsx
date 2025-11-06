import React from "react";
import { PlaceholderSection } from "./PlaceholderSection";

export const GigInvites = ({ user }: { user: any }) => {
  return (
    <PlaceholderSection
      title="📋 All gigs im invited"
      description="Manage gigs you've been invited to or invited someone"
      user={user}
      type="my-invites"
    />
  );
};
