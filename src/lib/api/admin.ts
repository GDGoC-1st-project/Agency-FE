import { api } from "./client";
import type {
  AdminDashboardResponse,
  AdminReportItem,
  AdminReportListParams,
  AdminReportResolveRequest,
  AdminSignupItem,
  CountedPage,
  PageParams,
} from "@/types/api";

/** 운영 현황 (운영진) */
export function getAdminDashboard() {
  return api.get<AdminDashboardResponse>("/api/v1/admin/dashboard");
}

/** 가입 승인 대기 목록 (운영진) */
export function getPendingSignups(params: PageParams = {}) {
  return api.get<CountedPage<AdminSignupItem>>("/api/v1/admin/signups", params);
}

/** 가입 승인 (운영진) */
export function approveSignup(userId: number) {
  return api.patch(`/api/v1/admin/signups/${userId}/approve`);
}

/** 신고 목록. status 기본 PENDING (운영진) */
export function getAdminReports(params: AdminReportListParams = {}) {
  return api.get<CountedPage<AdminReportItem>>("/api/v1/admin/reports", params);
}

/** 신고 처리. memo는 선택, 200자 이내 (운영진) */
export function resolveReport(reportId: number, body?: AdminReportResolveRequest) {
  return api.patch(`/api/v1/admin/reports/${reportId}/resolve`, body);
}
