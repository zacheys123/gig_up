"use client";
import { usegigUpAssistant } from "@/app/(ai)/usegigUpAssistant";

export default function TestAIPage() {
  const { questionUsage, tierLimits } = usegigUpAssistant();

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">AI Assistant Test</h1>

      <div className="space-y-4">
        <div>
          <h2 className="font-semibold">Current Usage:</h2>
          <p>Used: {questionUsage.used}</p>
          <p>Limit: {questionUsage.limit}</p>
          <p>Can Ask: {questionUsage.canAsk ? "Yes" : "No"}</p>
        </div>

        <div>
          <h2 className="font-semibold">Tier Limits:</h2>
          <pre>{JSON.stringify(tierLimits, null, 2)}</pre>
        </div>

        <button
          onClick={() => localStorage.clear()}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Clear Local Storage
        </button>
      </div>
    </div>
  );
}
