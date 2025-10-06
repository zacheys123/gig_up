import { motion } from "framer-motion";

export default function FloatingNotesLoader() {
  const notes = ["♪", "♫", "♩", "♬", "♭", "♮", "♯"];
  const colors = ["#f59e0b", "#ec4899", "#10b981", "#3b82f6", "#8b5cf6"];

  return (
    <div className="h-screen flex flex-col items-center justify-center w-full ">
      {/* Center pulse circle */}
      <motion.div
        className="absolute w-4 h-32 rounded-full bg-yellow-400/10"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative w-40 h-40">
        {notes.map((note, i) => {
          const color = colors[i % colors.length];
          return (
            <motion.span
              key={i}
              className="absolute text-4xl"
              initial={{
                x: 0,
                y: 0,
                opacity: 0,
                scale: 0.5,
              }}
              animate={{
                x: Math.random() * 100 - 50,
                y: Math.random() * 100 - 50,
                opacity: [0, 1, 0],
                rotate: [0, Math.random() * 360],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.4,
                ease: "easeInOut",
              }}
              style={{
                left: "50%",
                top: "50%",
                filter: "drop-shadow(0 0 8px currentColor)",
                color,
              }}
            >
              {note}
            </motion.span>
          );
        })}
      </div>

      {/* Loading text with animation */}
      <motion.div
        className="mt-12 text-center flex justify-center items-center flex-col"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <p className="text-md font-medium text-gray-300 mb-2">
          Preparing your backstage...
        </p>
        <motion.div
          className="h-1 bg-gray-700 rounded-full overflow-hidden max-w-xs mx-auto"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-400 to-amber-600"
            animate={{ x: [-100, 100] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </motion.div>

      {/* Subtle animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gray-800/30"
            initial={{
              x: Math.random() * 100,
              y: Math.random() * 100,
              width: Math.random() * 20 + 10,
              height: Math.random() * 20 + 10,
              opacity: 0,
            }}
            animate={{
              x: Math.random() * 100,
              y: Math.random() * 100,
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
