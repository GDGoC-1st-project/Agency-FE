import { ROUTES } from "@/lib/routes";
import type { OnboardingStep } from "@/types/api";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const ONBOARDING_STEP_KEY = "onboardingStep";
const STEPS: OnboardingStep[] = ["PROFILE", "KEYWORD", "WAITING", "DONE"];

const isBrowser = () => typeof window !== "undefined";

function read(key: string): string | null {
  if (!isBrowser()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  return read(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return read(REFRESH_TOKEN_KEY);
}

/** 재발급하면 이전 refreshToken은 폐기되므로 항상 두 토큰을 함께 저장합니다. */
export function setTokens(tokens: { accessToken: string; refreshToken: string }) {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function clearTokens() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(ONBOARDING_STEP_KEY);
}

/**
 * 마지막으로 알고 있는 가입 단계 (로그인 응답의 onboardingStep).
 * 로그인·회원가입·프로필 작성·키워드 저장·승인 확인 때 `@/lib/api` 함수들이 갱신합니다. 모르면 null.
 */
export function getOnboardingStep(): OnboardingStep | null {
  const value = read(ONBOARDING_STEP_KEY);
  return STEPS.includes(value as OnboardingStep) ? (value as OnboardingStep) : null;
}

export function setOnboardingStep(step: OnboardingStep) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(ONBOARDING_STEP_KEY, step);
  } catch {
    // 저장소를 못 쓰면 다음에 승인 전 API로 다시 알아냅니다.
  }
}

/**
 * 로그아웃: 토큰을 지우고 로그인 화면으로 갑니다.
 * 떠난 화면들이 상태를 보관하고 있으므로(Activity) 화면 안 이동 대신 페이지를 새로 불러와 앞 사용자의 화면을 모두 비웁니다.
 */
export function logout() {
  clearTokens();
  if (isBrowser()) window.location.replace(ROUTES.login);
}
