import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PageIntroProps {
  /** 영문 소제목. 예: MEMBER BOARD */
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  /**
   * main: 하단 내비가 있는 메인 화면 (Figma Page Intro, 제목 모바일 46.8px · PC 58px)
   * flow: 회원가입·로그인·마이 하위 화면 (Figma Intro/Flow, 제목 39px)
   */
  variant?: "main" | "flow";
  /** 오른쪽 버튼 (예: 모집 글 쓰기). 모바일은 위쪽, PC는 세로 가운데에 맞춥니다 (Figma Page Intro) */
  action?: ReactNode;
  className?: string;
}

/** 화면 맨 위 소개: 영문 소제목 + 큰 제목 + 설명 (+ 오른쪽 버튼) */
export function PageIntro({ eyebrow, title, description, variant = "main", action, className }: PageIntroProps) {
  const text = (
    <>
      <p className="text-10 font-bold tracking-eyebrow text-eyebrow">{eyebrow}</p>
      <h1 className={cn("pt-2 font-display text-ink", variant === "main" ? "text-display-xl lg:text-display-2xl" : "text-display-lg")}>
        {title}
      </h1>
      {description && (
        <p className={cn("pt-3 text-muted", variant === "main" ? "text-14" : "text-13")}>{description}</p>
      )}
    </>
  );

  if (!action) return <header className={cn("flex flex-col", className)}>{text}</header>;

  return (
    <header className={cn("flex items-start gap-3 lg:items-center lg:gap-12.5", className)}>
      <div className="flex min-w-0 flex-1 flex-col">{text}</div>
      {action}
    </header>
  );
}

/** 섹션 제목 위 작은 영문 소제목 (다이얼로그 등에서 재사용) */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-10 font-bold tracking-eyebrow text-eyebrow", className)}>{children}</p>;
}
