"use client";
import { IoIosAddCircle, IoIosArrowDown } from "react-icons/io";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import {
  MdOutlinePersonalInjury,
  MdEmojiEvents,
  MdComment,
  MdClose,
  MdMenu,
  MdDashboard,
  MdBookmark,
  MdFavorite,
  MdHistory,
  MdPayment,
  MdSettings,
  MdAccountCircle,
} from "react-icons/md";
import { motion, useAnimation, PanInfo, AnimatePresence } from "framer-motion";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { BsCart4 } from "react-icons/bs";
import { useEffect, useRef, useState } from "react";
import { usePendingGigs } from "@/app/Context/PendinContext";
type NavLink = {
  href: string;
  Icon: React.ComponentType<{ size?: number; className: string }>;
  label: string;
  size?: number;
  extraStyle?: string;
  badge?: number; // Make badge optional
};
const PagesNav = () => {
  const { userId } = useAuth();
  const pathname = usePathname();
  const { user } = useCurrentUser();

  const [isOpen, setIsOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const controls = useAnimation();
  const { pendingGigsCount } = usePendingGigs();
  const navRef = useRef<HTMLDivElement>(null);

  const linkStyles = (isActive: boolean) =>
    isActive
      ? "bg-gray-800 text-amber-300"
      : "text-gray-300 hover:bg-gray-800 hover:text-white";

  const linkAnimation = {
    initial: { scale: 1, opacity: 0.9 },
    hover: { scale: 1.02, opacity: 1 },
    tap: { scale: 0.98, opacity: 0.9 },
  };

  // // Base links for all users
  // const baseLinks: NavLink[] = [
  //   {
  //     href: `/v1/gigs/${userId}`,
  //     Icon: FaHome,
  //     label: "Home",
  //     size: 20,
  //     extraStyle: "",
  //   },
  // ];

  // Musician specific links
  const musicianLinks: NavLink[] = [
    {
      href: `/av_gigs/${userId}`,
      Icon: MdComment,
      label: "Available Gigs",
      size: 20,
      extraStyle: "",
    },
    {
      href: `/bookedgigs/${userId}`,
      Icon: MdEmojiEvents,
      label: "Booked Gigs",
      size: 20,
      extraStyle: "",
    },
    {
      href: `/pending/${userId}`,
      Icon: BsCart4,
      label: "Pending",
      size: 20,
      extraStyle: "",
      badge: pendingGigsCount,
    },
  ];

  // Client specific links
  const clientLinks: NavLink[] = [
    {
      href: `/create/${userId}`,
      Icon: IoIosAddCircle,
      label: "Create Gig",
      size: 22,
      extraStyle: "text-purple-400",
    },
    {
      href: `/my_gig/${userId}`,
      Icon: MdOutlinePersonalInjury,
      label: "My Gigs",
      size: 20,
      extraStyle: "",
    },
  ];

  // Dashboard tabs - Musician
  const musicianDashboardTabs = [
    {
      href: `/v1/gigs/dashboard/${userId}/bookings`,
      Icon: MdEmojiEvents,
      label: "My Bookings",
    },
    {
      href: `/v1/gigs/dashboard/${userId}/saved`,
      Icon: MdBookmark,
      label: "Saved Gigs",
    },
    {
      href: `/v1/gigs/dashboard/${userId}/favorites`,
      Icon: MdFavorite,
      label: "Favorites",
    },
    {
      href: `/v1/gigs/dashboard/${userId}/history`,
      Icon: MdHistory,
      label: "Booking History",
    },
    {
      href: `/v1/gigs/dashboard/${userId}/payments`,
      Icon: MdPayment,
      label: "Payments",
    },
  ];

  // Dashboard tabs - Client
  const clientDashboardTabs = [
    {
      href: `/v1/gigs/dashboard/${userId}/events`,
      Icon: MdEmojiEvents,
      label: "My Events",
    },
    {
      href: `/v1/gigs/dashboard/${userId}/bookings`,
      Icon: MdBookmark,
      label: "Bookings",
    },
    {
      href: `/v1/gigs/dashboard/${userId}/history`,
      Icon: MdHistory,
      label: "Booking History",
    },

    {
      href: `/v1/gigs/dashboard/${userId}/reviews`,
      Icon: MdComment,
      label: "Reviews",
    },
    {
      href: `/v1/gigs/dashboard/${userId}/payments`,
      Icon: MdPayment,
      label: "Payments",
    },
  ];

  // Combine links based on user type
  const links = [];
  if (user?.user?.isMusician) {
    links.push(...musicianLinks);
  } else if (user?.user?.isClient) {
    links.push(...clientLinks);
  }

  const dashboardTabs = user?.user?.isMusician
    ? musicianDashboardTabs
    : clientDashboardTabs;

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const threshold = 50;
    const velocityThreshold = 500;

    if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
      controls.start({ x: "100%" });
      setIsOpen(false);
    } else if (
      info.offset.x > threshold ||
      info.velocity.x > velocityThreshold
    ) {
      controls.start({ x: 0 });
      setIsOpen(true);
    } else {
      controls.start({ x: isOpen ? 0 : "100%" });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        controls.start({
          x: "100%",
          transition: { type: "spring", stiffness: 300, damping: 30 },
        });
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, controls]);

  const toggleNav = () => {
    if (isOpen) {
      controls.start({
        x: "100%",
        transition: { type: "spring", stiffness: 300, damping: 30 },
      });
    } else {
      controls.start({
        x: 0,
        transition: { type: "spring", stiffness: 300, damping: 30 },
      });
    }
    setIsOpen(!isOpen);
  };

  const toggleDashboard = () => {
    setIsDashboardOpen(!isDashboardOpen);
  };

  return (
    <>
      {}
      {/* Modern Drag Handle */}
      <motion.div
        className="fixed right-0 top-1/2 -translate-y-1/2 z-150 bg-gray-800 p-3 rounded-l-lg cursor-grab active:cursor-grabbing md:hidden shadow-lg border-l border-y border-gray-700"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        onClick={toggleNav}
        whileHover={{ backgroundColor: "rgba(31, 41, 55, 0.9)" }}
        whileTap={{
          scale: 0.95,
          backgroundColor: "rgba(17, 24, 39, 0.9)",
        }}
        animate={{
          backgroundColor: isOpen
            ? "rgba(17, 24, 39, 1)"
            : "rgba(131, 41, 55, 1)",
        }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          {isOpen ? (
            <MdClose className="text-white text-xl" />
          ) : (
            <MdMenu className="text-white text-xl" />
          )}
        </motion.div>
      </motion.div>

      {/* Modern Navigation Panel */}
      <motion.nav
        ref={navRef}
        className="fixed right-0 top-0 h-full w-72 bg-gray-900 border-l border-gray-700 z-40 md:hidden shadow-2xl"
        initial={{ x: "100%" }}
        animate={controls}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800">
            <div className="flex items-center space-x-2">
              <MdAccountCircle className="text-white text-2xl" />
              <h2 className="text-xl font-bold text-white">
                {user?.user?.username || "Menu"}
              </h2>
            </div>
            <button
              onClick={toggleNav}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors"
            >
              <MdClose className="text-white text-lg" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {/* Dashboard Section */}
            {/* Main Navigation Links */}
            {links.map(
              ({ href, Icon, label, size = 20, extraStyle, badge }, index) => (
                <Link key={index} href={href} className="block">
                  <motion.div
                    variants={linkAnimation}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                    className={`flex items-center justify-between p-3 relative rounded-lg transition-all ${linkStyles(
                      pathname === href
                    )} ${extraStyle || ""}`}
                    onClick={() => {
                      controls.start({ x: "100%" });
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-center">
                      <Icon size={size} className="mr-3" />
                      <span className="text-base">{label}</span>
                    </div>
                    {badge && badge > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold h-5 w-5 rounded-full flex items-center justify-center">
                        {badge}
                      </span>
                    )}
                  </motion.div>
                </Link>
              )
            )}
            {/* Settings Link */}
            <Link href={`/settings/${userId}`} className="block mt-4">
              <motion.div
                variants={linkAnimation}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                className={`flex items-center p-3 relative rounded-lg transition-all ${linkStyles(
                  pathname.includes("/settings")
                )}`}
                onClick={() => {
                  controls.start({ x: "100%" });
                  setIsOpen(false);
                }}
              >
                <MdSettings size={20} className="mr-3" />
                <span className="text-base">Settings</span>
              </motion.div>
            </Link>{" "}
            <div className="mb-4">
              <button
                onClick={toggleDashboard}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${linkStyles(
                  pathname.includes("/dashboard")
                )}`}
              >
                <div className="flex items-center">
                  <MdDashboard size={20} className="mr-3" />
                  <span className="text-base">Dashboard</span>
                </div>
                <motion.div
                  animate={{ rotate: isDashboardOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <IoIosArrowDown />
                </motion.div>
              </button>

              <AnimatePresence>
                {isDashboardOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-8 mt-1 space-y-1 overflow-hidden"
                  >
                    {dashboardTabs.map(({ href, Icon, label }, index) => (
                      <Link key={index} href={href}>
                        <motion.div
                          variants={linkAnimation}
                          initial="initial"
                          whileHover="hover"
                          whileTap="tap"
                          className={`flex items-center p-2 rounded-lg text-sm ${linkStyles(
                            pathname === href
                          )}
                          ${
                            label === "Payments" &&
                            "text-neutral-500 pointer-events-none "
                          }`}
                          onClick={() => {
                            controls.start({ x: "100%" });
                            setIsOpen(false);
                          }}
                        >
                          <Icon size={18} className="mr-2" />
                          {label}
                        </motion.div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700 text-center text-gray-400 text-sm">
            {user?.user?.email || "User"}
          </div>
        </div>
      </motion.nav>

      {/* Modern Overlay */}
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-60 z-30 md:hidden backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={toggleNav}
          transition={{ duration: 0.2 }}
        />
      )}
    </>
  );
};

export default PagesNav;
