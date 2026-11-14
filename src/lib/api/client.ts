import type { ApiResponse, ErrorCode, TokenResponse } from "@/types/api";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "@/lib/auth/token";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").replace(/\/$/, "");

/** 아직 화면은 없지만, 에러 처리 시 이동할 경로 */
export const ROUTES = {
  login: "/login",
  pendingApproval: "/pending",
} as const;

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ErrorCode | (string & {}),
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type QueryValue = string | number | boolean | null | undefined;

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** JSON으로 직렬화되어 body로 전송 */
  body?: unknown;
  /** undefined / null 값은 빠집니다. */
  query?: object;
  /** false면 Authorization 헤더를 붙이지 않고 401 재발급도 하지 않습니다. (기본 true) */
  auth?: boolean;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: object): string {
  const url = new URL(path.startsWith("/") ? path : `/${path}`, `${API_URL}/`);
  if (query) {
    for (const [key, value] of Object.entries(query) as [string, QueryValue][]) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function parseBody<T>(res: Response): Promise<ApiResponse<T>> {
  const text = await res.text();
  if (text) {
    try {
      return JSON.parse(text) as ApiResponse<T>;
    } catch {
      // JSON이 아닌 응답 (프록시 오류 등)
    }
  }
  return res.ok
    ? { isSuccess: true, code: String(res.status), message: res.statusText }
    : { isSuccess: false, code: `HTTP${res.status}`, message: res.statusText || "요청에 실패했습니다." };
}

function redirectTo(path: string) {
  if (typeof window === "undefined") return;
  if (window.location.pathname !== path) {
    window.location.replace(path);
  }
}

function goToLogin() {
  clearTokens();
  redirectTo(ROUTES.login);
}

// 동시에 여러 요청이 AUTH401을 받아도 재발급은 한 번만 합니다.
let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(buildUrl("/api/v1/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await parseBody<TokenResponse>(res);
    if (data.isSuccess && data.result) {
      setTokens(data.result);
      return true;
    }
    return false; // REFRESH401 등
  } catch {
    return false;
  }
}

function refreshOnce(): Promise<boolean> {
  refreshPromise ??= refreshTokens().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

async function send<T>(path: string, options: ApiRequestOptions): Promise<{ status: number; data: ApiResponse<T> }> {
  const { method = "GET", body, query, auth = true, signal } = options;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });
  return { status: res.status, data: await parseBody<T>(res) };
}

/**
 * 모든 API 호출을 담당하는 공통 함수. 성공하면 `result`를 돌려줍니다.
 * ("없음" 응답이면 undefined)
 *
 * - AUTH401    → refresh로 토큰 재발급 후 한 번 재시도
 * - REFRESH401 → 토큰 삭제 후 로그인 화면으로 이동
 * - AUTH403    → 승인 대기 화면으로 이동
 * - 그 외 실패 → ApiError throw
 */
export async function apiRequest<T = void>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const auth = options.auth ?? true;
  let { status, data } = await send<T>(path, options);

  if (!data.isSuccess && data.code === "AUTH401" && auth) {
    const refreshed = await refreshOnce();
    if (!refreshed) {
      goToLogin();
      throw new ApiError(401, "REFRESH401", "다시 로그인해 주세요.");
    }
    ({ status, data } = await send<T>(path, options));
    if (!data.isSuccess && data.code === "AUTH401") {
      goToLogin();
    }
  }

  if (data.isSuccess) {
    return data.result as T;
  }

  if (data.code === "REFRESH401") {
    goToLogin();
  } else if (data.code === "AUTH403") {
    redirectTo(ROUTES.pendingApproval);
  }

  throw new ApiError(status, data.code, data.message);
}

/** 편의 함수 */
export const api = {
  get: <T>(path: string, query?: object, options?: Omit<ApiRequestOptions, "method" | "query">) =>
    apiRequest<T>(path, { ...options, method: "GET", query }),
  post: <T = void>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: "POST", body }),
  put: <T = void>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: "PUT", body }),
  patch: <T = void>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    apiRequest<T>(path, { ...options, method: "PATCH", body }),
  delete: <T = void>(path: string, options?: Omit<ApiRequestOptions, "method">) =>
    apiRequest<T>(path, { ...options, method: "DELETE" }),
};
