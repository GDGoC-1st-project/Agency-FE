import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./Button";
import { Icon } from "./Icon";

interface StateMessageProps {
  /** empty: 결과 없음(파란 원) / error: 불러오기 실패(빨간 원) */
  type: "empty" | "error";
  title: string;
  description?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/** Figma Feedback/State: 빈 목록·오류 안내 */
export function StateMessage({ type, title, description, actionLabel, onAction, className }: StateMessageProps) {
  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={cn("flex flex-col items-center gap-6 bg-paper px-6 py-12 text-center", className)}
    >
      <span
        className={cn(
          "inline-flex size-17.5 items-center justify-center rounded-full border-2 border-ink shadow-hard",
          type === "error" ? "bg-danger" : "bg-blue",
        )}
      >
        <Icon name="search" size={28} className="text-ink" />
      </span>
      <div className="flex flex-col items-center gap-2">
        <p className="font-display text-[24px] leading-[1.3] text-ink">{title}</p>
        {description && <p className="text-14 leading-normal text-muted">{description}</p>}
      </div>
      {actionLabel && onAction && <Button onClick={onAction}>{actionLabel}</Button>}
    </div>
  );
}
