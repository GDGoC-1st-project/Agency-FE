"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { resolveHomePath } from "@/lib/auth/home";

/**
 * 토큰은 브라우저(localStorage)에만 있으므로 브라우저에서 확인한 뒤 이동합니다.
 * 로그인했으면 가입 단계에 맞는 화면(프로필 작성 · 키워드 등록 · 승인 대기 · 멤버), 아니면 로그인 (`resolveHomePath`).
 */
export function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    void resolveHomePath().then((path) => !cancelled && router.replace(path));
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <p role="status" className="px-4 pt-20 text-center text-11 text-muted">
      이동하는 중…
    </p>
  );
}
