import { motion } from "motion/react";
import { useEffect, useState, useRef } from "react";

interface OfferBlockProps {
  limitedQuantity: string;
  showTimer?: boolean;
  hoursLabel?: string;
  minutesLabel?: string;
  secondsLabel?: string;
}

export function OfferBlock({ 
  limitedQuantity, 
  showTimer = false,
  hoursLabel = "Hours",
  minutesLabel = "Minutes",
  secondsLabel = "Seconds"
}: OfferBlockProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 45,
    seconds: 12,
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!showTimer) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showTimer]);

  return (
    <section ref={ref} className="py-24 md:py-32 px-6 md:px-20 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="max-w-2xl mx-auto text-center"
      >
        {/* Limited Quantity */}
        <p className="text-black text-sm font-light tracking-widest uppercase mb-8">
          {limitedQuantity}
        </p>

        {/* Optional Timer */}
        {showTimer && (
          <div className="flex justify-center gap-6">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-extralight text-black">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-xs font-light text-black/50 tracking-widest uppercase mt-2">
                {hoursLabel}
              </span>
            </div>
            <span className="text-4xl font-extralight text-black">:</span>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-extralight text-black">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-xs font-light text-black/50 tracking-widest uppercase mt-2">
                {minutesLabel}
              </span>
            </div>
            <span className="text-4xl font-extralight text-black">:</span>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-extralight text-black">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="text-xs font-light text-black/50 tracking-widest uppercase mt-2">
                {secondsLabel}
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </section>
  );
}