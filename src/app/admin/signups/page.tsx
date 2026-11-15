import type { Metadata } from "next";
import { FlowHeader } from "@/components/layout/FlowHeader";
import { MainLayout } from "@/components/layout/MainLayout";
import { ROUTES } from "@/lib/routes";
import { SignupApprovals } from "./SignupApprovals";

export const metadata: Metadata = { title: "가입 승인 · 인력사무소" };

/** Figma 가입 승인 — 모바일 1:362, PC 1:680 */
export default function AdminSignupsPage() {
  return (
    <MainLayout mobileHeader={<FlowHeader title="가입 승인" backHref={ROUTES.admin} className="lg:hidden" />} pcTitle="가입 승인">
      <SignupApprovals />
    </MainLayout>
  );
}
