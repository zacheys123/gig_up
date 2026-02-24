"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Star, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface TestimonialFormProps {
  onSuccess?: () => void;
}

export function TestimonialForm({ onSuccess }: TestimonialFormProps) {
  const { user } = useUser();
  const { user: currentUser } = useCurrentUser();

  const createTestimonial = useMutation(
    api.controllers.testimonials.createTestimonial,
  );

  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userCity, setUserCity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in", {
        description: "You need to be signed in to share a testimonial",
      });
      return;
    }

    if (!content.trim() || content.length < 10) {
      toast.error("Story too short", {
        description: "Please share more about your experience",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // In your TestimonialForm handleSubmit function:
      await createTestimonial({
        userId: user.id,
        userName: user.firstName || user.username || "Anonymous",
        userRole: userRole || "User",
        userCity: userCity || "Unknown",
        rating,
        content,
        stats: {
          bookings: currentUser?.completedGigsCount || 0, // Use real data
          earnings: currentUser?.earnings ? currentUser?.earnings : 0, // Use real data
          joinedDate: currentUser?._creationTime
            ? new Date(currentUser._creationTime).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
        },
      });

      toast.success("Thank you!", {
        description: "Your story has been shared with the community",
      });

      setContent("");
      setUserRole("");
      setUserCity("");
      onSuccess?.();
    } catch (error) {
      toast.error("Error", {
        description: "Failed to submit testimonial. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Share Your Experience</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Help others by sharing your gigUpp journey
        </p>
      </div>

      {/* Rating */}
      <div>
        <label className="block mb-2 font-medium">Your Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="text-xl hover:scale-110 transition-transform"
              disabled={isSubmitting}
            >
              <Star
                className={`${
                  star <= rating
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-gray-300 dark:text-gray-600"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Testimonial */}
      <div>
        <label className="block mb-2 font-medium">Your Story</label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your experience with gigUp. How has it helped your career or event?"
          className="min-h-[120px]"
          disabled={isSubmitting}
          required
        />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {content.length}/500 characters
        </p>
      </div>

      {/* Role & City */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 font-medium">Your Role</label>
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800"
            disabled={isSubmitting}
          >
            <option value="">Select your role</option>
            <option value="Musician">Musician / Instrumentalist</option>
            <option value="Teacher">Music Teacher</option>
            <option value="Vocalist">Vocalist</option>
            <option value="DJ">DJ</option>
            <option value="Mc">Mc</option>
            <option value="Client">Event Planner / Client</option>
            <option value="Venue">Venue Owner</option>
            <option value="Booker">Talent Booker</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">Your City</label>
          <Input
            type="text"
            value={userCity}
            onChange={(e) => setUserCity(e.target.value)}
            placeholder="e.g., Nairobi, Na"
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting || !content.trim()}
        className="w-full py-6 text-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Sharing...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Share Your Story
          </div>
        )}
      </Button>

      <p className="text-sm text-center text-gray-500 dark:text-gray-400">
        By sharing your story, you agree to have it featured on gigUp.
      </p>
    </form>
  );
}
