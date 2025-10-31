import { PlaceholderSection } from "./PlaceholderSection";

export const FavoriteGigs = ({ user }: { user: any }) => (
  <PlaceholderSection
    title="⭐ Favorite Gigs"
    description="Gigs you've marked as favorites"
    user={user}
    type="favorite-gigs"
  />
);
