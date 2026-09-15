import NumberFlow, { type Format } from "@number-flow/react";
import { useReducedMotion } from "motion/react";
import { DURATION, MOTION_EASE_CSS, ms } from "@/components/motion/tokens";

type AnimatedNumberProps = {
  value: number;
  format?: Format;
  locales?: string | string[];
  prefix?: string;
  suffix?: string;
  className?: string;
};

/**
 * Digit-level transition for dashboard indicators.
 * It animates only when the value actually changes — never on a loop — and
 * renders the plain formatted number under prefers-reduced-motion.
 */
export function AnimatedNumber({ value, format, locales = "pt-BR", prefix, suffix, className }: AnimatedNumberProps) {
  const reduced = useReducedMotion() ?? false;

  if (reduced) {
    return <span className={className}>{`${prefix ?? ""}${new Intl.NumberFormat(locales, format).format(value)}${suffix ?? ""}`}</span>;
  }

  return (
    <NumberFlow
      value={value}
      locales={locales}
      format={format}
      prefix={prefix}
      suffix={suffix}
      className={className}
      transformTiming={{ duration: Math.round(DURATION.emphasis * 1000), easing: MOTION_EASE_CSS }}
      spinTiming={{ duration: Math.round(DURATION.emphasis * 1000), easing: MOTION_EASE_CSS }}
      opacityTiming={{ duration: Number(ms(DURATION.micro).replace("ms", "")), easing: "ease-out" }}
      respectMotionPreference
    />
  );
}
