"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { IconButton } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/PageIntro";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  /** 영문 소제목. 예: REQUEST RESPONSE */
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** 아래 버튼 영역. 보통 Button 두 개 */
  footer?: ReactNode;
}

/**
 * Figma Dialog/* (모바일): 아래에서 올라오는 시트 + 어두운 배경(Overlay/Scrim · Mobile).
 * - 배경을 누르거나 Esc를 누르면 닫힙니다.
 * - 열려 있는 동안 뒤 화면 스크롤을 막습니다.
 */
export function Dialog({ open, onClose, eyebrow, title, description, children, footer }: DialogProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end lg:mx-auto lg:max-w-mobile">
      <div aria-hidden className="absolute inset-0 bg-ink/48" onClick={onClose} />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative max-h-[90dvh] overflow-y-auto border-t border-ink bg-paper px-6 pt-10.5 pb-[max(30px,env(safe-area-inset-bottom))] shadow-sheet"
      >
        <IconButton ref={closeRef} icon="close" label="닫기" variant="round" onClick={onClose} className="absolute top-4 right-4" />
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 id={titleId} className="pt-2 pr-10 font-display text-display-md text-ink">
          {title}
        </h2>
        {description && <p className="pt-1 text-11 text-subtle">{description}</p>}
        {children && <div className="pt-4">{children}</div>}
        {footer && <div className="flex gap-2 pt-6 [&>*]:flex-1">{footer}</div>}
      </section>
    </div>
  );
}
