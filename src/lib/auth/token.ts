import { ROUTES } from "@/lib/routes";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

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
}

/**
 * 로그아웃: 토큰을 지우고 로그인 화면으로 갑니다.
 * 떠난 화면들이 상태를 보관하고 있으므로(Activity) 화면 안 이동 대신 페이지를 새로 불러와 앞 사용자의 화면을 모두 비웁니다.
 */
export function logout() {
  clearTokens();
  if (isBrowser()) window.location.replace(ROUTES.login);
}
