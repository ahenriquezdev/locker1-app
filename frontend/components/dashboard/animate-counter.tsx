import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  decimals?: number;
}

export const AnimatedCounter = ({
  value,
  suffix = "",
  decimals = 0,
}: AnimatedCounterProps) => {
  const spring = useSpring(0, { stiffness: 100, damping: 20 });
  const display = useTransform(spring, (latest) => {
    const fixed = latest.toFixed(decimals);
    return `${fixed}${suffix}`;
  });

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
};
