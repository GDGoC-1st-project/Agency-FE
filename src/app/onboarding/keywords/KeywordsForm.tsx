"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/Input";
import { KeywordEditor } from "@/components/ui/KeywordEditor";
import { getErrorMessage, updateMyKeywords } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import { useResetOnHide } from "@/lib/useResetOnHide";
import type { Keyword, KeywordGroup } from "@/types/api";

/**
 * 승인 전이라 내 키워드 조회 API(getMyKeywords)는 쓸 수 없습니다 (403). 항상 빈 상태로 시작합니다.
 */
export function KeywordsForm() {
  const router = useRouter();
  const [group, setGroup] = useState<KeywordGroup>({ can: [], learning: [], interested: [] });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // 고른 키워드는 남겨 두고(이전 → 다시 다음), 진행 상태와 오류만 지웁니다.
  useResetOnHide(() => {
    setSaving(false);
    setFormError(null);
  });

  const setRelation = (key: keyof KeywordGroup) => (next: Keyword[]) => setGroup((prev) => ({ ...prev, [key]: next }));
  const ids = (list: Keyword[]) => list.map((k) => k.keywordId);

  async function save() {
    if (saving) return;
    setFormError(null);
    setSaving(true);
    try {
      await updateMyKeywords({ can: ids(group.can), learning: ids(group.learning), interested: ids(group.interested) });
      router.push(ROUTES.pendingApproval);
    } catch (error) {
      setFormError(getErrorMessage(error, "키워드를 저장하지 못했어요. 잠시 후 다시 시도해 주세요."));
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5" aria-busy={saving}>
      <KeywordEditor label="할 수 있는 것" tone="yellow" value={group.can} onChange={setRelation("can")} disabled={saving} />
      <KeywordEditor label="배우고 싶은 것" tone="blue" value={group.learning} onChange={setRelation("learning")} disabled={saving} />
      <KeywordEditor label="관심 있는 것" tone="green" value={group.interested} onChange={setRelation("interested")} disabled={saving} />
      <FormError message={formError} />
      <div className="flex gap-2.5 [&>*]:flex-1">
        <Button variant="secondary" disabled={saving} onClick={() => router.push(ROUTES.onboardingProfile)}>
          이전
        </Button>
        <Button disabled={saving} onClick={save}>
          {saving ? "저장하는 중…" : "다음"}
        </Button>
      </div>
    </div>
  );
}
