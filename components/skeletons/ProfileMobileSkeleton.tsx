"use client";

import { cn } from "@/lib/utils";

interface CurrentUserProfileMobileSkeletonProps {
  colors: {
    background: string;
    card: string;
    border: string;
    text: string;
    textMuted: string;
    secondaryBackground: string;
  };
}

export function CurrentUserProfileMobileSkeleton({
  colors,
}: CurrentUserProfileMobileSkeletonProps) {
  return (
    <div className={cn("min-h-screen w-full py-4", colors.background)}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Profile Header - Matches your component structure */}
        <div
          className={cn(
            "rounded-2xl border p-6 mb-6 bg-gradient-to-br from-amber-500/5 to-purple-500/5",
            colors.card,
            colors.border,
            "animate-pulse"
          )}
        >
          <div className="flex flex-col items-center justify-between">
            <div className="flex items-center gap-4 mb-4 w-full">
              <div className="relative">
                <div
                  className={cn(
                    "w-20 h-20 rounded-full border-4 border-amber-400/30",
                    colors.secondaryBackground
                  )}
                ></div>
                <div
                  className={cn(
                    "absolute -bottom-2 -right-2 p-1.5 rounded-full",
                    colors.secondaryBackground
                  )}
                >
                  <div className="w-3 h-3 rounded bg-gray-400"></div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    "h-6 w-40 rounded mb-2",
                    colors.secondaryBackground
                  )}
                ></div>
                <div
                  className={cn(
                    "h-4 w-28 rounded mb-3",
                    colors.secondaryBackground
                  )}
                ></div>
                <div className="flex gap-2">
                  <div className="h-5 w-20 bg-amber-400 rounded-full"></div>
                  <div className="h-5 w-14 bg-purple-500 rounded-full"></div>
                </div>
              </div>
            </div>
            <div
              className={cn(
                "h-9 w-full max-w-[200px] rounded-lg",
                colors.secondaryBackground
              )}
            ></div>
          </div>
        </div>

        {/* Stats Overview - Single row for mobile */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className={cn(
                "rounded-xl p-3 text-center border transition-all",
                colors.card,
                colors.border,
                "animate-pulse"
              )}
            >
              <div
                className={cn(
                  "p-1.5 rounded-lg mx-auto w-10 mb-2",
                  colors.secondaryBackground
                )}
              >
                <div className="w-3 h-3 mx-auto rounded"></div>
              </div>
              <div
                className={cn(
                  "h-5 w-8 rounded mx-auto mb-1",
                  colors.secondaryBackground
                )}
              ></div>
              <div
                className={cn(
                  "h-3 w-14 rounded mx-auto",
                  colors.secondaryBackground
                )}
              ></div>
            </div>
          ))}
        </div>

        {/* Main Content - Single column for mobile */}
        <div className="space-y-4">
          {/* Performance Videos Section */}
          <div
            className={cn(
              "rounded-xl border p-4",
              colors.card,
              colors.border,
              "animate-pulse"
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div
                  className={cn("w-4 h-4 rounded", colors.secondaryBackground)}
                ></div>
                <div
                  className={cn("h-5 w-28 rounded", colors.secondaryBackground)}
                ></div>
              </div>
            </div>

            {/* Single video preview for mobile */}
            <div className="space-y-3">
              <div
                className={cn(
                  "aspect-video rounded-lg",
                  colors.secondaryBackground
                )}
              ></div>
              <div className="flex justify-between items-center">
                <div
                  className={cn(
                    "h-4 w-3/4 rounded",
                    colors.secondaryBackground
                  )}
                ></div>
                <div
                  className={cn("w-4 h-4 rounded", colors.secondaryBackground)}
                ></div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div
            className={cn(
              "rounded-xl border p-4",
              colors.card,
              colors.border,
              "animate-pulse"
            )}
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className={cn("w-4 h-4 rounded", colors.secondaryBackground)}
              ></div>
              <div
                className={cn("h-5 w-16 rounded", colors.secondaryBackground)}
              ></div>
            </div>
            <div
              className={cn("h-24 rounded-lg", colors.secondaryBackground)}
            ></div>
          </div>

          {/* Experience & Skills Section */}
          <div
            className={cn(
              "rounded-xl border p-4",
              colors.card,
              colors.border,
              "animate-pulse"
            )}
          >
            <div className="flex items-center gap-2 mb-4">
              <div
                className={cn("w-4 h-4 rounded", colors.secondaryBackground)}
              ></div>
              <div
                className={cn("h-5 w-36 rounded", colors.secondaryBackground)}
              ></div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <div
                  className={cn("h-3 w-24 rounded", colors.secondaryBackground)}
                ></div>
                <div
                  className={cn("h-9 rounded-lg", colors.secondaryBackground)}
                ></div>
              </div>

              <div className="space-y-1.5">
                <div
                  className={cn("h-3 w-28 rounded", colors.secondaryBackground)}
                ></div>
                <div
                  className={cn("h-9 rounded-lg", colors.secondaryBackground)}
                ></div>
              </div>

              <div className="space-y-1.5">
                <div
                  className={cn("h-3 w-20 rounded", colors.secondaryBackground)}
                ></div>
                <div className="flex flex-wrap gap-1.5">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className={cn(
                        "h-5 w-14 rounded-full",
                        colors.secondaryBackground
                      )}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div
            className={cn(
              "rounded-xl border p-4",
              colors.card,
              colors.border,
              "animate-pulse"
            )}
          >
            <div className="flex items-center gap-2 mb-4">
              <div
                className={cn("w-4 h-4 rounded", colors.secondaryBackground)}
              ></div>
              <div
                className={cn("h-5 w-36 rounded", colors.secondaryBackground)}
              ></div>
            </div>

            <div className="space-y-3">
              {["First Name", "Last Name", "Username"].map((label) => (
                <div key={label} className="space-y-1.5">
                  <div
                    className={cn(
                      "h-3 w-20 rounded",
                      colors.secondaryBackground
                    )}
                  ></div>
                  <div
                    className={cn("h-9 rounded-lg", colors.secondaryBackground)}
                  ></div>
                </div>
              ))}

              {/* Date of Birth */}
              <div className="space-y-1.5">
                <div
                  className={cn("h-3 w-24 rounded", colors.secondaryBackground)}
                ></div>
                <div className="flex gap-1.5">
                  <div
                    className={cn(
                      "h-9 flex-1 rounded-lg",
                      colors.secondaryBackground
                    )}
                  ></div>
                  <div
                    className={cn(
                      "h-9 flex-1 rounded-lg",
                      colors.secondaryBackground
                    )}
                  ></div>
                  <div
                    className={cn(
                      "h-9 flex-1 rounded-lg",
                      colors.secondaryBackground
                    )}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div
            className={cn(
              "rounded-xl border p-4",
              colors.card,
              colors.border,
              "animate-pulse"
            )}
          >
            <div className="flex items-center gap-2 mb-4">
              <div
                className={cn("w-4 h-4 rounded", colors.secondaryBackground)}
              ></div>
              <div
                className={cn("h-5 w-36 rounded", colors.secondaryBackground)}
              ></div>
            </div>

            <div className="space-y-3">
              {["Email", "Phone Number"].map((label) => (
                <div key={label} className="space-y-1.5">
                  <div
                    className={cn(
                      "h-3 w-24 rounded",
                      colors.secondaryBackground
                    )}
                  ></div>
                  <div
                    className={cn("h-9 rounded-lg", colors.secondaryBackground)}
                  ></div>
                </div>
              ))}
            </div>
          </div>

          {/* Rates Section */}
          <div
            className={cn(
              "rounded-xl border p-4",
              colors.card,
              colors.border,
              "animate-pulse"
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div
                  className={cn("w-4 h-4 rounded", colors.secondaryBackground)}
                ></div>
                <div
                  className={cn("h-5 w-28 rounded", colors.secondaryBackground)}
                ></div>
              </div>
              <div
                className={cn("w-4 h-4 rounded", colors.secondaryBackground)}
              ></div>
            </div>

            <div className="space-y-3">
              {["Regular Gigs", "Corporate Events"].map((label) => (
                <div key={label} className="space-y-1.5">
                  <div
                    className={cn(
                      "h-3 w-20 rounded",
                      colors.secondaryBackground
                    )}
                  ></div>
                  <div
                    className={cn("h-9 rounded-lg", colors.secondaryBackground)}
                  ></div>
                </div>
              ))}
            </div>
          </div>

          {/* Location Information Section */}
          <div
            className={cn(
              "rounded-xl border p-4",
              colors.card,
              colors.border,
              "animate-pulse"
            )}
          >
            <div className="flex items-center gap-2 mb-4">
              <div
                className={cn("w-4 h-4 rounded", colors.secondaryBackground)}
              ></div>
              <div
                className={cn("h-5 w-20 rounded", colors.secondaryBackground)}
              ></div>
            </div>

            <div className="space-y-3">
              {["City", "Address"].map((label) => (
                <div key={label} className="space-y-1.5">
                  <div
                    className={cn(
                      "h-3 w-12 rounded",
                      colors.secondaryBackground
                    )}
                  ></div>
                  <div
                    className={cn("h-9 rounded-lg", colors.secondaryBackground)}
                  ></div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Media Section */}
          <div
            className={cn(
              "rounded-xl border p-4",
              colors.card,
              colors.border,
              "animate-pulse"
            )}
          >
            <div className="flex items-center gap-2 mb-4">
              <div
                className={cn("w-4 h-4 rounded", colors.secondaryBackground)}
              ></div>
              <div
                className={cn("h-5 w-24 rounded", colors.secondaryBackground)}
              ></div>
            </div>

            <div className="space-y-2.5">
              {[1, 2].map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={cn(
                        "h-3 w-12 rounded",
                        colors.secondaryBackground
                      )}
                    ></div>
                    <div
                      className={cn(
                        "h-3 w-16 rounded",
                        colors.secondaryBackground
                      )}
                    ></div>
                  </div>
                  <div
                    className={cn(
                      "w-3 h-3 rounded",
                      colors.secondaryBackground
                    )}
                  ></div>
                </div>
              ))}
              <div
                className={cn(
                  "h-3 w-20 rounded mt-1.5",
                  colors.secondaryBackground
                )}
              ></div>
            </div>
          </div>

          {/* Account Type Section */}
          <div
            className={cn(
              "rounded-xl border p-4",
              colors.card,
              colors.border,
              "animate-pulse"
            )}
          >
            <div className="flex items-center gap-2 mb-4">
              <div
                className={cn("w-4 h-4 rounded", colors.secondaryBackground)}
              ></div>
              <div
                className={cn("h-5 w-24 rounded", colors.secondaryBackground)}
              ></div>
            </div>

            <div className="space-y-3">
              {["Musician Account", "Client Account"].map((label) => (
                <div key={label} className="flex items-center justify-between">
                  <div
                    className={cn(
                      "h-3 w-28 rounded",
                      colors.secondaryBackground
                    )}
                  ></div>
                  <div
                    className={cn(
                      "w-10 h-5 rounded-full",
                      colors.secondaryBackground
                    )}
                  ></div>
                </div>
              ))}
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-6">
              <div
                className={cn(
                  "h-9 w-28 rounded-lg",
                  colors.secondaryBackground
                )}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
