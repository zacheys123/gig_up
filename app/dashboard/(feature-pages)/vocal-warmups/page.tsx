import { VocalWarmups } from "@/components/rolebased-features/vocalists/VocalWarmUps";

// In your VocalWarmupsPage, temporarily bypass the gate:
export default function VocalWarmupsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Vocal Warmups</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Professional vocal exercises and routines
        </p>
      </div>
      <VocalWarmups /> {/* Direct render without FeatureGated */}
    </div>
  );
}
