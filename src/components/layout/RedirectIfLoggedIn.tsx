"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { resolveHomePath } from "@/lib/auth/home";
import { getAccessToken } from "@/lib/auth/token";

/**
 * 이미 로그인한(토큰이 있는) 사람이 로그인·회원가입 화면에 오면 가입 단계에 맞는 화면으로 보냅니다
 * (프로필 작성 · 키워드 등록 · 승인 대기 · 멤버, `resolveHomePath`).
 * 토큰은 브라우저에만 있으므로 화면이 뜬 뒤 확인합니다. 떠났다 돌아올 때(Activity)도 다시 확인합니다.
 */
export function RedirectIfLoggedIn() {
  const router = useRouter();
  useEffect(() => {
    if (!getAccessToken()) return;
    let cancelled = false;
    void resolveHomePath().then((path) => !cancelled && router.replace(path));
    return () => {
      cancelled = true;
    };
  }, [router]);
  return null;
}
