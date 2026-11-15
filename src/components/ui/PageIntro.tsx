import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PageIntroProps {
  /** 영문 소제목. 예: MEMBER BOARD */
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  /**
   * main: 하단 내비가 있는 메인 화면 (Figma Page Intro, 제목 46.8px)
   * flow: 회원가입·로그인·마이 하위 화면 (Figma Intro/Flow, 제목 39px)
   */
  variant?: "main" | "flow";
  className?: string;
}

/** 화면 맨 위 소개: 영문 소제목 + 큰 제목 + 설명 */
export function PageIntro({ eyebrow, title, description, variant = "main", className }: PageIntroProps) {
  return (
    <header className={cn("flex flex-col", className)}>
      <p className="text-10 font-bold tracking-eyebrow text-eyebrow">{eyebrow}</p>
      <h1 className={cn("pt-2 font-display text-ink", variant === "main" ? "text-display-xl lg:text-display-2xl" : "text-display-lg")}>
        {title}
      </h1>
      {description && (
        <p className={cn("pt-3 text-muted", variant === "main" ? "text-14" : "text-13")}>{description}</p>
      )}
    </header>
  );
}

/** 섹션 제목 위 작은 영문 소제목 (다이얼로그 등에서 재사용) */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-10 font-bold tracking-eyebrow text-eyebrow", className)}>{children}</p>;
}
