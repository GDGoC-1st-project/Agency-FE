import { ApiError, api } from "./client";
import { getOnboardingStep, setOnboardingStep } from "@/lib/auth/token";
import type {
  MyInfoResponse,
  MyKeywordsResponse,
  MyKeywordsUpdateRequest,
  ProfileCreateRequest,
  ProfileUpdateRequest,
} from "@/types/api";

/** 내 정보 조회 (승인 전 OK). 프로필 미작성이면 major·department·bio·contact가 null */
export function getMe() {
  return api.get<MyInfoResponse>("/api/v1/users/me");
}

/** 프로필 작성 (승인 전 OK). 성공하거나 이미 작성했으면(PROFILE409) 가입 단계를 키워드 등록(KEYWORD)으로 저장합니다. */
export async function createProfile(body: ProfileCreateRequest) {
  try {
    await api.post("/api/v1/users/me/profile", body);
  } catch (e) {
    if (e instanceof ApiError && e.code === "PROFILE409") setOnboardingStep("KEYWORD");
    throw e;
  }
  setOnboardingStep("KEYWORD");
}

/** 프로필 수정 — 보낸 것만 수정 (승인 필요) */
export function updateProfile(body: ProfileUpdateRequest) {
  return api.patch("/api/v1/users/me/profile", body);
}

/**
 * 내 키워드 저장 — 전체 교체, 관계별 20개까지 (승인 전 OK).
 * 가입 중(DONE이 아닐 때) 저장하면 가입 단계를 승인 대기(WAITING)로 저장합니다. 승인 후(마이, DONE)에는 그대로.
 */
export async function updateMyKeywords(body: MyKeywordsUpdateRequest) {
  await api.put("/api/v1/users/me/keywords", body);
  const step = getOnboardingStep();
  if (step !== "DONE") setOnboardingStep("WAITING");
}

/** 내 키워드 조회 (승인 필요) */
export function getMyKeywords() {
  return api.get<MyKeywordsResponse>("/api/v1/users/me/keywords");
}
