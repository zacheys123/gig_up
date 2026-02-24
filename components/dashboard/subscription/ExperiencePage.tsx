"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";

import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle, Video, Quote } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const ExperiencegigUpPage = () => {
  const { userId } = useAuth();
  const { currentUser: user } = useCurrentUser();
  const [loading, setLoading] = useState(true);
  const tier = user?.tier || "free";
  const isPro = tier !== "free";

  useEffect(() => {
    if (user !== undefined) {
      const timeout = setTimeout(() => setLoading(false), 700);
      return () => clearTimeout(timeout);
    }
  }, [user]);

  const perks = useMemo(() => {
    if (user?.isMusician) {
      return isPro
        ? [
            "Unlimited gig applications",
            "Featured profile in search",
            "Priority in client searches",
            "Advanced analytics dashboard",
            "Direct booking options",
            "Unlimited messaging",
          ]
        : [
            "Book up to 2 gigs per week",
            "Limited messages (50/month)",
            "Basic performance analytics",
            "Access limited to 30 days",
          ];
    }
    if (user?.isClient) {
      return isPro
        ? [
            "Unlimited gig postings",
            "Featured listing placement",
            "Advanced search filters",
            "Verified musician access",
            "Booking management tools",
            "Unlimited messaging",
            "Dedicated support",
            "Schedule gigs (automatic, recurring, and more)",
          ]
        : [
            "Post up to 2 gigs per week",
            "Browse musician profiles and reviews",
            "Limited messages (50/month)",
            "Basic access for 30 days",
            "No scheduling of gigs",
          ];
    }
    return [];
  }, [user?.isMusician, user?.isClient, isPro]);

  const proOnlyPerks = useMemo(() => {
    if (user?.isMusician) {
      return [
        "Get discovered by top-tier clients",
        "Access to exclusive premium gigs",
        "Your own branded portfolio page",
        "Direct payments integration",
      ];
    }
    if (user?.isClient) {
      return [
        "White-glove support with a dedicated agent",
        "Ability to schedule recurring gigs",
        "Access to premium-only verified musicians",
        "Performance-based artist recommendations",
      ];
    }
    return [];
  }, [user?.isMusician, user?.isClient]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white px-4 py-8 md:px-6 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-5xl mx-auto"
      >
        <h1 className="text-3xl md:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-purple-400 to-yellow-400 text-center md:text-left">
          Welcome to gigUppExperience
        </h1>

        {loading ? (
          <div className="animate-pulse space-y-6">
            <div className="w-full h-[250px] md:h-[450px] bg-white/10 rounded-lg"></div>
            <div className="h-6 bg-white/10 rounded w-1/2"></div>
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
            <div className="h-4 bg-white/10 rounded w-2/3"></div>
            <div className="h-4 bg-white/10 rounded w-5/6"></div>
          </div>
        ) : (
          <>
            {/* How it Works */}
            <section className="mb-12">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Video className="w-6 h-6" />
                How gigUppWorks
              </h2>
              <div className="rounded-xl overflow-hidden shadow-xl border border-white/10">
                <video
                  controls
                  className="w-full h-[250px] md:h-[450px] object-cover"
                  src="https://res.cloudinary.com/dsziq73cb/video/upload/v1742941037/gigmeUpload/pu3aioizpuqnbawnirwh.mp4"
                  poster="/images/demo-cover.jpg"
                />
              </div>
            </section>

            {/* Booking Info */}
            <section className="mb-12 space-y-4 text-sm md:text-base text-gray-300">
              <h2 className="text-xl font-bold mb-2">Booking a Gig</h2>
              <p>
                Browse artist profiles, explore videos, and select the right
                performer for your event. Hit{" "}
                <strong> {`{"Book Now"} and you're already there`}</strong> .
              </p>
              <p>
                {`Artists/Talent or Musicians can accept or decline requests.
                You'll receive instant notifications and manage all bookings in
                your dashboard.`}
              </p>
              <p>
                You can choose the gig but you cannot book yourself the client
                chooses the best among ten of you,being in a pro pack allows you
                to be among the top rated .
              </p>
              <p>gigUp🎸🎹 Simple. Elegant. Fast.</p>
            </section>

            {/* Tier Perks */}
            <section className="mb-12">
              <h2 className="text-xl font-bold mb-4">
                Your Plan:{" "}
                <span className="bg-gradient-to-r from-purple-400 via-emerald-400 to-yellow-400 bg-clip-text text-transparent uppercase">
                  {tier}
                </span>
              </h2>
              <div className="bg-white/5 p-6 rounded-lg border border-white/10 shadow-lg">
                <ul className="space-y-3">
                  {perks.map((perk, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-white/90"
                    >
                      <CheckCircle className="w-5 h-5 text-teal-300" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {!isPro && (
              <div className="text-center mt-10">
                <Link
                  href="/dashboard/billing"
                  className="inline-block px-6 py-4 bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-400 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform duration-200"
                >
                  Upgrade to Pro & Unlock More
                </Link>
              </div>
            )}

            {/* Comprehensive Perks Section */}
            <section className="mt-20">
              <h2 className="text-3xl font-extrabold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
                Detailed Plan Benefits
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                {/* Musician Perks */}
                <div className="bg-gradient-to-br from-[#1e1b4b]/80 to-[#312e81]/80 p-6 rounded-2xl border border-indigo-400/20 shadow-xl">
                  <h3 className="text-xl font-bold mb-4 text-indigo-200 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <path d="M9 18V5l12-2v13"></path>
                      <circle cx="6" cy="18" r="3"></circle>
                      <circle cx="18" cy="16" r="3"></circle>
                    </svg>
                    For Musicians
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-indigo-300 mb-2">
                        PRO TIER INCLUDES:
                      </h4>
                      <ul className="space-y-2">
                        {[
                          "Unlimited gig applications",
                          "Featured profile in search",
                          "Priority in client searches",
                          "Advanced analytics dashboard",
                          "Direct booking options",
                          "Unlimited messaging",
                          "Get discovered by top-tier clients",
                          "Access to exclusive premium gigs",
                          "Your own branded portfolio page",
                          "Direct payments integration",
                        ].map((perk, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="flex-shrink-0 w-4 h-4 mt-0.5 text-emerald-400" />
                            <span className="text-white/90 text-sm">
                              {perk}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-4 border-t border-indigo-400/20">
                      <h4 className="font-semibold text-sm text-indigo-300 mb-2">
                        FREE TIER INCLUDES:
                      </h4>
                      <ul className="space-y-2">
                        {[
                          "Book up to 2 gigs per week",
                          "Limited messages (50/month)",
                          "Basic performance analytics",
                          "Access limited to 30 days",
                        ].map((perk, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="flex-shrink-0 w-4 h-4 mt-0.5 text-blue-300" />
                            <span className="text-white/80 text-sm">
                              {perk}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Client Perks */}
                <div className="bg-gradient-to-br from-[#1e1b4b]/80 to-[#312e81]/80 p-6 rounded-2xl border border-purple-400/20 shadow-xl">
                  <h3 className="text-xl font-bold mb-4 text-purple-200 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    For Clients
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-purple-300 mb-2">
                        PRO TIER INCLUDES:
                      </h4>
                      <ul className="space-y-2">
                        {[
                          "Unlimited gig postings",
                          "Featured listing placement",
                          "Advanced search filters",
                          "Verified musician access",
                          "Booking management tools",
                          "Unlimited messaging",
                          "Dedicated support",
                          "Schedule gigs (automatic, recurring, and more)",
                          "White-glove support with a dedicated agent",
                          "Ability to schedule recurring gigs",
                          "Access to premium-only verified musicians",
                          "Performance-based artist recommendations",
                        ].map((perk, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="flex-shrink-0 w-4 h-4 mt-0.5 text-emerald-400" />
                            <span className="text-white/90 text-sm">
                              {perk}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-4 border-t border-purple-400/20">
                      <h4 className="font-semibold text-sm text-purple-300 mb-2">
                        FREE TIER INCLUDES:
                      </h4>
                      <ul className="space-y-2">
                        {[
                          "Post up to 2 gigs per week",
                          "Browse musician profiles and reviews",
                          "Limited messages (50/month)",
                          "Basic access for 30 days",
                          "No scheduling of gigs",
                        ].map((perk, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="flex-shrink-0 w-4 h-4 mt-0.5 text-blue-300" />
                            <span className="text-white/80 text-sm">
                              {perk}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {!isPro && (
                <div className="text-center mt-6">
                  <Link
                    href="/dashboard/billing"
                    className="inline-block px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    Upgrade Now for Full Benefits
                  </Link>
                </div>
              )}
            </section>

            {/* Pro-Only Perks */}
            <section className="mt-20">
              <h2 className="text-3xl font-extrabold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500">
                Unlock the Power of Pro
              </h2>
              <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 px-1 pb-6 no-scrollbar">
                {proOnlyPerks.map((item, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-[280px] md:w-[320px] break-words whitespace-normal backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl rounded-2xl p-6 snap-center transition hover:scale-[1.02]"
                  >
                    <CheckCircle className="w-6 h-6 text-yellow-300 mb-4" />
                    <p className="text-lg font-medium text-white/90">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Testimonials */}
            <section className="mt-24">
              <h2 className="text-3xl font-extrabold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-400">
                What Our Users Say
              </h2>
              <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 px-1 pb-6 no-scrollbar">
                {[
                  {
                    name: "Liam (Client)",
                    quote:
                      "gigUpphelped me organize 4 amazing private shows in a month — seamless!",
                  },
                  {
                    name: "Ava (Musician)",
                    quote:
                      "Pro tier gave me access to high-paying gigs I never imagined before.",
                  },
                  {
                    name: "Carlos (Client)",
                    quote:
                      "Having dedicated booking tools saves me so much time. I'll never go back.",
                  },
                ].map((t, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-[280px] md:w-[320px] break-words whitespace-normal backdrop-blur-xl bg-white/10 border border-white/15 shadow-lg rounded-2xl p-6 snap-center transition hover:scale-[1.02]"
                  >
                    <Quote className="w-6 h-6 text-teal-300 mb-4" />
                    <p className="text-white/80 italic text-base leading-relaxed">
                      {`"${t.quote}"`}
                    </p>
                    <p className="mt-4 font-semibold text-sm text-yellow-300">
                      – {t.name}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Final Message */}
            <section className="my-20 text-center text-gray-300 text-sm max-w-3xl mx-auto">
              <p>
                {`At gigUp, we believe in fair opportunity and easy access to
                talent and events and clients. Whether you're here to perform or host, we're
                here to power your success.`}
              </p>
            </section>
          </>
        )}
      </motion.div>
    </main>
  );
};

export default ExperiencegigUpPage;
