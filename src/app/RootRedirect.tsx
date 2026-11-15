"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getAccessToken } from "@/lib/auth/token";
import { ROUTES } from "@/lib/routes";

/**
 * 토큰은 브라우저(localStorage)에만 있으므로 브라우저에서 확인한 뒤 이동합니다.
 * 토큰이 만료됐으면 멤버 화면의 첫 API 호출에서 공통 함수가 재발급하거나 로그인으로 보냅니다.
 */
export function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getAccessToken() ? ROUTES.members : ROUTES.login);
  }, [router]);

  return (
    <p role="status" className="px-4 pt-20 text-center text-11 text-muted">
      이동하는 중…
    </p>
  );
}
