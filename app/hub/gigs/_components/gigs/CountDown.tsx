import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export const CountdownTimer = ({
  targetDate,
  className,
}: {
  targetDate: Date;
  className?: string;
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const distance = targetDate.getTime() - new Date().getTime();
      if (distance < 0) {
        clearInterval(timer);
        return;
      }
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        ),
        mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const format = (num: number) => num.toString().padStart(2, "0");

  return (
    <div
      className={cn(
        "flex items-center gap-2 font-medium tracking-tight",
        className,
      )}
    >
      <span className="text-[10px] uppercase tracking-[0.1em] opacity-40 font-bold">
        Opens in
      </span>
      <div className="flex items-center gap-1 text-[13px] tabular-nums">
        <span>
          {timeLeft.days}
          <span className="text-[10px] ml-0.5 opacity-50">d</span>
        </span>
        <span className="opacity-20 text-[10px]">:</span>
        <span>
          {format(timeLeft.hours)}
          <span className="text-[10px] ml-0.5 opacity-50">h</span>
        </span>
        <span className="opacity-20 text-[10px]">:</span>
        <span>
          {format(timeLeft.mins)}
          <span className="text-[10px] ml-0.5 opacity-50">m</span>
        </span>
      </div>
    </div>
  );
};
