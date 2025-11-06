import { GigSectionHeader } from "./GigSectionHeader";

export const FavoriteGigs = ({ user }: { user: any }) => (
  <GigSectionHeader
    title="⭐ Favorite Gigs"
    description="Gigs you've marked as favorites"
    user={user}
    type="favorite-gigs"
  />
);
