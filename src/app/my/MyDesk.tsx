"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Dialog } from "@/components/layout/Dialog";
import { Avatar } from "@/components/ui/Avatar";
import { Button, ButtonLink } from "@/components/ui/Button";
import { FormCard, LinkCard } from "@/components/ui/Card";
import { KeywordTag } from "@/components/ui/Chip";
import { Eyebrow, PageIntro } from "@/components/ui/PageIntro";
import { ProfileForm } from "@/components/ui/ProfileForm";
import { StateMessage } from "@/components/ui/StateMessage";
import { getErrorMessage, getMe, getMyKeywords } from "@/lib/api";
import { logout } from "@/lib/auth/token";
import { DEPARTMENT_LABEL } from "@/lib/labels";
import { ROUTES } from "@/lib/routes";
import { useResetOnHide } from "@/lib/useResetOnHide";
import type { KeywordGroup, MyInfoResponse } from "@/types/api";

type Status = "loading" | "ready" | "error";

const KEYWORD_GROUPS: { key: keyof KeywordGroup; label: string }[] = [
  { key: "can", label: "할 수 있는 것" },
  { key: "learning", label: "배우고 싶은 것" },
  { key: "interested", label: "관심 있는 것" },
];

/**
 * 마이 (Figma 모바일 1:275, PC 1:571): 내 프로필 카드 + "내 정보 관리" 바로가기.
 * - "나의 연결"·"작성한 모집" 통계 카드는 docs/screens.md 4-3의 4번 결정으로 넣지 않습니다.
 *   PC에서 그 자리(오른쪽 열)에는 모바일에만 있던 "내 정보 관리" 바로가기를 둡니다.
 * - 프로필 수정: 모바일은 프로필 수정 화면(/my/profile), PC는 Figma 1:584처럼 이 화면 위 다이얼로그.
 * - "운영 관리" 카드는 role=ADMIN일 때만 보입니다.
 */
