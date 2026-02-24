// components/ai/gigUpAssistant.tsx
"use client";
import { motion } from "framer-motion";
import { ChatBubbleBottomCenterIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { PLATFORM_VERSIONS } from "./GigupAssistantModal";

export function GigUpAssistant() {
  const router = useRouter();
  const platformVersion = "v1.0";
  const versionInfo = PLATFORM_VERSIONS[platformVersion];

  const openModal = () => {
    router.push("/ai", { scroll: false });
  };

  const getTooltipText = () => {
    const texts = [
      "AI Assistant",
      "Get AI Help",
      "Ask Questions",
      "AI Support Assisatant",
      "Need Help? Ask AI!",
    ];
    return texts[Math.floor(Math.random() * texts.length)];
  };
  return (
    <motion.button
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
      onClick={openModal}
      className={cn(
        "fixed bottom-6 right-6 z-40 w-8 h-8 rounded-2xl shadow-2xl flex items-center justify-center group",
        "bg-gradient-to-br from-orange-500 to-red-500",
        "text-white border-2 border-white/20 backdrop-blur-sm",
        "transition-all duration-300 hover:shadow-3xl",
      )}
      style={{
        boxShadow: "0 8px 32px rgba(249, 115, 22, 0.3)",
      }}
    >
      <ChatBubbleBottomCenterIcon className="w-6 h-6" />

      {/* Animated version badge */}
      <motion.div
        className={cn(
          "absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
          "bg-white shadow-lg border",
          versionInfo.color,
        )}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        AI
      </motion.div>

      {/* Enhanced Tooltip */}
      <div className="absolute bottom-full right-0 mb-3 hidden group-hover:block">
        <div className="relative">
          <div
            className={cn(
              "bg-gradient-to-r from-gray-900 to-gray-700 text-white text-sm font-medium rounded-xl py-2 px-3 whitespace-nowrap",
              "shadow-2xl border border-white/10 backdrop-blur-sm",
            )}
          >
            {getTooltipText()}
          </div>
          <div className="absolute top-full right-4 w-3 h-3 bg-gray-900 transform rotate-45 -translate-y-1.5" />
        </div>
      </div>

      {/* Pulse animation */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300 -z-10" />
    </motion.button>
  );
}
