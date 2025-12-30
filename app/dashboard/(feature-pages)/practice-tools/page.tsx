import { PracticeTools } from "@/components/rolebased-features/instrumentalists/PracticeTools";

export default function PracticeToolsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Practice Tools Warmups</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Professional vocal exercises and routines
        </p>
      </div>
      <PracticeTools /> {/* Direct render without FeatureGated */}
    </div>
  );
}
