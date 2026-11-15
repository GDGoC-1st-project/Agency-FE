"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ApiError, getMe } from "@/lib/api";
import { ROUTES } from "@/lib/routes";

/** 운영진 API가 403 ADMIN403을 줬는지 (운영진이 아닌데 들어온 경우) */
export function isAdminForbidden(e: unknown): boolean {
  return e instanceof ApiError && e.code === "ADMIN403";
}

/**
 * 운영 관리 화면들(/admin/*)의 문지기: 내 정보의 role이 ADMIN이 아니면 멤버 화면으로 보냅니다.
 * 확인하는 동안에는 화면을 그리지 않습니다. (운영진 API도 ADMIN403이면 각 화면에서 같은 곳으로 보냅니다)
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<"checking" | "ok" | "error">("checking");

  useEffect(() => {
    let cancelled = false;
    getMe()
      .then((me) => {
        if (cancelled) return;
        if (me.role === "ADMIN") setState("ok");
        else router.replace(ROUTES.members);
      })
      .catch(() => !cancelled && setState("error"));
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (state === "ok") return <>{children}</>;
  return (
    <p role={state === "error" ? "alert" : "status"} className="py-16 text-center text-12 text-muted">
      {state === "error" ? "권한을 확인하지 못했어요. 잠시 후 다시 시도해 주세요." : "운영진 권한을 확인하는 중…"}
    </p>
  );
}
