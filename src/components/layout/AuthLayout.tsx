import type { ReactNode } from "react";
import { FlowHeader } from "./FlowHeader";
import { RedirectIfLoggedIn } from "./RedirectIfLoggedIn";

/**
 * 로그인·회원가입 화면 틀.
 * - 모바일(Figma 1:343, 1:328): Flow header + 본문
 * - PC(Figma 1:621, 1:628): 헤더·사이드바 없이 358px 열을 화면 가운데에
 * 이미 로그인한 사람이 들어오면 가입 단계에 맞는 화면으로 보냅니다 (RedirectIfLoggedIn).
 */
export function AuthLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <RedirectIfLoggedIn />
      <FlowHeader title={title} className="lg:hidden" />
      <main className="flex flex-col gap-7.5 px-4 pt-8.5 pb-13 lg:mx-auto lg:min-h-dvh lg:max-w-form lg:justify-center lg:px-0 lg:py-15">
        {children}
      </main>
    </>
  );
}
