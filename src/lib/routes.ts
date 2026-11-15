import type { OnboardingStep } from "@/types/api";

/** 화면 경로. 경로 문자열은 여기서만 정의하고 가져다 씁니다. */
export const ROUTES = {
  login: "/login",
  signup: "/signup",
  onboardingProfile: "/onboarding/profile",
  onboardingKeywords: "/onboarding/keywords",
  pendingApproval: "/pending",
  members: "/members",
  recruits: "/recruits",
  requests: "/requests",
  chats: "/chats",
  /** 채팅방 (7단계 채팅 화면에서 만듭니다) */
  chatRoom: (chatRoomId: number) => `/chats/${chatRoomId}`,
  my: "/my",
  myConnections: "/my/connections",
} as const;

/** 로그인 응답의 onboardingStep으로 다음 화면을 정합니다. */
export function pathForOnboardingStep(step: OnboardingStep): string {
  switch (step) {
    case "PROFILE":
      return ROUTES.onboardingProfile;
    case "KEYWORD":
      return ROUTES.onboardingKeywords;
    case "WAITING":
      return ROUTES.pendingApproval;
    case "DONE":
      return ROUTES.members;
  }
}
