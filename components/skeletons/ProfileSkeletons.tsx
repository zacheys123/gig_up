"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CurrentUserProfileSkeletonProps {
  colors: {
    background: string;
    card: string;
    border: string;
    text: string;
    textMuted: string;
    secondaryBackground: string;
  };
}

export function CurrentUserProfileSkeleton({
  colors,
}: CurrentUserProfileSkeletonProps) {
  return (
    // Add top margin to account for the navbar
    <div
      className={cn(
        "min-h-screen w-full py-4 lg:py-8",
        "lg:-ml-7 lg:-mt-[950px] relative"
      )}
    >
      <div className="absolute h-full w-full overflow-auto lg:static">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header Skeleton */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "rounded-2xl border p-6 sm:p-8 mb-6 sm:mb-8 bg-gradient-to-br from-amber-500/5 to-purple-500/5",
              colors.card,
              colors.border,
              "animate-pulse"
            )}
          >
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center gap-4 sm:gap-6 mb-6 md:mb-0">
                <div className="relative">
                  <div
                    className={cn(
                      "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border-4 border-amber-400/30",
                      colors.secondaryBackground
                    )}
                  ></div>
                  <div
                    className={cn(
                      "absolute -bottom-2 -right-2 p-1.5 sm:p-2 rounded-full",
                      colors.secondaryBackground
                    )}
                  >
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-gray-400"></div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      "h-6 sm:h-7 md:h-8 w-32 sm:w-40 md:w-48 rounded mb-2",
                      colors.secondaryBackground
                    )}
                  ></div>
                  <div
                    className={cn(
                      "h-3 sm:h-4 w-24 sm:w-28 md:w-32 rounded mb-3",
                      colors.secondaryBackground
                    )}
                  ></div>
                  <div className="flex gap-2 flex-wrap">
                    <div className="h-5 sm:h-6 w-16 sm:w-20 bg-amber-400 rounded-full"></div>
                    <div className="h-5 sm:h-6 w-12 sm:w-16 bg-purple-500 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div
                className={cn(
                  "h-9 sm:h-10 w-32 sm:w-36 md:w-40 rounded-lg",
                  colors.secondaryBackground
                )}
              ></div>
            </div>
          </motion.div>

          {/* Stats Overview Skeleton */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
          >
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className={cn(
                  "rounded-xl p-3 sm:p-4 text-center border transition-all",
                  colors.card,
                  colors.border,
                  "animate-pulse"
                )}
              >
                <div
                  className={cn(
                    "p-1.5 sm:p-2 rounded-lg mx-auto w-10 sm:w-12 mb-2",
                    colors.secondaryBackground
                  )}
                >
                  <div className="w-3 h-3 sm:w-4 sm:h-4 mx-auto rounded"></div>
                </div>
                <div
                  className={cn(
                    "h-5 sm:h-6 w-6 sm:w-8 rounded mx-auto mb-1",
                    colors.secondaryBackground
                  )}
                ></div>
                <div
                  className={cn(
                    "h-3 sm:h-4 w-12 sm:w-16 rounded mx-auto",
                    colors.secondaryBackground
                  )}
                ></div>
              </div>
            ))}
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Performance Videos Section Skeleton */}
              <div
                className={cn(
                  "rounded-xl border p-4 sm:p-6",
                  colors.card,
                  colors.border,
                  "animate-pulse"
                )}
              >
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div
                      className={cn(
                        "w-4 h-4 sm:w-5 sm:h-5 rounded",
                        colors.secondaryBackground
                      )}
                    ></div>
                    <div
                      className={cn(
                        "h-5 sm:h-6 w-24 sm:w-32 rounded",
                        colors.secondaryBackground
                      )}
                    ></div>
                  </div>
                </div>

                {/* Video Grid Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {[1, 2].map((item) => (
                    <div key={item} className="space-y-2 sm:space-y-3">
                      <div
                        className={cn(
                          "aspect-video rounded-lg",
                          colors.secondaryBackground
                        )}
                      ></div>
                      <div className="flex justify-between items-center">
                        <div
                          className={cn(
                            "h-3 sm:h-4 w-3/4 rounded",
                            colors.secondaryBackground
                          )}
                        ></div>
                        <div
                          className={cn(
                            "w-4 h-4 sm:w-5 sm:h-5 rounded",
                            colors.secondaryBackground
                          )}
                        ></div>
                      </div>
                      <div
                        className={cn(
                          "h-3 sm:h-4 w-1/2 rounded",
                          colors.secondaryBackground
                        )}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* About Section Skeleton */}
              <div
                className={cn(
                  "rounded-xl border p-4 sm:p-6",
                  colors.card,
                  colors.border,
                  "animate-pulse"
                )}
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div
                    className={cn(
                      "w-4 h-4 sm:w-5 sm:h-5 rounded",
                      colors.secondaryBackground
                    )}
                  ></div>
                  <div
                    className={cn(
                      "h-5 sm:h-6 w-16 sm:w-20 rounded",
                      colors.secondaryBackground
                    )}
                  ></div>
                </div>
                <div
                  className={cn(
                    "h-24 sm:h-32 rounded-lg",
                    colors.secondaryBackground
                  )}
                ></div>
              </div>

              {/* Experience & Skills Section Skeleton */}
              <div
                className={cn(
                  "rounded-xl border p-4 sm:p-6",
                  colors.card,
                  colors.border,
                  "animate-pulse"
                )}
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div
                    className={cn(
                      "w-4 h-4 sm:w-5 sm:h-5 rounded",
                      colors.secondaryBackground
                    )}
                  ></div>
                  <div
                    className={cn(
                      "h-5 sm:h-6 w-32 sm:w-40 rounded",
                      colors.secondaryBackground
                    )}
                  ></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <div
                      className={cn(
                        "h-3 sm:h-4 w-20 sm:w-24 rounded",
                        colors.secondaryBackground
                      )}
                    ></div>
                    <div
                      className={cn(
                        "h-9 sm:h-10 rounded-lg",
                        colors.secondaryBackground
                      )}
                    ></div>
                  </div>

                  <div className="space-y-2">
                    <div
                      className={cn(
                        "h-3 sm:h-4 w-24 sm:w-28 rounded",
                        colors.secondaryBackground
                      )}
                    ></div>
                    <div
                      className={cn(
                        "h-9 sm:h-10 rounded-lg",
                        colors.secondaryBackground
                      )}
                    ></div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <div
                      className={cn(
                        "h-3 sm:h-4 w-16 sm:w-20 rounded",
                        colors.secondaryBackground
                      )}
                    ></div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {[1, 2, 3].map((item) => (
                        <div
                          key={item}
                          className={cn(
                            "h-5 sm:h-6 w-12 sm:w-16 rounded-full",
                            colors.secondaryBackground
                          )}
                        ></div>
                      ))}
                      <div
                        className={cn(
                          "h-5 sm:h-6 w-16 sm:w-20 rounded-full",
                          colors.secondaryBackground
                        )}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4 sm:space-y-6">
              {/* Personal Information Section Skeleton */}
              <div
                className={cn(
                  "rounded-xl border p-4 sm:p-6",
                  colors.card,
                  colors.border,
                  "animate-pulse"
                )}
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div
                    className={cn(
                      "w-4 h-4 sm:w-5 sm:h-5 rounded",
                      colors.secondaryBackground
                    )}
                  ></div>
                  <div
                    className={cn(
                      "h-5 sm:h-6 w-32 sm:w-40 rounded",
                      colors.secondaryBackground
                    )}
                  ></div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {["First Name", "Last Name", "Username"].map((label) => (
                    <div key={label} className="space-y-1.5 sm:space-y-2">
                      <div
                        className={cn(
                          "h-3 sm:h-4 w-16 sm:w-20 rounded",
                          colors.secondaryBackground
                        )}
                      ></div>
                      <div
                        className={cn(
                          "h-9 sm:h-10 rounded-lg",
                          colors.secondaryBackground
                        )}
                      ></div>
                    </div>
                  ))}

                  {/* Date of Birth Skeleton */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <div
                      className={cn(
                        "h-3 sm:h-4 w-20 sm:w-24 rounded",
                        colors.secondaryBackground
                      )}
                    ></div>
                    <div className="flex gap-1.5 sm:gap-2">
                      <div
                        className={cn(
                          "h-9 sm:h-10 flex-1 rounded-lg",
                          colors.secondaryBackground
                        )}
                      ></div>
                      <div
                        className={cn(
                          "h-9 sm:h-10 flex-1 rounded-lg",
                          colors.secondaryBackground
                        )}
                      ></div>
                      <div
                        className={cn(
                          "h-9 sm:h-10 flex-1 rounded-lg",
                          colors.secondaryBackground
                        )}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information Section Skeleton */}
              <div
                className={cn(
                  "rounded-xl border p-4 sm:p-6",
                  colors.card,
                  colors.border,
                  "animate-pulse"
                )}
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div
                    className={cn(
                      "w-4 h-4 sm:w-5 sm:h-5 rounded",
                      colors.secondaryBackground
                    )}
                  ></div>
                  <div
                    className={cn(
                      "h-5 sm:h-6 w-32 sm:w-40 rounded",
                      colors.secondaryBackground
                    )}
                  ></div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {["Email", "Phone Number"].map((label) => (
                    <div key={label} className="space-y-1.5 sm:space-y-2">
                      <div
                        className={cn(
                          "h-3 sm:h-4 w-20 sm:w-24 rounded",
                          colors.secondaryBackground
                        )}
                      ></div>
                      <div
                        className={cn(
                          "h-9 sm:h-10 rounded-lg",
                          colors.secondaryBackground
                        )}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rates Section Skeleton */}
              <div
                className={cn(
                  "rounded-xl border p-4 sm:p-6",
                  colors.card,
                  colors.border,
                  "animate-pulse"
                )}
              >
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div
                      className={cn(
                        "w-4 h-4 sm:w-5 sm:h-5 rounded",
                        colors.secondaryBackground
                      )}
                    ></div>
                    <div
                      className={cn(
                        "h-5 sm:h-6 w-24 sm:w-32 rounded",
                        colors.secondaryBackground
                      )}
                    ></div>
                  </div>
                  <div
                    className={cn(
                      "w-4 h-4 sm:w-5 sm:h-5 rounded",
                      colors.secondaryBackground
                    )}
                  ></div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {[
                    "Regular Gigs",
                    "Corporate Events",
                    "Concerts",
                    "Special Functions",
                  ].map((label) => (
                    <div key={label} className="space-y-1.5 sm:space-y-2">
                      <div
                        className={cn(
                          "h-3 sm:h-4 w-24 sm:w-28 rounded",
                          colors.secondaryBackground
                        )}
                      ></div>
                      <div
                        className={cn(
                          "h-9 sm:h-10 rounded-lg",
                          colors.secondaryBackground
                        )}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location Information Section Skeleton */}
              <div
                className={cn(
                  "rounded-xl border p-4 sm:p-6",
                  colors.card,
                  colors.border,
                  "animate-pulse"
                )}
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div
                    className={cn(
                      "w-4 h-4 sm:w-5 sm:h-5 rounded",
                      colors.secondaryBackground
                    )}
                  ></div>
                  <div
                    className={cn(
                      "h-5 sm:h-6 w-20 sm:w-24 rounded",
                      colors.secondaryBackground
                    )}
                  ></div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {["City", "Address"].map((label) => (
                    <div key={label} className="space-y-1.5 sm:space-y-2">
                      <div
                        className={cn(
                          "h-3 sm:h-4 w-12 sm:w-16 rounded",
                          colors.secondaryBackground
                        )}
                      ></div>
                      <div
                        className={cn(
                          "h-9 sm:h-10 rounded-lg",
                          colors.secondaryBackground
                        )}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Media Section Skeleton */}
              <div
                className={cn(
                  "rounded-xl border p-4 sm:p-6",
                  colors.card,
                  colors.border,
                  "animate-pulse"
                )}
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div
                    className={cn(
                      "w-4 h-4 sm:w-5 sm:h-5 rounded",
                      colors.secondaryBackground
                    )}
                  ></div>
                  <div
                    className={cn(
                      "h-5 sm:h-6 w-24 sm:w-28 rounded",
                      colors.secondaryBackground
                    )}
                  ></div>
                </div>

                <div className="space-y-2.5 sm:space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div
                          className={cn(
                            "h-3 sm:h-4 w-12 sm:w-16 rounded",
                            colors.secondaryBackground
                          )}
                        ></div>
                        <div
                          className={cn(
                            "h-3 sm:h-4 w-16 sm:w-20 rounded",
                            colors.secondaryBackground
                          )}
                        ></div>
                      </div>
                      <div
                        className={cn(
                          "w-3 h-3 sm:w-4 sm:h-4 rounded",
                          colors.secondaryBackground
                        )}
                      ></div>
                    </div>
                  ))}
                  <div
                    className={cn(
                      "h-3 sm:h-4 w-20 sm:w-24 rounded mt-1.5 sm:mt-2",
                      colors.secondaryBackground
                    )}
                  ></div>
                </div>
              </div>

              {/* Account Type Section Skeleton */}
              <div
                className={cn(
                  "rounded-xl border p-4 sm:p-6",
                  colors.card,
                  colors.border,
                  "animate-pulse"
                )}
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div
                    className={cn(
                      "w-4 h-4 sm:w-5 sm:h-5 rounded",
                      colors.secondaryBackground
                    )}
                  ></div>
                  <div
                    className={cn(
                      "h-5 sm:h-6 w-24 sm:w-28 rounded",
                      colors.secondaryBackground
                    )}
                  ></div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {["Musician Account", "Client Account"].map((label) => (
                    <div
                      key={label}
                      className="flex items-center justify-between"
                    >
                      <div
                        className={cn(
                          "h-3 sm:h-4 w-28 sm:w-32 rounded",
                          colors.secondaryBackground
                        )}
                      ></div>
                      <div
                        className={cn(
                          "w-10 h-5 sm:w-12 sm:h-6 rounded-full",
                          colors.secondaryBackground
                        )}
                      ></div>
                    </div>
                  ))}
                </div>

                {/* Save Button Skeleton */}
                <div className="flex justify-end mt-6 sm:mt-8">
                  <div
                    className={cn(
                      "h-9 sm:h-10 w-28 sm:w-32 rounded-lg",
                      colors.secondaryBackground
                    )}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CurrentUserProfileSkeleton;
