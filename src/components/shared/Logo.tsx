import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<LogoSize, string> = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-5xl",
};

const DOT_SIZE_CLASSES: Record<LogoSize, string> = {
  sm: "w-1 h-1 mb-0.5",
  md: "w-1.5 h-1.5 mb-1",
  lg: "w-3 h-3 mb-2",
};

interface LogoProps {
  /** Controls text size — sm for compact headers, md for standard headers, lg for login/onboarding hero. */
  size?: LogoSize;
  className?: string;
}

/**
 * Willo wordmark, rendered as styled text (not a raster image) so it stays crisp
 * at any size and inherits the app's fonts/colors.
 *
 * Color follows the active theme via Tailwind's `dark:` variant — willo-black in
 * light mode, willo-off-white in dark mode — matching how the rest of the app
 * already switches (a `dark` class on an ancestor element), not next-themes'
 * `useTheme()` hook, since no <ThemeProvider> wraps the app today.
 */
const Logo = ({ size = "md", className }: LogoProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-baseline font-display font-extrabold lowercase tracking-tight leading-none",
        "text-willo-black dark:text-willo-off-white",
        SIZE_CLASSES[size],
        className
      )}
    >
      willo
      <span
        className={cn("inline-block rounded-full bg-willo-green ml-0.5", DOT_SIZE_CLASSES[size])}
        aria-hidden="true"
      />
    </span>
  );
};

export default Logo;
