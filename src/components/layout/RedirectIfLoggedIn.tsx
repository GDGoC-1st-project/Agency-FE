"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getAccessToken } from "@/lib/auth/token";
import { ROUTES } from "@/lib/routes";

/**
 * 이미 로그인한(토큰이 있는) 사람이 로그인·회원가입 화면에 오면 멤버 화면으로 보냅니다.
 * 토큰은 브라우저에만 있으므로 화면이 뜬 뒤 확인합니다. 떠났다 돌아올 때(Activity)도 다시 확인합니다.
 * 승인 전 사용자는 멤버 화면의 첫 API에서 공통 함수가 승인 대기 화면으로 보냅니다.
 */
export function RedirectIfLoggedIn() {
  const router = useRouter();
  useEffect(() => {
    if (getAccessToken()) router.replace(ROUTES.members);
  }, [router]);
  return null;
}
