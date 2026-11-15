"use client";

import { useId, useState } from "react";
import { Dialog } from "@/components/layout/Dialog";
import { Button } from "@/components/ui/Button";
import { FilterChip } from "@/components/ui/Chip";
import { Field, FormError, Textarea } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";
import { ApiError, createProposal, getErrorMessage } from "@/lib/api";
import { REASON_LABEL, REASONS } from "@/lib/labels";
import type { Member, ReasonType } from "@/types/api";

const MESSAGE_MAX = 200;

interface Props {
  open: boolean;
  member: Member;
  onClose: () => void;
  /** 프로필로 돌아가기 */
  onBack: () => void;
}

/**
 * Figma Dialog/Connection Request (모바일 1:158, PC 1:446): 같이해요 제안.
 * 같이 해요 제안 API는 제안 사유(reasonType)가 필수인데 디자인에 칸이 없어서 사유 칩을 추가했습니다.
 */
export function ProposalDialog({ open, member, onClose, onBack }: Props) {
  const messageId = useId();
  const reasonLabelId = useId();
  const [reasonType, setReasonType] = useState<ReasonType | null>(null);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ reason?: string; message?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function send() {
    const trimmed = message.trim();
    const nextErrors = {
      reason: reasonType ? undefined : "제안 사유를 하나 골라 주세요.",
      message: trimmed ? undefined : "메시지를 입력해 주세요.",
    };
    setErrors(nextErrors);
    setFormError(null);
    if (nextErrors.reason || nextErrors.message) return;

    setSending(true);
    try {
      await createProposal({ receiverId: member.memberId, reasonType: reasonType!, message: trimmed });
      setSent(true);
    } catch (e) {
      setFormError(
        e instanceof ApiError && e.code === "PROPOSAL409"
          ? "이미 연결되었거나 답을 기다리는 제안이 있어요."
          : getErrorMessage(e, "요청을 보내지 못했어요. 잠시 후 다시 시도해 주세요."),
      );
    } finally {
      setSending(false);
    }
  }

  const visual = (
    <span className="inline-flex size-17.5 items-center justify-center rounded-full border border-ink bg-pink shadow-hard">
      <Icon name="send" size={28} className="text-ink" />
    </span>
  );

  if (sent) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        visual={visual}
        eyebrow="CONNECTION"
        title="연결 요청을 보냈어요"
        description={`${member.name} 님이 수락하면 채팅이 열려요. 보낸 요청은 요청 › 보낸 요청에서 볼 수 있어요.`}
        footer={<Button onClick={onClose}>닫기</Button>}
      />
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      visual={visual}
      eyebrow="CONNECTION"
      title="연결 메시지를 남겨보세요"
      description="함께하고 싶은 이유를 짧게 전하면 수락 가능성이 높아져요."
      footer={
        <>
          <Button variant="secondary" disabled={sending} onClick={onBack} className="max-w-24">
            이전
          </Button>
          <Button disabled={sending} onClick={send}>
            {sending ? "보내는 중…" : "요청 보내기"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.75">
          <p id={reasonLabelId} className="text-10 font-bold text-ink">
            제안 사유
          </p>
          <div role="group" aria-labelledby={reasonLabelId} className="flex flex-wrap gap-1.5">
            {REASONS.map((r) => (
              <FilterChip
                key={r}
                selected={reasonType === r}
                disabled={sending}
                onClick={() => {
                  setReasonType(r);
                  setErrors((prev) => ({ ...prev, reason: undefined }));
                }}
              >
                {REASON_LABEL[r]}
              </FilterChip>
            ))}
          </div>
          {errors.reason && <p className="text-10 text-danger">{errors.reason}</p>}
        </div>
        <Field label="메시지" htmlFor={messageId} error={errors.message}>
          <Textarea
            id={messageId}
            maxLength={MESSAGE_MAX}
            disabled={sending}
            placeholder="안녕하세요! 프로필을 보고 이야기 나눠보고 싶어 연락드려요."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setErrors((prev) => ({ ...prev, message: undefined }));
            }}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={errors.message ? `${messageId}-error` : undefined}
          />
          <span className="self-end text-10 text-muted">
            {message.length}/{MESSAGE_MAX}
          </span>
        </Field>
        <FormError message={formError} />
      </div>
    </Dialog>
  );
}