export function MyDesk() {
  const [me, setMe] = useState<MyInfoResponse | null>(null);
  const [keywords, setKeywords] = useState<KeywordGroup | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  /** PC 프로필 수정 다이얼로그. 열 때마다 key를 바꿔 새 양식으로 시작합니다 */
  const [editKey, setEditKey] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const seq = useRef(0);

  useResetOnHide(() => {
    setEditKey(null);
    setNotice(null);
  });

  const load = useCallback(async () => {
    const mySeq = ++seq.current;
    setStatus((s) => (s === "ready" ? s : "loading"));
    try {
      const [info, group] = await Promise.all([getMe(), getMyKeywords()]);
      if (mySeq !== seq.current) return;
      setMe(info);
      setKeywords(group);
      setStatus("ready");
    } catch (e) {
      if (mySeq !== seq.current) return;
      setError(getErrorMessage(e, "내 정보를 불러오지 못했어요."));
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 마이에 들어올 때마다 최신 정보를 불러옵니다.
    void load();
  }, [load]);

  const isAdmin = me?.role === "ADMIN";

  const editAction = (
    // Button에 hidden을 바로 주면 inline-flex와 겹치므로 span으로 감싸 모바일·PC를 나눕니다.
    <>
      <span className="lg:hidden">
        <ButtonLink href={ROUTES.myProfile} variant="outline" icon="edit" aria-label="프로필 수정" />
      </span>
      <span className="hidden lg:block">
        <Button variant="outline" icon="edit" onClick={() => setEditKey(Date.now())}>
          프로필 수정
        </Button>
      </span>
    </>
  );

  return (
    <div className="flex flex-col">
      <PageIntro eyebrow="MY DESK" title="나의 작업 책상" description="내 소개와 연결 현황을 한눈에 관리해요." action={editAction} />

      {notice && (
        <p role="status" className="mt-5 border border-line bg-paper px-4 py-3 text-11 text-ink">
          {notice}
        </p>
      )}

      <div className="pt-7.5">
        {status === "loading" && (
          <p role="status" className="py-16 text-center text-12 text-muted">
            내 정보를 불러오는 중…
          </p>
        )}
        {status === "error" && (
          <StateMessage type="error" title="내 정보를 불러오지 못했어요" description={error} actionLabel="다시 시도" onAction={() => void load()} />
        )}
        {status === "ready" && me && keywords && (
          <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,802fr)_minmax(0,355fr)] lg:items-start lg:gap-x-5">
            {/* Figma My profile: 모바일은 가운데 세로, PC는 아바타 왼쪽 가로 (안쪽 여백 48) */}
            <FormCard tape="pink" className="px-6 pt-10 pb-8 lg:px-12 lg:py-12">
              <div className="flex flex-col items-center gap-5.5 text-center lg:flex-row lg:text-left">
                <Avatar size="lg" />
                <div className="flex flex-col">
                  <Eyebrow>MY PROFILE</Eyebrow>
                  <h2 className="pt-1 font-display text-display-md text-ink">{me.name}</h2>
                  <p className="text-11 text-muted">
                    {[me.department && DEPARTMENT_LABEL[me.department], me.major].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
              {me.bio && (
                <blockquote className="mt-8.5 border-l-4 border-yellow bg-field px-5.5 py-5 text-15 font-bold whitespace-pre-line text-ink">
                  {me.bio}
                </blockquote>
              )}
              <div className="flex flex-col gap-3 pt-6">
                {KEYWORD_GROUPS.every(({ key }) => keywords[key].length === 0) ? (
                  <p className="text-11 text-muted">아직 등록한 키워드가 없어요. 내 키워드에서 붙여 보세요.</p>
                ) : (
                  KEYWORD_GROUPS.filter(({ key }) => keywords[key].length > 0).map(({ key, label }) => (
                    <div key={key} className="flex flex-col gap-1.5">
                      <p className="text-10 font-bold text-muted">{label}</p>
                      <div className="flex flex-wrap gap-1.25">
                        {keywords[key].map((k) => (
                          <KeywordTag key={k.keywordId} name={k.name} size="md" />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </FormCard>

            <section aria-labelledby="my-manage" className="flex flex-col">
              <h2 id="my-manage" className="font-display text-display-md text-ink">
                내 정보 관리
              </h2>
              <p className="pt-1.5 text-11 text-muted">{isAdmin ? "키워드와 연결, 운영 상태를 관리해요" : "키워드와 연결을 관리해요"}</p>
              <div className="flex flex-col gap-3.5 pt-5">
                <LinkCard href={ROUTES.myKeywords} icon="key" title="내 키워드" description="잘하는 일과 관심사를 수정해요" tone="yellow" />
                <LinkCard href={ROUTES.myConnections} icon="members" title="내 연결" description="연결된 동료를 한눈에 확인해요" tone="blue" />
                {isAdmin && <LinkCard href={ROUTES.admin} icon="shield" title="운영 관리" description="가입 승인과 신고를 처리해요" tone="green" />}
                {/* Figma에 없는 카드: 승인된 사용자가 로그아웃할 곳이 없어 추가 (아이콘은 Figma 세트의 뒤로가기 화살표) */}
                <LinkCard onClick={logout} icon="back" title="로그아웃" description="이 기기에서 로그아웃하고 로그인 화면으로 가요" tone="pink" />
              </div>
            </section>
          </div>
        )}
      </div>

      {editKey !== null && (
        <Dialog
          key={editKey}
          open
          onClose={() => setEditKey(null)}
          eyebrow="PROFILE EDIT"
          title="나를 소개하는 메모"
          description="동료들이 나를 잘 알아볼 수 있도록 핵심 정보만 또렷하게 적어주세요."
        >
          <ProfileForm
            mode="edit"
            frame="plain"
            onSaved={() => {
              setEditKey(null);
              setNotice("프로필을 고쳤어요.");
              void load();
            }}
          />
        </Dialog>
      )}
    </div>
  );
}
