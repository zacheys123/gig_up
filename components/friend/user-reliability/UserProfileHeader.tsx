import { ArrowLeftIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface UserProfileHeaderProps {
  username: string;
  setShow: (show: boolean) => void;
}

export const UserProfileHeader = ({
  username,
  setShow,
}: UserProfileHeaderProps) => {
  return (
    <div className="relative mb-10">
      <div className="flex flex-col items-center text-center">
        <div className="self-start mb-4">
          <Button
            onClick={() => setShow(false)}
            variant="ghost"
            className="flex items-center gap-2 text-gray-400 hover:text-indigo-400 transition-colors group"
          >
            <motion.div
              whileHover={{ x: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <ArrowLeftIcon
                size={18}
                className="group-hover:text-indigo-400 transition-colors"
              />
            </motion.div>
            <span className="text-sm font-medium">Back to Profile</span>
          </Button>
        </div>

        <div className="relative">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent mb-2">
            Performance Dashboard
          </h1>
          <p className="text-lg text-gray-400">
            {username} gig history and reliability metrics
          </p>
          <div className="absolute -top-3 -left-6 w-4 h-4 rounded-full bg-purple-900 opacity-40"></div>
          <div className="absolute -bottom-2 -right-6 w-3 h-3 rounded-full bg-indigo-900 opacity-40"></div>
        </div>
      </div>
      <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
    </div>
  );
};
