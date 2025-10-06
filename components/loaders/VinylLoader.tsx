import { motion } from "framer-motion";

export default function VinylLoader() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-950">
      <div className="relative w-32 h-32">
        <motion.div
          className="absolute inset-0 rounded-full border-8 border-gray-700"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-0 rounded-full border-4 border-gray-600" />
          <div className="absolute top-1/2 left-1/2 w-8 h-8 -mt-4 -ml-4 rounded-full bg-gray-800" />
        </motion.div>
        <div className="absolute top-1/2 left-1/2 w-4 h-4 -mt-2 -ml-2 rounded-full bg-yellow-400 z-10" />
      </div>
      <p className="mt-8 text-lg font-medium text-gray-300">
        Spinning up your experience...
      </p>
    </div>
  );
}
