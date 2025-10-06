"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiStar,
  FiCalendar,
  FiMusic,
  FiMic,
  FiUsers,
  FiRefreshCw, // Add refresh icon
} from "react-icons/fi";
import { useCurrentUser } from "@/hooks/useCurrentUser";
// import { useAllUsers } from "@/hooks/useAllUsers";
// import { UserProps } from "@/types/userinterfaces";
// import { useAllGigs } from "@/hooks/useAllGigs";
// import { GigProps } from "@/types/giginterface";
// import { ResponseProps, usePostComments } from "@/hooks/usePostComments";
// import PostFeedBack from "@/components/user/PostFeedBack";
import { useState, useEffect } from "react"; // Add useState and useEffect
import { useAuth } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export default function AboutPage() {
  const user = useCurrentUser();
  // const { users } = useAllUsers();
  // const { gigs } = useAllGigs();
  // const { Allposts, isLoading: postsloading } = usePostComments();
  // const allmusicians = users?.users?.filter((u: UserProps) => u?.isMusician).length;
  // const allClients = users?.users?.filter((u: UserProps) => u?.isClient).length;
  // const allBookedGigs = gigs?.gigs?.filter((u: GigProps) => u?.isTaken).length;
  //   const musicians = users?.users?.filter((u: UserProps) => u?.isClient)
  // State for shuffled posts
  // console.log(musicians)
  // const [shuffledPosts, setShuffledPosts] = useState<ResponseProps[]>([]);

  // // Function to shuffle and select 2 random posts
  // const shufflePosts = () => {
  //   if (!Allposts || Allposts.length === 0) return;

  //   // Copy the array to avoid mutating the original
  //   const postsCopy = [...Allposts];

  //   // Shuffle the array using Fisher-Yates algorithm
  //   for (let i = postsCopy.length - 1; i > 0; i--) {
  //     const j = Math.floor(Math.random() * (i + 1));
  //     [postsCopy[i], postsCopy[j]] = [postsCopy[j], postsCopy[i]];
  //   }

  //   // Take the first 2 posts
  //   setShuffledPosts(postsCopy.slice(0, 2));
  // };

  // // Shuffle posts when Allposts changes or on component mount
  // useEffect(() => {
  //   shufflePosts();
  // }, [Allposts]);
  const { userId } = useAuth();
  const updateFirstLogin = useMutation(api.controllers.user.updateFirstLogin);

  useEffect(() => {
    const markFirstLoginComplete = async () => {
      if (!userId) {
        throw new Error("No user ID available");
      }

      try {
        const result = await updateFirstLogin({ clerkId: userId });
        console.log("First login marked complete:", result);
        return result;
      } catch (error) {
        console.error("Failed to mark first login complete:", error);
        throw error;
      }
    };

    markFirstLoginComplete();
  }, [userId]);
  return (
    <div className="bg-gray-50 h-screen overflow-y-auto">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 to-purple-800 text-white py-28 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
          >
            The Premier Platform Connecting{" "}
            <span className="text-amber-300">Artists</span> with{" "}
            <span className="text-amber-300">Opportunities</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-xl max-w-3xl mx-auto mb-10 text-blue-100"
          >
            {`Whether you're a talented performer seeking gigs or a restaurant,hotel a club looking
            for exceptional entertainment, we create perfect matches that
            inspire.`}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            {user ? (
              <Link
                href={"/authenticate"}
                className="bg-amber-400 hover:bg-amber-300 text-indigo-900 font-bold py-4 px-8 rounded-full text-lg transition-all transform hover:scale-105 inline-flex items-center justify-center"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="bg-amber-400 hover:bg-amber-300 text-indigo-900 font-bold py-4 px-8 rounded-full text-lg transition-all transform hover:scale-105 inline-flex items-center justify-center"
                >
                  <FiMic className="mr-2" /> Artists Sign Up
                </Link>
                <Link
                  href="/signup"
                  className="bg-white hover:bg-gray-100 text-indigo-900 font-bold py-4 px-8 rounded-full text-lg transition-all transform hover:scale-105 inline-flex items-center justify-center"
                >
                  <FiUsers className="mr-2" /> Clients Sign Up
                </Link>
              </>
            )}
          </motion.div>
        </div>

        {/* Animated decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-screen"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500 rounded-full mix-blend-screen"></div>
        </div>
      </section>
      {/* Stats Bar */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="bg-white py-12 shadow-sm"
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-indigo-900 mb-2">
              {/* {allmusicians}+ */}10K+
            </div>
            <div className="text-gray-600">Talented Artists</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-indigo-900 mb-2">
              {/* {allClients}+ */}
              20K+
            </div>
            <div className="text-gray-600">Verified Clients</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-indigo-900 mb-2">
              {/* {allBookedGigs <1 ? 0 :allBookedGigs}+ */} 9K
            </div>
            <div className="text-gray-600">Successful Bookings</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-indigo-900 mb-2">95%</div>
            <div className="text-gray-600">Satisfaction Rate</div>
          </div>
        </div>
      </motion.section>
      {/* For Artists Section */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl font-bold text-gray-900 mb-4"
          >
            For <span className="text-amber-500">Artists</span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Find your perfect gig, showcase your talent, and grow your career
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8"
        >
          {[
            {
              icon: <FiMusic className="w-8 h-8" />,
              title: "Premium Opportunities",
              desc: "Access exclusive gigs at top venues that value your artistry.",
            },
            {
              icon: <FiDollarSign className="w-8 h-8" />,
              title: "Fair Compensation",
              desc: "Set your rates and get paid securely through our platform.",
            },
            {
              icon: <FiCalendar className="w-8 h-8" />,
              title: "Booking Management",
              desc: "Easily manage your schedule and bookings in one place.",
            },
            {
              icon: <FiUsers className="w-8 h-8" />,
              title: "Direct Connections",
              desc: "Build relationships with venues and repeat clients.",
            },
            {
              icon: <FiStar className="w-8 h-8" />,
              title: "Profile Showcase",
              desc: "Beautiful portfolio to highlight your work and skills.",
            },
            {
              icon: <FiCheckCircle className="w-8 h-8" />,
              title: "Secure Contracts",
              desc: "Professional agreements that protect both parties.",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all border-t-4 border-amber-400"
            >
              <div className="text-amber-500 mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">
                {item.title}
              </h3>
              <p className="text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
      {/* For Clients Section */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl font-bold text-gray-900 mb-4"
            >
              For <span className="text-indigo-600">Clients</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Discover exceptional talent and create unforgettable experiences
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <FiUsers className="w-8 h-8" />,
                title: "Curated Talent",
                desc: "Hand-selected artists across all genres and performance types.",
              },
              {
                icon: <FiClock className="w-8 h-8" />,
                title: "Quick Booking",
                desc: "Find and book the perfect act in minutes, not days.",
              },
              {
                icon: <FiCheckCircle className="w-8 h-8" />,
                title: "Verified Quality",
                desc: "Every artist has been vetted for professionalism.",
              },
              {
                icon: <FiDollarSign className="w-8 h-8" />,
                title: "Transparent Pricing",
                desc: "Clear rates with no hidden fees or surprises.",
              },
              {
                icon: <FiCalendar className="w-8 h-8" />,
                title: "Flexible Scheduling",
                desc: "Find artists available for your specific dates.",
              },
              {
                icon: <FiStar className="w-8 h-8" />,
                title: "Exceptional Support",
                desc: "Our team ensures your event is a success.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all border-t-4 border-indigo-500"
              >
                <div className="text-indigo-600 mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      {/* Testimonial Section */}
      <section className="py-14 bg-gradient-to-br from-indigo-900 to-purple-800 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl font-bold mb-4">
              What Our Users Say
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-blue-100 max-w-3xl mx-auto"
            >
              Discover why artists and clients love using our platform
            </motion.p>
          </motion.div>

          {/* Shuffle button */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex justify-center mb-8"
          >
            <button
              // onClick={shufflePosts}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-700 hover:bg-indigo-600 text-white rounded-full transition-all duration-300 hover:scale-105"
            >
              <FiRefreshCw className="w-5 h-5" />
              Show Different Testimonials
            </button>
          </motion.div>

          {/* Shuffled testimonials */}
          {/* <div className="grid md:grid-cols-2 gap-8">
            {postsloading && <div >loading posts...</div>}
            {shuffledPosts.length > 0 ? (
              shuffledPosts.map((post) => (
                <PostFeedBack key={post._id} post={post} />
              ))
            ) : (
              // Placeholder when no posts are available
              <>
                <div className="bg-indigo-800/50 p-8 rounded-2xl border border-indigo-700">
                  <p className="text-center text-blue-200 italic">
                    No testimonials available yet. Be the first to share your experience!
                  </p>
                </div>
                <div className="bg-indigo-800/50 p-8 rounded-2xl border border-indigo-700">
                  <p className="text-center text-blue-200 italic">
                    Share how our platform has helped you connect with amazing talent!
                  </p>
                </div>
              </>
            )}
          </div> */}
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-12 text-center text-white shadow-xl"
        >
          <h2 className="text-3xl font-bold mb-6">
            Ready to Transform Your Musical Journey?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of artists and venues creating magical experiences
            together.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {user ? (
              <Link
                href={"/authenticate"}
                className="bg-white text-indigo-900 hover:bg-gray-100 font-bold py-4 px-8 rounded-full text-lg transition-all transform hover:scale-105"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/signup?role=artist"
                  className="bg-amber-400 hover:bg-amber-300 text-indigo-900 font-bold py-4 px-8 rounded-full text-lg transition-all transform hover:scale-105 inline-flex items-center justify-center"
                >
                  <FiMic className="mr-2" /> Join as Artist
                </Link>
                <Link
                  href="/signup?role=client"
                  className="bg-white hover:bg-gray-100 text-indigo-900 font-bold py-4 px-8 rounded-full text-lg transition-all transform hover:scale-105 inline-flex items-center justify-center"
                >
                  <FiUsers className="mr-2" /> Join as Client
                </Link>
              </>
            )}
          </div>
          <p className="mt-6 text-indigo-100">
            Have questions?{" "}
            <Link href="/contact" className="underline hover:text-white">
              Contact our team
            </Link>
          </p>
        </motion.div>
      </section>{" "}
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-amber-400">Gigup</h3>
            <p className="text-gray-400">
              Bridging the gap between exceptional talent and unforgettable
              venues since 2020.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">For Artists</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/authenticate"
                  className="text-gray-400 hover:text-white transition"
                >
                  Sign Up
                </Link>
              </li>
              <li>
                <Link
                  href="/artist-resources"
                  className="text-gray-400 hover:text-white transition"
                >
                  Resources
                </Link>
              </li>
              <li>
                <Link
                  href="/artist-faq"
                  className="text-gray-400 hover:text-white transition"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">For Clients</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/authenticate"
                  className="text-gray-400 hover:text-white transition"
                >
                  Sign Up
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-gray-400 hover:text-white transition"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/client-faq"
                  className="text-gray-400 hover:text-white transition"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-white transition"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-gray-400 hover:text-white transition"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-400 hover:text-white transition"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Gigup. All rights reserved.</p>
          <div className="flex justify-center space-x-6 mt-4">
            <Link href="/privacy" className="hover:text-white transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition">
              Terms of Service
            </Link>
            <Link href="/cookies" className="hover:text-white transition">
              Cookie Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
