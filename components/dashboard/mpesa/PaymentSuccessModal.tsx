"use client";
import { useEffect, useState } from "react";
import { Check, PartyPopper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSubscription } from "@/hooks/useSubscription";
import { useUser } from "@clerk/nextjs";

type ConfettiPiece = {
  id: number;
  style: React.CSSProperties;
};

export function PaymentSuccessModal({
  open,
  onClose,
  amount,
  phoneNumber,
}: {
  open: boolean;
  onClose: () => void;
  amount: number;
  phoneNumber: string | null;
}) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [isClosing, setIsClosing] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const { mutateSubscription } = useSubscription(user?.id || "");

  useEffect(() => {
    if (!open) return;

    // Generate confetti
    const pieces = Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      style: {
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 2}s`,
        backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
        transform: `rotate(${Math.random() * 360}deg)`,
      },
    }));

    setConfetti(pieces);
    const timer = setTimeout(() => setConfetti([]), 3000);
    return () => clearTimeout(timer);
  }, [open]);

  const handleThankYouClick = () => {
    setIsClosing(true);

    // Optimistically update the UI before closing
    mutateSubscription({
      tier: "pro",
      isPro: true,
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });

    // Close modal after animation
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      router.refresh(); // Refresh page data
    }, 500);
  };

  const formattedPhone =
    phoneNumber &&
    phoneNumber.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, "$1 $2 $3 $4");

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden">
          {/* Confetti */}
          <div className="absolute inset-0 pointer-events-none">
            {confetti.map((piece) => (
              <div
                key={piece.id}
                className="absolute w-2 h-2 rounded-full animate-confetti"
                style={{
                  ...piece.style,
                  top: "-10px",
                  animation: `confettiFall ${
                    Math.random() * 3 + 2
                  }s linear forwards`,
                }}
              />
            ))}
          </div>

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={
              isClosing
                ? { scale: 0.9, opacity: 0, y: 20 }
                : { scale: 1, opacity: 1, y: 0 }
            }
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: isClosing ? "easeIn" : "easeOut",
            }}
            className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl shadow-2xl overflow-hidden border-2 border-green-400 max-w-md w-full relative"
          >
            {/* Checkmark animation */}
            <div className="relative flex justify-center mt-10 mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={
                  isClosing
                    ? { scale: 0.8, opacity: 0 }
                    : { scale: 1, opacity: 1 }
                }
                className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-30"
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={
                  isClosing
                    ? { scale: 0.8, opacity: 0 }
                    : { scale: 1, opacity: 1 }
                }
                className="h-24 w-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-4 border-green-300"
              >
                <motion.div
                  initial={{ pathLength: 0 }}
                  animate={isClosing ? { pathLength: 0 } : { pathLength: 1 }}
                >
                  <Check className="h-12 w-12 text-white stroke-[4]" />
                </motion.div>
              </motion.div>
            </div>

            {/* Content */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={isClosing ? { y: 40, opacity: 0 } : { y: 0, opacity: 1 }}
              className="px-6 pb-8 text-center"
            >
              <h2 className="text-3xl font-bold text-white mb-2">
                Payment Successful!
              </h2>
              <p className="text-green-100 mb-6">
                Your bill has been cleared successfully
              </p>

              <div className="bg-green-700/50 rounded-xl p-4 mb-6 border border-green-600">
                <div className="flex justify-between mb-2">
                  <span className="text-green-200">Amount:</span>
                  <span className="font-bold text-white">
                    KES {amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-200">Phone Number:</span>
                  <span className="font-mono text-white blur-md">
                    {formattedPhone}
                  </span>
                </div>
              </div>

              {/* Thank You button with loading state */}
              <motion.div
                whileHover={!isClosing ? { scale: 1.03 } : {}}
                whileTap={!isClosing ? { scale: 0.98 } : {}}
              >
                <Button
                  onClick={handleThankYouClick}
                  disabled={isClosing}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-green-900 font-bold py-6 text-lg rounded-xl shadow-lg relative overflow-hidden"
                >
                  {isClosing ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center"
                    >
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-green-900"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Redirecting...
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ x: -100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="flex items-center justify-center"
                    >
                      <PartyPopper className="w-5 h-5 mr-2" />
                      Thank You!
                    </motion.div>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
