// components/admin/AISuggestionsManager.tsx
"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { Save, RotateCcw } from "lucide-react";
import { api } from "@/convex/_generated/api";

export function AISuggestionsManager() {
  const [musicianQuestions, setMusicianQuestions] = useState([
    "How can I make my profile stand out to clients?",
    "What should I include in my performance portfolio?",
    "How do I price my services for different gig types?",
    "Tips for writing compelling gig applications",
    "How to build a strong reputation on gigUp?",
  ]);

  const [clientQuestions, setClientQuestions] = useState([
    "How do I write a clear gig description?",
    "What should I look for in musician profiles?",
    "How to budget for different event types?",
    "Best practices for communicating with musicians",
    "How to manage multiple gig bookings?",
  ]);

  const [guestQuestions, setGuestQuestions] = useState([
    "How does gigUppwork for musicians?",
    "What are the benefits of the Pro tier?",
    "How do I get started as a client?",
    "What's included in the free trial?",
  ]);

  const [updatesReady, setUpdatesReady] = useState(true);
  const [version, setVersion] = useState("1.0.0");

  const updateSuggestions = useMutation(
    api.controllers.subscription.updateAISuggestions,
  );

  const handleSave = async () => {
    try {
      await updateSuggestions({
        questions: {
          musician: musicianQuestions,
          client: clientQuestions,
          guest: guestQuestions,
        },
        updatesReady,
        version,
      });
      alert("AI suggestions updated successfully!");
    } catch (error) {
      alert("Error updating suggestions: " + error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">AI Suggestions Manager</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Musician Questions */}
        <div className="space-y-3">
          <h3 className="font-semibold">Musician Questions</h3>
          {musicianQuestions.map((question, index) => (
            <input
              key={index}
              type="text"
              value={question}
              onChange={(e) => {
                const newQuestions = [...musicianQuestions];
                newQuestions[index] = e.target.value;
                setMusicianQuestions(newQuestions);
              }}
              className="w-full p-2 border rounded text-sm"
            />
          ))}
        </div>

        {/* Client Questions */}
        <div className="space-y-3">
          <h3 className="font-semibold">Client Questions</h3>
          {clientQuestions.map((question, index) => (
            <input
              key={index}
              type="text"
              value={question}
              onChange={(e) => {
                const newQuestions = [...clientQuestions];
                newQuestions[index] = e.target.value;
                setClientQuestions(newQuestions);
              }}
              className="w-full p-2 border rounded text-sm"
            />
          ))}
        </div>

        {/* Guest Questions */}
        <div className="space-y-3">
          <h3 className="font-semibold">Guest Questions</h3>
          {guestQuestions.map((question, index) => (
            <input
              key={index}
              type="text"
              value={question}
              onChange={(e) => {
                const newQuestions = [...guestQuestions];
                newQuestions[index] = e.target.value;
                setGuestQuestions(newQuestions);
              }}
              className="w-full p-2 border rounded text-sm"
            />
          ))}
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={updatesReady}
            onChange={(e) => setUpdatesReady(e.target.checked)}
          />
          Make updates live immediately
        </label>

        <input
          type="text"
          placeholder="Version (e.g., 1.0.1)"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          className="p-2 border rounded"
        />

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  );
}
