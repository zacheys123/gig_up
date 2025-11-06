import React from "react";
import { GigSectionHeader } from "./GigSectionHeader";

export const GigInvites = ({ user }: { user: any }) => {
  return (
    <GigSectionHeader
      title="📋 All gigs im invited"
      description="Manage gigs you've been invited to or invited someone"
      user={user}
      type="my-invites"
    />
  );
};
