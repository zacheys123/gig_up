"use client";
import Image from "next/image";
import postimage from "../../public/assets/post.jpg";
import reactimage from "../../public/assets/svg/logo-no-background.svg";
import { CircularProgress } from "@mui/material";
import { useAuth, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import thumbnailImage from "../../public/assets/discover4.webp";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { SaveAll, Play, Music, Users, Star, ArrowRight } from "lucide-react";
import LoadingSpinner from "./loading";
// import { useCheckTrial } from "@/hooks/useCheckTrials";
// import ScrollToTopButton from "@/components/ScrollUp";
// import MetaTags from "@/components/pwa/MetTags";

export default function Home() {
  const { isLoaded, userId } = useAuth();
  const { user, isLoading } = useCurrentUser();

  const [showVideo, setShowVideo] = useState(false);
  const [isClientSide, setIsClientSide] = useState(false);
  // const { isFirstMonthEnd } = useCheckTrial(user);

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone) {
      console.log("Running as PWA");
    }
  }, []);

  useEffect(() => {
    setIsClientSide(true);
    if (!isLoaded && !userId) {
      localStorage.removeItem("user");
    }
  }, [isLoaded, userId]);

  const getDynamicHref = () => {
    if (!userId || !user?.firstname || (!user?.isClient && !user?.isMusician))
      return `/roles/${userId}`;
    return user?.isClient
      ? `/create/${userId}`
      : user?.isMusician
      ? `/av_gigs/${userId}`
      : `/roles/${userId}`;
  };

  // Show loading spinner while auth or user data is loading
  if (!isLoaded || isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
        <CircularProgress size="30px" />
        <span className="mt-2 text-lg font-medium text-gray-300">
          Loading...
        </span>
      </div>
    );
  }

  const features = [
    {
      icon: <Music className="w-12 h-12 text-amber-500" />,
      title: "Share Your Music",
      description: "Upload and showcase your jam sessions to the world."
    },
    {
      icon: <Users className="w-12 h-12 text-amber-500" />,
      title: "Connect with Artists",
      description: "Find and collaborate with musicians near you."
    },
    {
      icon: <Star className="w-12 h-12 text-amber-500" />,
      title: "Book Gigs",
      description: "Discover performance opportunities and get booked."
    },
    {
      icon: <Play className="w-12 h-12 text-amber-500" />,
      title: "Live Sessions",
      description: "Go live and connect with your audience in real-time."
    }
  ];

  return (
    <div className="bg-gray-950 text-white font-sans min-h-screen overflow-y-scroll snap-mandatory snap-y scroll-smooth">
      {/* <MetaTags /> */}

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center snap-start px-4">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        >
          <source
            src="https://res.cloudinary.com/dsziq73cb/video/upload/v1741577722/gigmeUpload/gww2kwzvdtkx4qxln6qu.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-gray-950/90"></div>

        <motion.div
          className="relative z-10 px-6 py-12 bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 max-w-4xl w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.h1
            className="text-6xl md:text-7xl font-black tracking-tight leading-tight text-transparent bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 bg-clip-text mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Discover.
            <br />
            Create.
            <br />
            Perform.
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Join the ultimate platform connecting musicians, venues, and music lovers worldwide.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {userId && user?.firstname ? (
              <Link
                href={getDynamicHref()}
                className="group px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-gray-900 text-lg font-bold rounded-full shadow-2xl hover:shadow-amber-500/25 hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                Continue to Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-gray-900 text-lg font-bold rounded-full shadow-2xl hover:shadow-amber-500/25 hover:scale-105 transition-all duration-300">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-8 py-4 border-2 border-amber-500 text-amber-400 text-lg font-bold rounded-full hover:bg-amber-500/10 hover:scale-105 transition-all duration-300">
                    Create Account
                  </button>
                </SignUpButton>
              </>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            {[
              { number: "10K+", label: "Active Musicians" },
              { number: "5K+", label: "Gigs Posted" },
              { number: "50K+", label: "Music Lovers" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-amber-400">{stat.number}</div>
                <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="min-h-screen flex flex-col justify-center items-center snap-start bg-gradient-to-b from-gray-900 to-gray-950 py-20 px-4">
        <motion.div
          className="text-center max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-black mb-4 text-transparent bg-gradient-to-r from-amber-400 to-pink-500 bg-clip-text">
            Why Choose GigUp?
          </h2>
          <p className="text-xl text-gray-400 mb-16 max-w-2xl mx-auto">
            Everything you need to grow your music career in one place
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="group bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:border-amber-500/30 hover:bg-gray-800/70 transition-all duration-500 hover:scale-105"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="min-h-screen flex flex-col justify-center items-center snap-start bg-gray-950 py-20 px-4">
        <motion.div
          className="text-center max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-black mb-4 text-transparent bg-gradient-to-r from-yellow-500 to-pink-600 bg-clip-text">
            How It Works
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Get started in just a few simple steps
          </p>

          <div className="flex justify-center mb-12">
            {!showVideo ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="cursor-pointer relative group"
                onClick={() => setShowVideo(true)}
              >
                <Image
                  src={thumbnailImage}
                  alt="Video Thumbnail"
                  className="w-full max-w-4xl rounded-2xl shadow-2xl group-hover:shadow-amber-500/20 transition-all duration-300"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                    <Play className="w-8 h-8 text-gray-900 ml-1" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/20 rounded-2xl group-hover:bg-black/10 transition-all duration-300"></div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <video
                  controls
                  autoPlay
                  className="w-full max-w-4xl rounded-2xl shadow-2xl"
                  onEnded={() => setShowVideo(false)}
                >
                  <source
                    src="https://res.cloudinary.com/dsziq73cb/video/upload/v1742520206/ike81qltg0etsoblov4c.mp4"
                    type="video/mp4"
                  />
                </video>
              </motion.div>
            )}
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {[
              { step: "01", title: "Create Profile", description: "Sign up and set up your musician or client profile" },
              { step: "02", title: "Connect", description: "Find musicians or gigs that match your needs" },
              { step: "03", title: "Perform", description: "Book gigs, share music, and grow your audience" }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="text-center p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
              >
                <div className="text-4xl font-black text-amber-500 mb-4">{item.step}</div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Button for logged-in users */}
        {userId && user?.firstname && (
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href={getDynamicHref()}
              className="group px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-gray-900 text-lg font-bold rounded-full shadow-2xl hover:shadow-amber-500/25 hover:scale-105 transition-all duration-300 flex items-center gap-3"
            >
              <SaveAll className="w-5 h-5" />
              Open GigUp
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        )}
      </section>

      {/* Final CTA Section */}
      <section className="min-h-screen flex flex-col justify-center items-center snap-start bg-gradient-to-br from-gray-900 to-amber-950/20 py-20 px-4">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-black mb-6 text-transparent bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text">
            Ready to Start?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of musicians and music lovers already on GigUp
          </p>

          {!userId ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <SignUpButton mode="modal">
                <button className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-gray-900 text-lg font-bold rounded-full shadow-2xl hover:shadow-amber-500/25 hover:scale-105 transition-all duration-300">
                  Get Started Free
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="px-8 py-4 border-2 border-amber-500 text-amber-400 text-lg font-bold rounded-full hover:bg-amber-500/10 hover:scale-105 transition-all duration-300">
                  I Have an Account
                </button>
              </SignInButton>
            </div>
          ) : (
            <Link
              href={getDynamicHref()}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-gray-900 text-lg font-bold rounded-full shadow-2xl hover:shadow-amber-500/25 hover:scale-105 transition-all duration-300"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="min-h-40 flex flex-col justify-center items-center bg-gray-900 snap-start py-12 px-4 border-t border-white/10">
        <p className="text-gray-400 text-center">
          © {new Date().getFullYear()} GigUp. All rights reserved.
          <br />
          <span className="text-sm text-gray-500 mt-2 block">
            Connecting the world through music
          </span>
        </p>
      </footer>

      {/* <ScrollToTopButton /> */}
    </div>
  );
}