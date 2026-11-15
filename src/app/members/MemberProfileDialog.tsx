"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { Dialog } from "@/components/layout/Dialog";
import { Avatar, toneFor } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Tape } from "@/components/ui/Card";
import { KeywordTag } from "@/components/ui/Chip";
import { Field, FormError, Textarea } from "@/components/ui/Input";
import { MoreMenu } from "@/components/ui/Menu";
import { StateMessage } from "@/components/ui/StateMessage";
import { ApiError, blockMember, createReport, getErrorMessage, getMember } from "@/lib/api";
import { cn } from "@/lib/cn";
import { DEPARTMENT_LABEL } from "@/lib/labels";
import type { MemberProfileResponse } from "@/types/api";
import { ProposalDialog } from "./ProposalDialog";

type View = "profile" | "report" | "block" | "proposal";

const BANNER_BG = { yellow: "bg-yellow-soft", blue: "bg-blue-soft", pink: "bg-pink-soft", green: "bg-green-soft" } as const;
const REPORT_MAX = 200;

interface Props {
  /** 열 멤버 id. null이면 닫힘 */
  memberId: number | null;
  onClose: () => void;
  /** 차단에 성공하면 호출 (목록에서 빼기 위해 다시 불러오기) */
  onBlocked: () => void;
}

/**
 * Figma Dialog/Member Profile (모바일 1:137, PC 1:423).
 * - "…" 메뉴: 신고하기(사유 입력 → 신고 API), 차단하기(확인 → 차단 API). docs/screens.md 4-1의 7번
 * - "연결 요청 보내기" → 같이해요 제안 다이얼로그 (1:158, 1:446)
 * - "연결 가능" 뱃지와 연락처는 넣지 않습니다 (4-3의 3번 / 디자인에 없음)
 */
