import type { Metadata } from "next";
import { FlowHeader } from "@/components/layout/FlowHeader";
import { TextLink } from "@/components/ui/Button";
import { PageIntro } from "@/components/ui/PageIntro";
import { ROUTES } from "@/lib/routes";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = { title: "회원가입 · 인력사무소" };

/** Figma 모바일 · 계정 · 회원가입 (1:328). 입력칸은 docs/screens.md 4-1의 1번 결정을 따릅니다. */
export default function SignupPage() {
  return (
    <>
      <FlowHeader title="회원가입" />
      <main className="flex flex-col gap-7.5 px-4 pt-8.5 pb-13">
        <PageIntro
          variant="flow"
          eyebrow="START TOGETHER"
          title="함께할 준비를 시작해요"
          description="기본 정보를 남기고 나와 잘 맞는 동료를 만나보세요."
        />
        <SignupForm />
        <p className="text-center">
          <TextLink href={ROUTES.login}>이미 계정이 있나요? 로그인</TextLink>
        </p>
      </main>
    </>
  );
}
