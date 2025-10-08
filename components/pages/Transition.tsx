import { motion, MotionValue } from "framer-motion";

interface TransitionProps {
  children: React.ReactNode;
  variant: {
    initial: MotionValue | { [key: string]: null } | undefined; // Handle motion values or object values
    animate: MotionValue | { [key: string]: null };
    transition: object;
  };
  className: string;
  navStates: boolean;
  onClick: () => void;
}

export default function Transition({
  children,
  variant,
  className,
  navStates,
  onClick,
}: TransitionProps) {
  const initial =
    variant.initial instanceof MotionValue
      ? variant.initial.get()
      : variant.initial;
  const animate =
    variant.animate instanceof MotionValue
      ? variant.animate.get()
      : variant.animate;

  return (
    <>
      {navStates ? (
        <motion.div
          initial={initial || undefined}
          animate={animate}
          transition={variant.transition}
          className={className}
        >
          {children}
        </motion.div>
      ) : (
        <motion.div
          initial={initial}
          animate={animate}
          transition={variant.transition}
          className={className}
          onClick={onClick}
        >
          {children}
        </motion.div>
      )}
    </>
  );
}
