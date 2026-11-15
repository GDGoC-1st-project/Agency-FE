"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useResetOnHide } from "@/lib/useResetOnHide";
import { IconButton } from "./Button";

export interface MenuItem {
  label: string;
  onSelect: () => void;
}

/**
 * "…" 버튼을 누르면 열리는 작은 메뉴 (Figma 멤버 프로필의 신고하기 · 차단하기).
 * 바깥을 누르거나 Esc를 누르면 닫힙니다.
 */
export function MoreMenu({ items, label = "더보기" }: { items: MenuItem[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useResetOnHide(() => setOpen(false));

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <IconButton
        icon="more"
        label={label}
        variant="round"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
      />
      {open && (
        <ul id={menuId} role="menu" className="absolute top-full right-0 z-20 mt-2 min-w-26 border border-line bg-white py-1.5 shadow-paper">
          {items.map((item) => (
            <li key={item.label} role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
                className="block w-full px-4 py-2 text-center text-11 text-muted underline underline-offset-2 hover:bg-hover hover:text-ink"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
