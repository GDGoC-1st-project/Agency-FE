"use client";

import { useRouter } from "next/navigation";
import { PageIntro } from "@/components/ui/PageIntro";
import { ProfileForm } from "@/components/ui/ProfileForm";
import { ROUTES } from "@/lib/routes";

/** 저장하면 마이로 돌아갑니다. */
export function ProfileEditor() {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-7.5">
      <PageIntro
        variant="flow"
        title="나를 소개하는 메모"
        description="나를 표현하는 핵심 정보를 간단하게 적어주세요."
      />
      <ProfileForm mode="edit" onSaved={() => router.push(ROUTES.my)} />
    </div>
  );
}
