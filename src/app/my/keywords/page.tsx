import type { Metadata } from "next";
import { FlowHeader } from "@/components/layout/FlowHeader";
import { MainLayout } from "@/components/layout/MainLayout";
import { Tape } from "@/components/ui/Card";
import { KeywordsForm } from "@/components/ui/KeywordsForm";
import { PageIntro } from "@/components/ui/PageIntro";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "내 키워드 · 인력사무소" };

/**
 * 마이 › 내 키워드 (승인 후).
 * - 모바일: Figma 1:304 (Flow Header "내 키워드", 세 칸 세로 + "저장하기")
 * - PC: Figma 1:639 (온보딩 키워드 등록과 같은 960 카드 + 오른쪽 아래 "저장")
 * 소개 문구는 Figma가 모바일·PC에서 달라 각각 따릅니다.
 */
export default function MyKeywordsPage() {
  return (
    <MainLayout mobileHeader={<FlowHeader title="내 키워드" backHref={ROUTES.my} className="lg:hidden" />} pcTitle="내 키워드">
      <div className="lg:flex lg:justify-center">
        <div className="relative flex flex-col gap-7.5 lg:w-240 lg:gap-8.5 lg:border lg:border-line lg:bg-paper lg:p-12 lg:shadow-hard-lg">
          <Tape tone="blue" className="hidden lg:block" />
          <PageIntro
            variant="flow"
            eyebrow="KEYWORD DESK"
            title="나를 설명하는 단어들"
            description="입력 후 Enter를 누르면 키워드가 추가되고, ×를 누르면 삭제돼요."
            className="lg:hidden"
          />
          <header className="hidden lg:block">
            <p className="text-10 font-bold tracking-eyebrow text-eyebrow">KEYWORD REGISTRATION</p>
            <h1 className="pt-2 font-display text-display-pc text-ink">나를 설명하는 키워드를 붙여주세요</h1>
            <p className="pt-2.5 text-13 text-muted">잘하는 일과 배우고 싶은 것, 관심사를 나누어 적으면 더 잘 맞는 동료를 만날 수 있어요.</p>
          </header>
          <KeywordsForm mode="edit" />
        </div>
      </div>
    </MainLayout>
  );
}
