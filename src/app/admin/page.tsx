import type { Metadata } from "next";
import { FlowHeader } from "@/components/layout/FlowHeader";
import { MainLayout } from "@/components/layout/MainLayout";
import { ROUTES } from "@/lib/routes";
import { AdminDashboard } from "./AdminDashboard";

export const metadata: Metadata = { title: "운영 관리 · 인력사무소" };

/** Figma 운영 관리 — 모바일 1:352, PC 1:668 (마이에서 들어옴, 사이드바는 "마이") */
export default function AdminPage() {
  return (
    <MainLayout mobileHeader={<FlowHeader title="운영 관리" backHref={ROUTES.my} className="lg:hidden" />} pcTitle="운영 관리">
      <AdminDashboard />
    </MainLayout>
  );
}
