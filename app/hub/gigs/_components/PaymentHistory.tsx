import { GigSectionHeader } from "./GigSectionHeader";

export const PaymentHistory = ({ user }: { user: any }) => (
  <GigSectionHeader
    title="💰 Payment History"
    description="Track your earnings and payments"
    user={user}
    type="payment-history"
  />
);
