import { PlaceholderSection } from "./PlaceholderSection";

export const PaymentHistory = ({ user }: { user: any }) => (
  <PlaceholderSection
    title="💰 Payment History"
    description="Track your earnings and payments"
    user={user}
    type="payment-history"
  />
);
