"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/Input";
import { KeywordEditor } from "@/components/ui/KeywordEditor";
import { getErrorMessage, getMyKeywords, updateMyKeywords } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import { useResetOnHide } from "@/lib/useResetOnHide";
import type { Keyword, KeywordGroup } from "@/types/api";

const EMPTY: KeywordGroup = { can: [], learning: [], interested: [] };

interface KeywordsFormProps {
  /**
   * onboarding: 가입 설정 2/3. 승인 전이라 내 키워드 조회 API(getMyKeywords)는 쓸 수 없어(403) 빈 상태로 시작합니다.
   *   "이전"(→ 프로필 작성) · "다음"(저장 후 승인 대기).
   * edit: 마이 › 내 키워드 (승인 후). 내 키워드를 불러와 채우고, "저장하기"로 저장한 뒤 마이로 돌아갑니다.
   */
  mode?: "onboarding" | "edit";
}

/**
 * 할 수 있는 것 · 배우고 싶은 것 · 관심 있는 것 세 칸 (KeywordEditor) + 저장.
 * Figma: 온보딩 모바일 1:383 · PC 1:604, 내 키워드 모바일 1:304 · PC 1:639.
 */
export function KeywordsForm({ mode = "onboarding" }: KeywordsFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const [group, setGroup] = useState<KeywordGroup>(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // 고른 키워드는 남겨 두고(이전 → 다시 다음), 진행 상태와 오류만 지웁니다.
  useResetOnHide(() => {
    setSaving(false);
    setFormError(null);
  });

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setGroup(await getMyKeywords());
    } catch (e) {
      setLoadError(getErrorMessage(e, "내 키워드를 불러오지 못했어요."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 마이 › 내 키워드에 들어올 때마다 저장된 키워드를 불러옵니다.
    if (isEdit) void load();
  }, [isEdit, load]);

  const setRelation = (key: keyof KeywordGroup) => (next: Keyword[]) => setGroup((prev) => ({ ...prev, [key]: next }));
  const ids = (list: Keyword[]) => list.map((k) => k.keywordId);

  async function save() {
    if (saving || loading) return;
    setFormError(null);
    setSaving(true);
    try {
      await updateMyKeywords({ can: ids(group.can), learning: ids(group.learning), interested: ids(group.interested) });
      router.push(isEdit ? ROUTES.my : ROUTES.pendingApproval);
    } catch (error) {
      setFormError(getErrorMessage(error, "키워드를 저장하지 못했어요. 잠시 후 다시 시도해 주세요."));
      setSaving(false);
    }
  }

  const disabled = saving || loading;
  const hint = loading ? "키워드를 불러오는 중…" : undefined;

  return (
    // 모바일: 세 칸 세로 + 버튼 / PC: 세 칸 가로(간격 18) + 오른쪽 아래 버튼
    <div className="flex flex-col gap-5" aria-busy={disabled}>
      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-3 lg:items-start lg:gap-4.5">
        <KeywordEditor label="할 수 있는 것" tone="yellow" value={group.can} onChange={setRelation("can")} disabled={disabled} hint={hint} />
        <KeywordEditor label="배우고 싶은 것" tone="blue" value={group.learning} onChange={setRelation("learning")} disabled={disabled} hint={hint} />
        <KeywordEditor label="관심 있는 것" tone="green" value={group.interested} onChange={setRelation("interested")} disabled={disabled} hint={hint} />
      </div>
      {loadError && (
        <div role="alert" className="flex items-center gap-3 text-11 text-danger">
          <span>{loadError}</span>
          <Button variant="secondary" onClick={() => void load()}>
            다시 불러오기
          </Button>
        </div>
      )}
      <FormError message={formError} />
      {isEdit ? (
        // Figma 1:304 모바일: 꽉 찬 "저장하기" / 1:639 PC: 오른쪽 아래 "저장"
        <div className="flex lg:justify-end lg:pt-2.5">
          <Button fullWidth disabled={disabled || !!loadError} onClick={save} className="lg:w-auto">
            {saving ? "저장하는 중…" : (
              <>
                <span className="lg:hidden">저장하기</span>
                <span className="hidden lg:inline">저장</span>
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="flex gap-2.5 [&>*]:flex-1 lg:justify-end lg:pt-2.5 lg:[&>*]:flex-none">
          <Button variant="secondary" disabled={saving} onClick={() => router.push(ROUTES.onboardingProfile)}>
            이전
          </Button>
          <Button disabled={saving} onClick={save}>
            {saving ? "저장하는 중…" : (
              <>
                <span className="lg:hidden">다음</span>
                <span className="hidden lg:inline">등록하고 계속하기</span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
