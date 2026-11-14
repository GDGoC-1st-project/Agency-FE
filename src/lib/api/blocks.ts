import { api } from "./client";

/** 차단 */
export function blockMember(targetMemberId: number) {
  return api.post("/api/v1/blocks", { targetMemberId });
}

/** 차단 해제 */
export function unblockMember(targetMemberId: number) {
  return api.delete(`/api/v1/blocks/${targetMemberId}`);
}
