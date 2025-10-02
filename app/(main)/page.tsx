// app/page.tsx
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <div className="border border-border p-6 rounded-lg bg-background">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Theme Test Page
        </h1>
        <p className="text-muted-foreground mb-4">
          This is a test to see if the theme system works.
        </p>
        <ThemeToggle />
      </div>
    </div>
  );
}