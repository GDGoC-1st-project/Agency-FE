import { api } from "./client";
import type {
  MemberListItem,
  MemberProfileResponse,
  MemberSearchParams,
  Page,
} from "@/types/api";

/** 멤버 검색. relation은 keyword와 함께만 적용 */
export function getMembers(params: MemberSearchParams = {}) {
  return api.get<Page<MemberListItem>>("/api/v1/members", params);
}

/** 멤버 프로필 조회 */
export function getMember(memberId: number) {
  return api.get<MemberProfileResponse>(`/api/v1/members/${memberId}`);
}
