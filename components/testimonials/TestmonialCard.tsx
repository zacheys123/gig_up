"use client";
import { Star, User, MapPin, Calendar, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestimonialCardProps {
  testimonial: {
    userName: string;
    userRole: string;
    userCity: string;
    rating: number;
    content: string;
    stats: {
      bookings: number;
      earnings: string;
      joinedDate: string;
    };
  };
  featured?: boolean;
}

export function TestimonialCard({
  testimonial,
  featured = false,
}: TestimonialCardProps) {
  return (
    <div
      className={cn(
        "p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]",
        featured
          ? "bg-gradient-to-br from-amber-50/50 to-orange-50/30 border-amber-200/50"
          : "bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">
              {testimonial.userName}
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {testimonial.userRole}
              </span>
              <span className="text-gray-400">•</span>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="text-gray-600 dark:text-gray-400">
                  {testimonial.userCity}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-4 h-4",
                i < testimonial.rating
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-gray-300 dark:text-gray-600"
              )}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <p className="text-gray-700 dark:text-gray-300 italic mb-6">
        "{testimonial.content}"
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-1">
            <Calendar className="w-3 h-3" />
            <span>Bookings</span>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {testimonial.stats.bookings}
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-1">
            <DollarSign className="w-3 h-3" />
            <span>Earned</span>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {testimonial.stats.earnings}
          </div>
        </div>

        <div className="text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Since
          </div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {testimonial.stats.joinedDate}
          </div>
        </div>
      </div>

      {/* Featured Badge */}
      {featured && (
        <div className="absolute -top-2 -right-2">
          <div className="px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full">
            Featured
          </div>
        </div>
      )}
    </div>
  );
}