export function MemberProfileDialog({ memberId, onClose, onBlocked }: Props) {
  const reportId = useId();
  const [profile, setProfile] = useState<MemberProfileResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [view, setView] = useState<View>("profile");
  const [notice, setNotice] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (id: number) => {
    setProfile(null);
    setLoadError(null);
    try {
      setProfile(await getMember(id));
    } catch (e) {
      setLoadError(getErrorMessage(e, "프로필을 불러오지 못했어요."));
    }
  }, []);

  useEffect(() => {
    if (memberId === null) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 다이얼로그를 열 때마다 처음 상태로 시작합니다.
    setView("profile");
    setNotice(null);
    setReason("");
    setActionError(null);
    setBusy(false);
    void load(memberId);
  }, [memberId, load]);

  if (memberId === null) return null;

  const backToProfile = () => {
    setView("profile");
    setActionError(null);
  };

  async function submitReport() {
    const trimmed = reason.trim();
    if (!trimmed) {
      setActionError("신고 사유를 입력해 주세요.");
      return;
    }
    setBusy(true);
    setActionError(null);
    try {
      await createReport({ targetType: "USER", targetId: memberId!, reason: trimmed });
      setReason("");
      setView("profile");
      setNotice("신고가 접수됐어요. 운영진이 확인할게요.");
    } catch (e) {
      setActionError(
        e instanceof ApiError && e.code === "REPORT409" ? "이미 신고한 멤버예요." : getErrorMessage(e, "신고하지 못했어요. 잠시 후 다시 시도해 주세요."),
      );
    } finally {
      setBusy(false);
    }
  }

  async function submitBlock() {
    setBusy(true);
    setActionError(null);
    try {
      await blockMember(memberId!);
      onBlocked();
    } catch (e) {
      setActionError(
        e instanceof ApiError && e.code === "BLOCK409" ? "이미 차단한 멤버예요." : getErrorMessage(e, "차단하지 못했어요. 잠시 후 다시 시도해 주세요."),
      );
      setBusy(false);
    }
  }

  const name = profile?.name ?? "멤버";

  if (view === "proposal" && profile) {
    return (
      <ProposalDialog
        open
        member={{ memberId: profile.memberId, name: profile.name }}
        onClose={onClose}
        onBack={backToProfile}
      />
    );
  }

  if (view === "report") {
    return (
      <Dialog
        open
        onClose={onClose}
        eyebrow="REPORT"
        title={`${name} 님을 신고할까요?`}
        description="운영진이 내용을 확인한 뒤 조치해요. 신고한 사실은 상대에게 알리지 않아요."
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={backToProfile}>
              취소
            </Button>
            <Button disabled={busy} onClick={submitReport}>
              {busy ? "신고하는 중…" : "신고하기"}
            </Button>
          </>
        }
      >
        <Field label="신고 사유" htmlFor={reportId} error={actionError ?? undefined}>
          <Textarea
            id={reportId}
            maxLength={REPORT_MAX}
            placeholder="어떤 문제가 있었는지 적어 주세요."
            value={reason}
            disabled={busy}
            onChange={(e) => {
              setReason(e.target.value);
              setActionError(null);
            }}
            aria-invalid={actionError ? true : undefined}
            aria-describedby={actionError ? `${reportId}-error` : undefined}
          />
          <span className="self-end text-10 text-muted">
            {reason.length}/{REPORT_MAX}
          </span>
        </Field>
      </Dialog>
    );
  }

  if (view === "block") {
    return (
      <Dialog
        open
        onClose={onClose}
        eyebrow="BLOCK"
        title={`${name} 님을 차단할까요?`}
        description="차단하면 멤버 목록과 모집 글에서 이 멤버가 보이지 않고, 채팅 메시지도 보낼 수 없어요."
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={backToProfile}>
              취소
            </Button>
            <Button disabled={busy} onClick={submitBlock}>
              {busy ? "차단하는 중…" : "차단하기"}
            </Button>
          </>
        }
      >
        <FormError message={actionError} />
      </Dialog>
    );
  }

  const tone = toneFor(memberId);
  const keywords = profile
    ? [...new Set([...profile.keywords.can, ...profile.keywords.learning, ...profile.keywords.interested].map((k) => k.name))]
    : [];

  return (
    <Dialog
      open
      onClose={onClose}
      eyebrow="MEMBER PROFILE"
      title={name}
      description={profile ? `${DEPARTMENT_LABEL[profile.department]} · ${profile.major}` : undefined}
      headerActions={
        profile && (
          <MoreMenu
            label={`${name} 님 메뉴`}
            items={[
              { label: "신고하기", onSelect: () => setView("report") },
              { label: "차단하기", onSelect: () => setView("block") },
            ]}
          />
        )
      }
      visual={
        <div className={cn("relative flex h-45 items-center justify-center", BANNER_BG[tone])}>
          <Tape tone="blue" />
          <Avatar size="lg" tone={tone} />
        </div>
      }
      footer={
        profile && (
          <Button fullWidth icon="send" onClick={() => setView("proposal")}>
            연결 요청 보내기
          </Button>
        )
      }
    >
      {!profile && !loadError && (
        <p role="status" className="py-6 text-center text-12 text-muted">
          프로필을 불러오는 중…
        </p>
      )}
      {loadError && (
        <StateMessage type="error" title="프로필을 불러오지 못했어요" description={loadError} actionLabel="다시 시도" onAction={() => load(memberId)} />
      )}
      {profile && (
        <div className="flex flex-col gap-6">
          {notice && (
            <p role="status" className="border border-ink bg-green-soft px-3.25 py-2.5 text-11 text-ink">
              {notice}
            </p>
          )}
          {profile.bio && <p className="border border-line bg-white/72 p-5 text-14 leading-[23.8px] font-bold text-ink">{profile.bio}</p>}
          {keywords.length > 0 && (
            <div>
              <h3 className="text-12 text-ink">잘하는 일과 관심사</h3>
              <div className="flex flex-wrap gap-1.25 pt-2.5">
                {keywords.map((k) => (
                  <KeywordTag key={k} name={k} size="md" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
}
