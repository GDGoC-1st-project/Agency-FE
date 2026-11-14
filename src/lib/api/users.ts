import { api } from "./client";
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

/** 프로필 작성 (승인 전 OK) */
export function createProfile(body: ProfileCreateRequest) {
  return api.post("/api/v1/users/me/profile", body);
}

/** 프로필 수정 — 보낸 것만 수정 (승인 필요) */
export function updateProfile(body: ProfileUpdateRequest) {
  return api.patch("/api/v1/users/me/profile", body);
}

/** 내 키워드 저장 — 전체 교체, 관계별 20개까지 (승인 전 OK) */
export function updateMyKeywords(body: MyKeywordsUpdateRequest) {
  return api.put("/api/v1/users/me/keywords", body);
}

/** 내 키워드 조회 (승인 필요) */
export function getMyKeywords() {
  return api.get<MyKeywordsResponse>("/api/v1/users/me/keywords");
}
