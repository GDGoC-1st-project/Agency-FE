import { api } from "./client";
import type { ProposalCreateRequest, ProposalCreateResponse } from "@/types/api";

/** 같이 해요 제안. message는 200자 이내 */
export function createProposal(body: ProposalCreateRequest) {
  return api.post<ProposalCreateResponse>("/api/v1/proposals", body);
}
