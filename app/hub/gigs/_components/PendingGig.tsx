// components/gigs/PendingGigs.tsx

import { PendingGigsManager } from "./PendingGigsManger";

export const PendingGig = ({ user }: { user: any }) => (
  <div className="container mx-auto px-4 py-8">
    <PendingGigsManager initialUser={user} />
  </div>
);
