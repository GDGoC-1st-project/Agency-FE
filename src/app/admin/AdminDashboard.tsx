"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { LinkCard } from "@/components/ui/Card";
import { PageIntro } from "@/components/ui/PageIntro";
import { StateMessage } from "@/components/ui/StateMessage";
import { getAdminDashboard, getErrorMessage } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import type { AdminDashboardResponse } from "@/types/api";
import { isAdminForbidden } from "./AdminGuard";

/**
 * 운영 관리: 운영 현황 API의 가입 대기 수 · 신고 대기 수 카드 (Figma Card/Admin Action).
 * Figma 아래의 "운영자 전용 데모 화면입니다." 문구는 데모 안내라서 넣지 않습니다.
 */
export function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await getAdminDashboard());
    } catch (e) {
      if (isAdminForbidden(e)) return router.replace(ROUTES.members);
      setError(getErrorMessage(e, "운영 현황을 불러오지 못했어요."));
    }
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 들어올 때마다(처리하고 돌아와도) 최신 숫자를 불러옵니다.
    void load();
  }, [load]);

  return (
    <div className="flex flex-col">
      <PageIntro variant="flow" eyebrow="OPERATION DESK" title="커뮤니티 운영 메모" description="가입 대기와 신고 내역을 빠르게 확인해요." />
      <div className="pt-7.5">
        {error && <StateMessage type="error" title="운영 현황을 불러오지 못했어요" description={error} actionLabel="다시 시도" onAction={() => void load()} />}
        {!error && !data && (
          <p role="status" className="py-16 text-center text-12 text-muted">
            운영 현황을 불러오는 중…
          </p>
        )}
        {!error && data && (
          <div className="flex flex-col gap-5 lg:max-w-88.75">
            <LinkCard
              href={ROUTES.adminSignups}
              count={data.pendingSignupCount}
              title={`가입 승인 대기 ${data.pendingSignupCount}명`}
              description="새 멤버의 프로필을 검토해요"
              tone="yellow"
            />
            <LinkCard
              href={ROUTES.adminReports}
              count={data.pendingReportCount}
              title={`신고 처리 대기 ${data.pendingReportCount}건`}
              description="접수된 신고 내용을 확인해요"
              tone="pink"
            />
          </div>
        )}
      </div>
    </div>
  );
}
