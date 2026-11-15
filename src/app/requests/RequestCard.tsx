import type { ReactNode } from "react";
import { Avatar, toneFor } from "@/components/ui/Avatar";
import { BoxCard } from "@/components/ui/Card";
import { Icon, type IconName } from "@/components/ui/Icon";
import { REASON_LABEL, REJECT_REASON_LABEL } from "@/lib/labels";
import type { ReasonType, RejectReason, RequestStatus, RequestType } from "@/types/api";

/** 받은·보낸 요청 항목을 그리는 데 필요한 값 (requestId는 늘 requestType과 같이 다룹니다) */
export interface RequestCardData {
  requestType: RequestType;
  requestId: number;
  /** 받은 요청이면 보낸 사람, 보낸 요청이면 받는 사람 */
  person: { memberId: number; name: string };
  content: string;
  reasonType?: ReasonType | null;
  status: RequestStatus;
  rejectReason?: RejectReason | null;
}

/** React key와 요청 구분에 쓰는 값 */
export const requestKey = (r: { requestType: string; requestId: number }) => `${r.requestType}-${r.requestId}`;

/** 이름 옆 작은 글씨: Figma의 직무 자리. API에 직무가 없어서 요청 종류(+ 제안 사유)를 보여줍니다. */
function kindLabel(r: RequestCardData) {
  if (r.requestType === "APPLICATION") return "모집 글 지원";
  return r.reasonType ? `같이 해요 · ${REASON_LABEL[r.reasonType]}` : "같이 해요 제안";
}

/** PROPOSAL은 제안 메시지, APPLICATION은 모집 글 제목이 오므로 문장으로 감쌉니다. */
function contentText(r: RequestCardData) {
  return r.requestType === "PROPOSAL" ? r.content : `「${r.content}」 모집 글에 지원했어요.`;
}

/** 대기 중이 아니거나 보낸 요청일 때 버튼 대신 보여주는 상태 (Figma PC 보낸 요청의 "응답 대기 중") */
const STATUS: Record<"received" | "sent", Record<RequestStatus, { icon: IconName; text: string }>> = {
  received: {
    PENDING: { icon: "clock", text: "답을 기다리는 중" },
    ACCEPTED: { icon: "chat", text: "수락했어요" },
    REJECTED: { icon: "close", text: "거절했어요" },
  },
  sent: {
    PENDING: { icon: "clock", text: "응답 대기 중" },
    ACCEPTED: { icon: "chat", text: "수락됐어요" },
    REJECTED: { icon: "close", text: "거절됐어요" },
  },
};

interface Props {
  request: RequestCardData;
  direction: "received" | "sent";
  /** 받은 요청 대기 중일 때의 "다음에"·"수락하기" 버튼 */
  actions?: ReactNode;
  /** 버튼 아래 오류 문구 */
  error?: string | null;
}

/**
 * Figma Card/Request (모바일 358 너비, PC 한 줄 1120): 아바타 · 이름 · 요청 내용 + 오른쪽(모바일은 아래) 버튼이나 상태.
 * Figma의 직무·키워드 태그는 요청 API에 없어서 빼고, 이름 옆에 요청 종류를 씁니다.
 */
export function RequestCard({ request: r, direction, actions, error }: Props) {
  const status = STATUS[direction][r.status];
  const showActions = !!actions && r.status === "PENDING";
  return (
    <BoxCard className="flex flex-col gap-4.5 p-5.5 lg:flex-row lg:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-4.5 lg:items-center">
        <Avatar tone={toneFor(r.person.memberId)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="flex flex-wrap items-baseline gap-x-1.75">
            <span className="text-16 font-bold text-ink">{r.person.name}</span>
            <span className="text-10 text-muted">{kindLabel(r)}</span>
          </p>
          <p className="pt-1.75 text-12 break-words whitespace-pre-line text-ink">{contentText(r)}</p>
          {r.status === "REJECTED" && r.rejectReason && (
            <div className="mt-2.5 border border-line bg-white px-3 py-2 text-11 text-ink">
              <p>
                <span className="font-bold">거절 사유</span> · {REJECT_REASON_LABEL[r.rejectReason.type]}
              </p>
              {r.rejectReason.detail && <p className="pt-0.5 whitespace-pre-line text-muted">{r.rejectReason.detail}</p>}
            </div>
          )}
        </div>
      </div>

      {showActions ? (
        <div className="flex flex-col gap-2 pl-14 lg:items-end lg:pl-0">
          <div className="flex gap-2 [&>button]:flex-1 lg:[&>button]:flex-none">{actions}</div>
          {error && (
            <p role="alert" className="text-10 text-danger">
              {error}
            </p>
          )}
        </div>
      ) : (
        <p className="flex items-center gap-1.75 pl-14 text-11 text-muted lg:shrink-0 lg:pl-0">
          <Icon name={status.icon} size={17} />
          {status.text}
        </p>
      )}
    </BoxCard>
  );
}
