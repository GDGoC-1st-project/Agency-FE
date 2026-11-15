import { api } from "./client";
import { setOnboardingStep, setTokens } from "@/lib/auth/token";
import type {
  ApprovalStatusResponse,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  TokenResponse,
} from "@/types/api";

/** 회원가입. 성공하면 받은 토큰을 저장하고, 가입 단계를 프로필 작성(PROFILE)으로 둡니다. */
export async function signup(body: SignupRequest): Promise<SignupResponse> {
  const result = await api.post<SignupResponse>("/api/v1/auth/signup", body, { auth: false });
  setTokens(result);
  setOnboardingStep("PROFILE");
  return result;
}

/** 로그인. 성공하면 받은 토큰과 가입 단계(`onboardingStep`)를 저장합니다. 이동할 화면은 `onboardingStep`으로 정합니다. */
export async function login(body: LoginRequest): Promise<LoginResponse> {
  const result = await api.post<LoginResponse>("/api/v1/auth/login", body, { auth: false });
  setTokens(result);
  setOnboardingStep(result.onboardingStep);
  return result;
}

/**
 * 토큰 재발급. 새 토큰을 저장합니다.
 * 공통 함수가 AUTH401일 때 자동으로 처리하므로 화면에서 직접 부를 일은 거의 없습니다.
 */
export async function refreshToken(token: string): Promise<TokenResponse> {
  const result = await api.post<TokenResponse>("/api/v1/auth/refresh", { refreshToken: token }, { auth: false });
  setTokens(result);
  return result;
}

/** 승인 상태 조회 (승인 전 OK). 승인됐으면 가입 단계를 DONE으로 저장합니다. */
export async function getApprovalStatus(): Promise<ApprovalStatusResponse> {
  const result = await api.get<ApprovalStatusResponse>("/api/v1/auth/approval-status");
  if (result.status === "APPROVED") setOnboardingStep("DONE");
  return result;
}
