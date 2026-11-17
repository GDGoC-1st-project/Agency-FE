import type { Metadata } from "next";
import { FlowHeader } from "@/components/layout/FlowHeader";
import { MainLayout } from "@/components/layout/MainLayout";
import { ROUTES } from "@/lib/routes";
import { ConnectionsBoard } from "./ConnectionsBoard";

export const metadata: Metadata = { title: "연결 멤버 · 인력사무소" };

/** Figma 연결 동료 — 모바일 1:313 (Flow Header "내 연결" + 하단 내비), PC 1:651 (상단바 "연결 동료") */
export default function MyConnectionsPage() {
  return (
    <MainLayout mobileHeader={<FlowHeader title="내 연결" backHref={ROUTES.my} className="lg:hidden" />} pcTitle="연결 멤버">
      <ConnectionsBoard />
    </MainLayout>
  );
}
