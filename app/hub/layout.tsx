// app/hub/layout.tsx
export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">{children}</div>
  );
}
