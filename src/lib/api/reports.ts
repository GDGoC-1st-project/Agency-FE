import { api } from "./client";
import type { ReportCreateRequest, ReportCreateResponse } from "@/types/api";

/** 신고 (USER / POST / MESSAGE). reason은 200자 이내 */
export function createReport(body: ReportCreateRequest) {
  return api.post<ReportCreateResponse>("/api/v1/reports", body);
}
