"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getMe, getReceivedRequests } from "@/lib/api";
import { AppShell, type ShellOptions } from "./AppShell";
import { RequestCountContext } from "./RequestCountContext";

/**
 * 하단 내비·사이드바가 있는 메인 화면 틀 (멤버 · 모집 · 요청 · 채팅 · 마이). 승인된 사용자만 들어오는 화면에서 씁니다.
 * - 사이드바 "요청" 뱃지: 받은 요청 중 대기(PENDING) 개수. 화면을 옮길 때마다 다시 셉니다.
 *   화면에서는 `useRequestCount()`로 숫자를 읽고, 수락·거절하면 `decrease()`로 바로 줄입니다.
 * - 사이드바 프로필 바로가기: 내 이름
 * 둘 다 실패해도 화면은 그대로 보여줍니다 (뱃지·이름만 비움).
 * 모바일 머리글 바꾸기·채팅방처럼 모바일 틀 빼기·PC 상단바 제목은 `ShellOptions`(AppShell)로 넘깁니다.
 */
export function MainLayout({ children, ...shell }: ShellOptions & { children: ReactNode }) {
  const pathname = usePathname();
  const [requestCount, setRequestCount] = useState(0);
  const [userName, setUserName] = useState<string | null>(null);
  const seq = useRef(0);

  useEffect(() => {
    let cancelled = false;
    getMe()
      .then((me) => !cancelled && setUserName(me.name))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(() => {
    const mySeq = ++seq.current;
    // 총개수 필드가 없어서 최대 100개를 받아 셉니다 (100개를 넘으면 뱃지는 99+).
    getReceivedRequests({ status: "PENDING", size: 100 })
      .then((page) => mySeq === seq.current && setRequestCount(page.hasNext ? page.items.length + 1 : page.items.length))
      .catch(() => {});
  }, []);

  useEffect(() => {
    refresh();
  }, [pathname, refresh]);

  const decrease = useCallback(() => {
    seq.current++; // 진행 중인 다시 세기 결과가 줄인 숫자를 덮어쓰지 않게 합니다.
    setRequestCount((c) => Math.max(0, c - 1));
  }, []);

  const value = useMemo(() => ({ count: requestCount, decrease, refresh }), [requestCount, decrease, refresh]);

  return (
    <RequestCountContext.Provider value={value}>
      <AppShell requestCount={requestCount} userName={userName} {...shell}>
        {children}
      </AppShell>
    </RequestCountContext.Provider>
  );
}
