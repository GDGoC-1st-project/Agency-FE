"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, TextButton } from "@/components/ui/Button";
import { getApprovalStatus, getErrorMessage } from "@/lib/api";
import { clearTokens } from "@/lib/auth/token";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/routes";
import { useResetOnHide } from "@/lib/useResetOnHide";

type Notice = { tone: "info" | "error"; text: string } | null;

export function PendingCard() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  useResetOnHide(() => {
    setChecking(false);
    setNotice(null);
  });

  async function check() {
    if (checking) return;
    setChecking(true);
    setNotice(null);
    try {
      const { status } = await getApprovalStatus();
      if (status === "APPROVED") {
        router.replace(ROUTES.members);
        return;
      }
      setNotice({ tone: "info", text: "아직 승인 전이에요. 조금만 더 기다려 주세요." });
    } catch (error) {
      setNotice({ tone: "error", text: getErrorMessage(error, "승인 상태를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.") });
    }
    setChecking(false);
  }

  function logout() {
    clearTokens();
    router.replace(ROUTES.login);
  }

  return (
    <section
      aria-labelledby="pending-title"
      className="flex w-full flex-col items-center gap-6 border border-ink bg-paper px-5.5 pt-8 pb-7 text-center shadow-hard-lg"
    >
      <h1 id="pending-title" className="font-display text-[26px] leading-[33px] text-ink">
        가입 승인 대기 중
      </h1>
      <p className="text-13 leading-[16px] text-ink">
        운영진이 프로필과 키워드를 확인하고 있어요.
        <br />
        보통 하루 안에 승인 결과를 알려드려요.
      </p>
      <div className="flex w-full flex-col items-center gap-3">
        <p aria-live="polite" className={cn("min-h-4 text-11", notice?.tone === "error" ? "text-danger" : "text-muted")}>
          {notice?.text}
        </p>
        <Button fullWidth disabled={checking} onClick={check}>
          {checking ? "확인하는 중…" : "승인 상태 확인"}
        </Button>
        <TextButton onClick={logout}>로그아웃</TextButton>
      </div>
    </section>
  );
}
