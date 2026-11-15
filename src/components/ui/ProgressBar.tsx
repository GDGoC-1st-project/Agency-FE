import { cn } from "@/lib/cn";

/** Figma Onboarding/Progress: 흰 바탕 + 진한 테두리 + 초록 채움 (높이 8). value는 0~100 */
export function ProgressBar({ value, label, className }: { value: number; label: string; className?: string }) {
  return (
    <progress
      max={100}
      value={Math.min(100, Math.max(0, value))}
      aria-label={label}
      className={cn(
        "block h-2 w-full appearance-none border border-ink bg-white",
        "[&::-webkit-progress-bar]:bg-white [&::-webkit-progress-value]:bg-green [&::-moz-progress-bar]:bg-green",
        className,
      )}
    />
  );
}
