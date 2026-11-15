"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { IconButton } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/PageIntro";
import { cn } from "@/lib/cn";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  /** 영문 소제목. 예: REQUEST RESPONSE */
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  /** 제목 위 그림 영역 (멤버 프로필 배너, 같이해요 제안의 분홍 원 등) */
  visual?: ReactNode;
  /** 닫기 버튼 왼쪽에 놓을 버튼 (예: … 메뉴) */
  headerActions?: ReactNode;
  children?: ReactNode;
  /** 아래 버튼 영역. 버튼 여러 개면 같은 폭으로 나눕니다 */
  footer?: ReactNode;
}

/**
 * Figma Dialog/* + Overlay/Scrim.
 * - 모바일: 아래에서 올라오는 시트 (위 테두리 + 위쪽 6px 진한 그림자)
 * - PC(1024px 이상): 폭 520 카드를 화면 오른쪽 가운데에 (테두리 + 9·10px 진한 그림자). Figma PC 화면 배치를 따름
 * 배경을 누르거나 Esc를 누르면 닫히고, 열려 있는 동안 뒤 화면 스크롤을 막습니다.
 *
 * 화면을 떠났다 돌아왔을 때 다이얼로그가 열린 채로 남지 않게 하려면, 열림 상태를 가진 화면에서
 * `useResetOnHide(() => setOpen(false))`를 쓰세요. (여기서 onClose를 부르면 개발 모드의 StrictMode가
 * 처음 그릴 때도 정리 함수를 한 번 실행해서 열자마자 닫혀 버립니다.)
 */
export function Dialog({ open, onClose, eyebrow, title, description, visual, headerActions, children, footer }: DialogProps) {
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
    <div className="fixed inset-0 z-50 flex flex-col justify-end lg:flex-row lg:items-center lg:justify-end lg:p-4">
      <div aria-hidden className="absolute inset-0 bg-ink/48" onClick={onClose} />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative max-h-[90dvh] overflow-y-auto bg-paper",
          "border-t border-ink px-6 pt-10.5 pb-[max(30px,env(safe-area-inset-bottom))] shadow-sheet",
          "lg:max-h-[calc(100dvh-32px)] lg:w-130 lg:border lg:px-12 lg:pt-12 lg:pb-12 lg:shadow-hard-lg",
        )}
      >
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          {headerActions}
          <IconButton ref={closeRef} icon="close" label="닫기" variant="round" onClick={onClose} />
        </div>
        {visual && <div className="pb-6">{visual}</div>}
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
