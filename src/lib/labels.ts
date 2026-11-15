import type { Department, ReasonType, RejectReasonType, ReportTargetType } from "@/types/api";

/** 분야 표시 이름 (docs/screens.md 4-3: 개발 · AI · 디자인) */
export const DEPARTMENT_LABEL: Record<Department, string> = {
  DEV: "개발",
  AI: "AI",
  DESIGN: "디자인",
};

export const DEPARTMENTS: Department[] = ["DEV", "AI", "DESIGN"];

/** 같이 해요 제안 사유 (backend BACKEND_SPEC.md §4 라벨) */
export const REASON_LABEL: Record<ReasonType, string> = {
  PROJECT: "프로젝트",
  STUDY: "스터디",
  CONTEST: "해커톤·공모전",
  COFFEE_CHAT: "커피챗",
  HOBBY: "취미·관심사",
  ETC: "기타",
};

export const REASONS = Object.keys(REASON_LABEL) as ReasonType[];

/** 요청 거절 사유 (값은 docs/api-list.md RejectReasonType, 이름은 BACKEND_SPEC.md: 일정 불가 / 관심사 불일치 / 모집 마감 / 기타) */
export const REJECT_REASON_LABEL: Record<RejectReasonType, string> = {
  SCHEDULE: "일정이 맞지 않아요",
  NOT_MATCHED: "관심사가 맞지 않아요",
  CLOSED: "모집이 끝났어요",
  ETC: "기타",
};

/** 신고 대상 종류 (운영 관리 › 신고 관리) */
export const REPORT_TARGET_LABEL: Record<ReportTargetType, string> = {
  USER: "멤버",
  POST: "모집 글",
  MESSAGE: "채팅 메시지",
};
