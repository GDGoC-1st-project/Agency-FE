import type { Department, ReasonType, RejectReasonType } from "@/types/api";

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

/** 요청 거절 사유 */
export const REJECT_REASON_LABEL: Record<RejectReasonType, string> = {
  SCHEDULE: "일정이 맞지 않아요",
  NOT_MATCHED: "방향이 맞지 않아요",
  CLOSED: "모집이 끝났어요",
  ETC: "기타",
};
