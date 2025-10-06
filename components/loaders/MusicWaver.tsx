import { motion } from "framer-motion";

const MusicWaveLoader = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center ">
      <div className="flex items-end space-x-1 h-16">
        {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((height, i) => (
          <motion.div
            key={i}
            className="w-2 bg-gradient-to-t from-yellow-400 to-amber-600 rounded-t-sm"
            initial={{ height: 4 }}
            animate={{ height: height * 12 }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 0.5,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
      <p className="mt-8 text-lg font-medium text-gray-300">
        Tuning the instruments...
      </p>
    </div>
  );
};

export default MusicWaveLoader;
