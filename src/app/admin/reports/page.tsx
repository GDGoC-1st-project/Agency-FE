import type { Metadata } from "next";
import { FlowHeader } from "@/components/layout/FlowHeader";
import { MainLayout } from "@/components/layout/MainLayout";
import { ROUTES } from "@/lib/routes";
import { ReportBox } from "./ReportBox";

export const metadata: Metadata = { title: "신고 관리 · 인력사무소" };

/** Figma 신고 관리 — 모바일 1:371, PC 1:691 (처리 다이얼로그 포함) */
export default function AdminReportsPage() {
  return (
    <MainLayout mobileHeader={<FlowHeader title="신고 관리" backHref={ROUTES.admin} className="lg:hidden" />} pcTitle="신고 관리">
      <ReportBox />
    </MainLayout>
  );
}
