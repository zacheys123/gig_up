import { GigSectionHeader } from "./GigSectionHeader";

// components/gigs/ActiveProjects.tsx
export const ActiveProjects = ({ user }: { user: any }) => (
  <GigSectionHeader
    title="🚀 Active Projects"
    description="Events you're currently managing as a booker"
    user={user}
    type="active-projects"
  />
);
