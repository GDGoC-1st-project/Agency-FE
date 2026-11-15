"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { resolveHomePath } from "@/lib/auth/home";
import { Button } from "./Button";

/**
 * "처음으로 가기": 로그인했으면 가입 단계에 맞는 화면(프로필 작성 · 키워드 등록 · 승인 대기 · 멤버), 아니면 로그인으로.
 * 갈 곳은 `resolveHomePath`가 정합니다 (404 화면 등).
 */
export function HomeButton({ children = "처음으로 가기" }: { children?: string }) {
  const router = useRouter();
  const [moving, setMoving] = useState(false);
  return (
    <Button
      disabled={moving}
      onClick={async () => {
        setMoving(true);
        router.replace(await resolveHomePath());
      }}
    >
      {moving ? "이동하는 중…" : children}
    </Button>
  );
}
