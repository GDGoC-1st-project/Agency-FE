"use client";

import { useId, useState } from "react";
import { Dialog } from "@/components/layout/Dialog";
import { Button } from "@/components/ui/Button";
import { FilterChip } from "@/components/ui/Chip";
import { Field, FormError, Textarea } from "@/components/ui/Input";
import { ApiError, getErrorMessage, rejectRequest } from "@/lib/api";
import { REJECT_REASON_LABEL } from "@/lib/labels";
import type { ReceivedRequestItem, RejectReasonType } from "@/types/api";

const DETAIL_MAX = 200;
const REJECT_REASONS = Object.keys(REJECT_REASON_LABEL) as RejectReasonType[];

interface Props {
  request: ReceivedRequestItem;
  onClose: () => void;
  /** 거절이 끝났을 때. 이미 처리됐거나 사라진 요청(REQUEST409·404)이면 alreadyHandled=true */
  onRejected: (alreadyHandled?: boolean) => void;
}

/**
 * Figma 거절 사유 입력 (모바일 1:242, PC 1:542).
 * 요청 거절 API는 사유 종류(reasonType)가 필수라서 Figma의 글 상자 위에 사유 칩을 추가했습니다.
 * 글 상자는 "기타"일 때만 필수이고, 나머지는 선택입니다.
 * 열 때마다 화면에서 key를 바꿔 빈 양식으로 시작합니다.
 */
export function RejectDialog({ request, onClose, onRejected }: Props) {
  const detailId = useId();
  const reasonLabelId = useId();
  const [reasonType, setReasonType] = useState<RejectReasonType | null>(null);
  const [detail, setDetail] = useState("");
  const [errors, setErrors] = useState<{ reason?: string; detail?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const isEtc = reasonType === "ETC";

  async function submit() {
    const trimmed = detail.trim();
    const nextErrors = {
      reason: reasonType ? undefined : "거절 사유를 하나 골라 주세요.",
      detail: isEtc && !trimmed ? "기타를 골랐다면 이유를 적어 주세요." : undefined,
    };
    setErrors(nextErrors);
    setFormError(null);
    if (nextErrors.reason || nextErrors.detail) return;

    setSending(true);
    try {
      await rejectRequest(request.requestType, request.requestId, {
        reasonType: reasonType!,
        ...(trimmed ? { reasonDetail: trimmed } : {}),
      });
      onRejected();
    } catch (e) {
      if (e instanceof ApiError && (e.code === "REQUEST409" || e.code === "REQUEST404")) {
        onRejected(true);
        return;
      }
      setFormError(getErrorMessage(e, "거절하지 못했어요. 잠시 후 다시 시도해 주세요."));
      setSending(false);
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title="이번 연결은 정중히 거절할게요"
      description={`${request.sender.name} 님에게 전달할 이유를 짧게 남겨주세요.`}
      footer={
        <>
          <Button variant="secondary" disabled={sending} onClick={onClose}>
            취소
          </Button>
          <Button disabled={sending} onClick={submit}>
            {sending ? "거절하는 중…" : "거절하기"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.75">
          <p id={reasonLabelId} className="text-10 font-bold text-ink">
            거절 사유
          </p>
          <div role="group" aria-labelledby={reasonLabelId} className="flex flex-wrap gap-1.5">
            {REJECT_REASONS.map((r) => (
              <FilterChip
                key={r}
                selected={reasonType === r}
                disabled={sending}
                onClick={() => {
                  setReasonType(r);
                  setErrors({});
                }}
              >
                {REJECT_REASON_LABEL[r]}
              </FilterChip>
            ))}
          </div>
          {errors.reason && <p className="text-10 text-danger">{errors.reason}</p>}
        </div>
        <Field label={isEtc ? "자세한 이유" : "자세한 이유 (선택)"} htmlFor={detailId} error={errors.detail}>
          <Textarea
            id={detailId}
            maxLength={DETAIL_MAX}
            disabled={sending}
            placeholder="예: 현재 참여 중인 프로젝트가 있어 이번에는 함께하기 어려워요."
            value={detail}
            onChange={(e) => {
              setDetail(e.target.value);
              setErrors((prev) => ({ ...prev, detail: undefined }));
            }}
            aria-required={isEtc || undefined}
            aria-invalid={errors.detail ? true : undefined}
            aria-describedby={errors.detail ? `${detailId}-error` : undefined}
          />
          <span className="self-end text-10 text-muted">
            {detail.length}/{DETAIL_MAX}
          </span>
        </Field>
        <FormError message={formError} />
      </div>
    </Dialog>
  );
}
