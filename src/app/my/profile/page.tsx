import type { Metadata } from "next";
import { FlowHeader } from "@/components/layout/FlowHeader";
import { MainLayout } from "@/components/layout/MainLayout";
import { ROUTES } from "@/lib/routes";
import { ProfileEditor } from "./ProfileEditor";

export const metadata: Metadata = { title: "프로필 수정 · 인력사무소" };

/**
 * 프로필 수정 (승인 후). Figma 모바일 · 마이 · 프로필 관리 (1:287) 양식을 온보딩과 같이 씁니다.
 * PC는 마이 위 다이얼로그(1:584)로 고치지만, 이 주소로 바로 들어와도 같은 양식을 보여줍니다.
 */
export default function MyProfilePage() {
  return (
    <MainLayout mobileHeader={<FlowHeader title="프로필 수정" backHref={ROUTES.my} className="lg:hidden" />} pcTitle="프로필 수정">
      <ProfileEditor />
    </MainLayout>
  );
}
