"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button, ButtonLink } from "@/components/ui/Button";
import { NoteCard, noteToneAt, type NoteTone } from "@/components/ui/Card";
import { KeywordTag } from "@/components/ui/Chip";
import { PageIntro } from "@/components/ui/PageIntro";
import { StateMessage } from "@/components/ui/StateMessage";
import { getConnections, getErrorMessage } from "@/lib/api";
import { DEPARTMENT_LABEL } from "@/lib/labels";
import { ROUTES } from "@/lib/routes";
import type { ConnectionItem } from "@/types/api";

const PAGE_SIZE = 20;
/** Figma: 노랑 카드엔 분홍 테이프, 파랑 카드엔 초록 테이프 */
const TAPE_FOR: Record<NoteTone, NoteTone> = { yellow: "pink", blue: "green", pink: "blue", green: "yellow" };

type Status = "loading" | "ready" | "error";

/**
 * 연결 동료: 내 연결 목록 카드 + "채팅하기"(그 연결의 채팅방으로 이동).
 * Figma 카드의 빈 아래쪽에는 API가 주는 전공과 대표 키워드(최대 3개)를 넣었습니다.
 * 분야는 4-2의 ⑧ 결정대로 "DEV" 대신 개발·AI·디자인으로 씁니다.
 */
export function ConnectionsBoard() {
  const [items, setItems] = useState<ConnectionItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const seq = useRef(0);

  const load = useCallback(async (nextPage: number) => {
    const mySeq = ++seq.current;
    if (nextPage === 0) setStatus((s) => (s === "ready" ? s : "loading"));
    else setLoadingMore(true);
    try {
      const result = await getConnections({ page: nextPage, size: PAGE_SIZE });
      if (mySeq !== seq.current) return;
      setItems((prev) => (nextPage === 0 ? result.items : [...prev, ...result.items]));
      setPage(result.page);
      setHasNext(result.hasNext);
      setStatus("ready");
      setError(null);
    } catch (e) {
      if (mySeq !== seq.current) return;
      if (nextPage === 0) setStatus("error");
      setError(getErrorMessage(e, "연결 목록을 불러오지 못했어요."));
    } finally {
      if (mySeq === seq.current) setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 화면에 들어올 때마다 최신 연결을 불러옵니다.
    void load(0);
  }, [load]);

  return (
    <div className="flex flex-col">
      <PageIntro
        variant="flow"
        title="나와 연결된 멤버"
        description="프로필을 다시 확인하거나 바로 대화를 이어가세요."
      />

      <div className="pt-7.5">
        {status === "loading" && (
          <p role="status" className="py-16 text-center text-12 text-muted">
            연결 목록을 불러오는 중…
          </p>
        )}
        {status === "error" && (
          <StateMessage type="error" title="연결 목록을 불러오지 못했어요" description={error} actionLabel="다시 시도" onAction={() => load(0)} />
        )}
        {status === "ready" && items.length === 0 && (
          <StateMessage
            type="empty"
            title="아직 연결된 멤버가 없어요"
            description="같이 해요 제안이나 모집 지원이 수락되면 여기에 모여요."
          />
        )}
        {status === "ready" && items.length > 0 && (
          <>
            <ul className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-4.5">
              {items.map((c, i) => {
                const tone = noteToneAt(i);
                return (
                  <li key={c.connectionId}>
                    <NoteCard tone={tone} tape={TAPE_FOR[tone]} className="flex h-full min-h-55 flex-col px-5.5 pt-7 pb-5.5">
                      <div className="flex items-center gap-3 pb-px">
                        <Avatar tone={tone} />
                        <p className="min-w-0 flex-1 truncate font-display text-display-2xs text-ink">{c.member.name}</p>
                        <span className="shrink-0 rounded-full border border-ink px-2.25 py-0.75 text-9 font-bold text-ink">
                          {DEPARTMENT_LABEL[c.member.department]}
                        </span>
                      </div>
                      {c.member.major && <p className="pt-3 text-11 text-note">{c.member.major}</p>}
                      {c.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1.25 pt-3">
                          {c.keywords.map((k) => (
                            <KeywordTag key={k} name={k} />
                          ))}
                        </div>
                      )}
                      <div className="mt-auto pt-5">
                        <ButtonLink href={ROUTES.chatRoom(c.chatRoomId)} aria-label={`${c.member.name} 님과 채팅하기`} fullWidth>
                          채팅하기
                        </ButtonLink>
                      </div>
                    </NoteCard>
                  </li>
                );
              })}
            </ul>
            {error && <p className="pt-4 text-center text-11 text-danger">{error}</p>}
            {hasNext && (
              <div className="flex justify-center pt-8">
                <Button variant="secondary" disabled={loadingMore} onClick={() => load(page + 1)}>
                  {loadingMore ? "불러오는 중…" : "더 보기"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
