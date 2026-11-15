import type { Metadata } from "next";
import { FlowHeader } from "@/components/layout/FlowHeader";
import { TextLink } from "@/components/ui/Button";
import { PageIntro } from "@/components/ui/PageIntro";
import { ROUTES } from "@/lib/routes";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "로그인 · 인력사무소" };

/** Figma 모바일 · 계정 · 로그인 (1:343) */
export default function LoginPage() {
  return (
    <>
      <FlowHeader title="로그인" />
      <main className="flex flex-col gap-7.5 px-4 pt-8.5 pb-13">
        <PageIntro variant="flow" eyebrow="WELCOME BACK" title="다시 만나 반가워요" description="가입한 계정으로 인력사무소에 들어오세요." />
        <LoginForm />
        <p className="text-center">
          <TextLink href={ROUTES.signup}>아직 계정이 없나요? 회원가입</TextLink>
        </p>
      </main>
    </>
  );
}
