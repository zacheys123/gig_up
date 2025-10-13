// app/(ai)/layout.tsx
export default function AiLayout({
  children,
  ai,
}: {
  children: React.ReactNode;
  ai: React.ReactNode;
}) {
  return (
    <>
      {children}
      {ai}
    </>
  );
}
