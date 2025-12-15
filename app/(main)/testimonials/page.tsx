"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TestimonialCard } from "@/components/testimonials/TestmonialCard";
import { TestimonialForm } from "@/components/testimonials/TestimonialsForm";
import { useState } from "react";
import { Plus, Star, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TestimonialsPage() {
  const testimonials =
    useQuery(api.controllers.testimonials.getAllTestimonials) || [];
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");

  // Filter testimonials
  const filteredTestimonials = testimonials.filter((t) => {
    if (filter === "all") return true;
    if (filter === "featured") return t.featured;
    return t.userRole.toLowerCase().includes(filter.toLowerCase());
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">Real Stories, Real Impact</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Hear from musicians, venues, and bookers who found success on GigUpp
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          All Stories
        </Button>
        <Button
          variant={filter === "featured" ? "default" : "outline"}
          onClick={() => setFilter("featured")}
          className="gap-2"
        >
          <Star className="w-4 h-4" />
          Featured
        </Button>
        <Button
          variant={filter === "musician" ? "default" : "outline"}
          onClick={() => setFilter("musician")}
        >
          🎵 Musicians
        </Button>
        <Button
          variant={filter === "venue" ? "default" : "outline"}
          onClick={() => setFilter("venue")}
        >
          🏢 Venues
        </Button>
        <Button
          variant={filter === "booker" ? "default" : "outline"}
          onClick={() => setFilter("booker")}
        >
          👔 Bookers
        </Button>
      </div>

      {/* Testimonials Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {filteredTestimonials.map((testimonial) => (
          <TestimonialCard
            key={testimonial._id}
            testimonial={testimonial}
            featured={testimonial.featured}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredTestimonials.length === 0 && (
        <div className="text-center py-12">
          <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">No stories yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Be the first to share your GigUppexperience!
          </p>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Share Your Story
          </Button>
        </div>
      )}

      {/* Add Testimonial Section */}
      {showForm ? (
        <div className="mt-12">
          <TestimonialForm onSuccess={() => setShowForm(false)} />
        </div>
      ) : (
        <div className="mt-12 text-center p-8 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">Share Your Story</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Your experience could help other musicians, venues, and bookers find
            their perfect match. Share your journey and get featured on our
            homepage!
          </p>
          <Button
            onClick={() => setShowForm(true)}
            className="gap-2 px-8 py-6 text-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          >
            <Plus className="w-5 h-5" />
            Share Your Experience
          </Button>
        </div>
      )}
    </div>
  );
}
