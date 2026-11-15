"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { getMe, getReceivedRequests } from "@/lib/api";
import { AppShell } from "./AppShell";

/**
 * 하단 내비·사이드바가 있는 메인 화면 틀 (멤버 · 모집 · 요청 · 채팅 · 마이). 승인된 사용자만 들어오는 화면에서 씁니다.
 * - 사이드바 "요청" 뱃지: 받은 요청 중 대기(PENDING) 개수. 화면을 옮길 때마다 다시 셉니다.
 * - 사이드바 프로필 바로가기: 내 이름
 * 둘 다 실패해도 화면은 그대로 보여줍니다 (뱃지·이름만 비움).
 */
export function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [requestCount, setRequestCount] = useState(0);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMe()
      .then((me) => !cancelled && setUserName(me.name))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    // 총개수 필드가 없어서 최대 100개를 받아 셉니다 (100개를 넘으면 뱃지는 99+).
    getReceivedRequests({ status: "PENDING", size: 100 })
      .then((page) => !cancelled && setRequestCount(page.hasNext ? page.items.length + 1 : page.items.length))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return (
    <AppShell requestCount={requestCount} userName={userName}>
      {children}
    </AppShell>
  );
}
