import type { Metadata } from "next";
import { OnboardingHeader } from "@/components/layout/OnboardingHeader";
import { PageIntro } from "@/components/ui/PageIntro";
import { ProfileForm } from "./ProfileForm";

export const metadata: Metadata = { title: "프로필 작성 · 인력사무소" };

/** 가입 설정 1/3 — Figma 모바일 · 마이 · 프로필 관리 (1:287). 입력칸은 docs/screens.md 4-1·4-3 결정을 따릅니다. */
export default function OnboardingProfilePage() {
  return (
    <>
      <OnboardingHeader step={1} />
      <main className="flex flex-col gap-7.5 px-4 pt-8.5 pb-13">
        <PageIntro
          variant="flow"
          eyebrow="PROFILE NOTE"
          title="나를 소개하는 메모"
          description="동료들이 나를 잘 알아볼 수 있도록 핵심 정보만 또렷하게 적어주세요."
        />
        <ProfileForm />
      </main>
    </>
  );
}
