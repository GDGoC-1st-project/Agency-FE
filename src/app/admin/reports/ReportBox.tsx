"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Dialog } from "@/components/layout/Dialog";
import { Button } from "@/components/ui/Button";
import { NoteCard } from "@/components/ui/Card";
import { Field, FormError, Textarea } from "@/components/ui/Input";
import { ApiError, getAdminReports, getErrorMessage, resolveReport } from "@/lib/api";
import { formatListTime } from "@/lib/datetime";
import { REPORT_TARGET_LABEL } from "@/lib/labels";
import { ROUTES } from "@/lib/routes";
import { useResetOnHide } from "@/lib/useResetOnHide";
import type { AdminReportItem, PageParams } from "@/types/api";
import { isAdminForbidden } from "../AdminGuard";
import { AdminListBody, AdminListIntro, InfoRows, useAdminList } from "../AdminList";

const MEMO_MAX = 200;

/** 처리 대기 신고만 (렌더마다 새 함수가 되지 않게 밖에 둡니다) */
const getPendingReports = (params: PageParams) => getAdminReports({ ...params, status: "PENDING" });

/**
 * 신고 관리: 처리 대기(PENDING) 신고 목록 + "처리하기" → 처리 다이얼로그(메모 선택) → 신고 처리 API.
 * Figma 카드의 신고 대상 · 사유 · 처리 상태에 API가 주는 신고한 사람과 접수 시간을 더했습니다.
 */
export function ReportBox() {
  const router = useRouter();
  const list = useAdminList<AdminReportItem>(getPendingReports, "신고 목록을 불러오지 못했어요.");
  const [resolving, setResolving] = useState<AdminReportItem | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useResetOnHide(() => {
    setResolving(null);
    setNotice(null);
  });

  return (
    <div className="flex flex-col">
      <AdminListIntro count={list.status === "ready" ? list.total : null} description="처리를 기다리는 신고 내역이에요." />
      <AdminListBody list={list} notice={notice} emptyTitle="처리할 신고가 없어요" emptyDescription="새 신고가 접수되면 여기에 보여요.">
        <ul className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {list.items.map((r) => (
            <li key={r.reportId}>
              <NoteCard tone="pink" className="flex h-full flex-col px-5.5 pt-2 pb-5.5">
                <InfoRows
                  rows={[
                    { term: "신고 대상", value: `${REPORT_TARGET_LABEL[r.targetType]} · ${r.targetName || "알 수 없음"}` },
                    { term: "신고한 사람", value: r.reporterName || "-" },
                    { term: "사유", value: <span className="whitespace-pre-line">{r.reason}</span> },
                    { term: "접수", value: formatListTime(r.createdAt) },
                    { term: "처리 상태", value: "대기" },
                  ]}
                />
                <Button fullWidth className="mt-auto" onClick={() => setResolving(r)} aria-label={`신고 ${r.reportId}번 처리하기`}>
                  처리하기
                </Button>
              </NoteCard>
            </li>
          ))}
        </ul>
      </AdminListBody>

      {resolving && (
        <ResolveDialog
          key={resolving.reportId}
          report={resolving}
          onClose={() => setResolving(null)}
          onResolved={(already) => {
            list.remove((r) => r.reportId === resolving.reportId);
            setNotice(already ? "이미 처리된 신고였어요." : "신고를 처리했어요.");
            setResolving(null);
          }}
          onForbidden={() => router.replace(ROUTES.members)}
        />
      )}
    </div>
  );
}

/** Figma 신고 처리 다이얼로그: REPORT REVIEW / 신고 처리 / 메모(선택) / 처리 완료 */
function ResolveDialog({
  report,
  onClose,
  onResolved,
  onForbidden,
}: {
  report: AdminReportItem;
  onClose: () => void;
  onResolved: (alreadyResolved: boolean) => void;
  onForbidden: () => void;
}) {
  const memoId = useId();
  const [memo, setMemo] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSending(true);
    setError(null);
    const trimmed = memo.trim();
    try {
      await resolveReport(report.reportId, trimmed ? { memo: trimmed } : undefined);
      onResolved(false);
    } catch (e) {
      if (isAdminForbidden(e)) return onForbidden();
      if (e instanceof ApiError && (e.code === "REPORT409" || e.code === "REPORT404")) return onResolved(true);
      setError(getErrorMessage(e, "처리하지 못했어요. 잠시 후 다시 시도해 주세요."));
      setSending(false);
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title="신고 처리"
      description="신고 내용을 확인하고 처리를 완료해 주세요."
      footer={
        <Button disabled={sending} onClick={submit} className="lg:ml-auto lg:max-w-27.5">
          {sending ? "처리하는 중…" : "처리 완료"}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="border border-line bg-white px-3.5 py-2.5 text-11 text-ink">
          <span className="font-bold">{REPORT_TARGET_LABEL[report.targetType]} · {report.targetName}</span>
          <span className="block pt-0.5 whitespace-pre-line text-muted">{report.reason}</span>
        </p>
        <Field label="메모 (선택)" htmlFor={memoId}>
          <Textarea
            id={memoId}
            maxLength={MEMO_MAX}
            disabled={sending}
            placeholder="처리 메모를 입력해 주세요."
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
          <span className="self-end text-10 text-muted">
            {memo.length}/{MEMO_MAX}
          </span>
        </Field>
        <FormError message={error} />
      </div>
    </Dialog>
  );
}
