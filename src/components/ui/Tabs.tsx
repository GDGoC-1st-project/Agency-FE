import { cn } from "@/lib/cn";
import { CountBadge } from "./Badge";

export interface TabItem<T extends string> {
  value: T;
  label: string;
  /** 탭 옆 분홍 숫자. 0이면 숨김 */
  count?: number;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}

/** Figma Tab/Request: 받은 요청 / 보낸 요청. 모바일은 반씩 나누고, PC는 탭마다 150px */
export function Tabs<T extends string>({ items, value, onChange, label, className }: TabsProps<T>) {
  return (
    <div role="tablist" aria-label={label} className={cn("flex border-b border-line", className)}>
      {items.map((item) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(item.value)}
            className={cn(
              "-mb-px flex h-13.75 flex-1 items-center justify-center lg:w-37.5 lg:flex-none gap-1.5 border-b-2 text-12 transition-colors hover:bg-hover",
              selected ? "border-ink font-bold text-ink" : "border-transparent text-muted",
            )}
          >
            {item.label}
            {item.count !== undefined && <CountBadge count={item.count} size="sm" />}
          </button>
        );
      })}
    </div>
  );
}
