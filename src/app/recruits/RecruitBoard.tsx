"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PageIntro } from "@/components/ui/PageIntro";
import { StateMessage } from "@/components/ui/StateMessage";
import { getErrorMessage, getPosts } from "@/lib/api";
import { useResetOnHide } from "@/lib/useResetOnHide";
import type { PostListItem } from "@/types/api";
import { RecruitCard } from "./RecruitCard";
import { RecruitComposeDialog } from "./RecruitComposeDialog";
import { RecruitDetailDialog } from "./RecruitDetailDialog";

const PAGE_SIZE = 20;

type Status = "loading" | "ready" | "error";

/**
 * 모집 글 목록: 최신순 카드 + 오른쪽 위 "모집 글 쓰기".
 * 분류 필터와 D-day는 빼고(docs/screens.md 4-1의 5번), 다음 페이지가 있으면 "더 보기"를 둡니다.
 */
export function RecruitBoard() {
  const [items, setItems] = useState<PostListItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  /** 작성 다이얼로그. 열 때마다 key를 바꿔 빈 양식으로 시작합니다 */
  const [composeKey, setComposeKey] = useState<number | null>(null);
  const seq = useRef(0);

  // 다른 화면에 갔다가 돌아오면 다이얼로그는 닫혀 있게 합니다.
  useResetOnHide(() => {
    setOpenId(null);
    setComposeKey(null);
  });

  const load = useCallback(async (nextPage: number) => {
    const mySeq = ++seq.current;
    if (nextPage === 0) setStatus((s) => (s === "ready" ? s : "loading"));
    else setLoadingMore(true);
    try {
      const result = await getPosts({ sort: "LATEST", page: nextPage, size: PAGE_SIZE });
      if (mySeq !== seq.current) return;
      setItems((prev) => (nextPage === 0 ? result.items : [...prev, ...result.items]));
      setPage(result.page);
      setHasNext(result.hasNext);
      setStatus("ready");
      setError(null);
    } catch (e) {
      if (mySeq !== seq.current) return;
      const message = getErrorMessage(e, "모집 글을 불러오지 못했어요.");
      if (nextPage === 0) setStatus("error");
      setError(message);
    } finally {
      if (mySeq === seq.current) setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 화면에 들어올 때마다 최신 글을 불러옵니다.
    void load(0);
  }, [load]);

  const openCompose = () => setComposeKey(Date.now());

  return (
    <div className="flex flex-col">
      <PageIntro
        eyebrow="RECRUIT BOARD"
        title="지금 함께할 팀을 찾아요"
        description="마음 가는 공고를 열어보고, 내 자리를 찾아보세요."
        action={
          <Button icon="plus" onClick={openCompose} aria-label="모집 글 쓰기" className="max-lg:w-11.5 max-lg:px-3">
            <span className="hidden lg:inline">모집 글 쓰기</span>
          </Button>
        }
      />

      <div className="pt-7">
        {status === "loading" && (
          <p role="status" className="py-16 text-center text-12 text-muted">
            모집 글을 불러오는 중…
          </p>
        )}
        {status === "error" && (
          <StateMessage type="error" title="모집 글을 불러오지 못했어요" description={error} actionLabel="다시 시도" onAction={() => load(0)} />
        )}
        {status === "ready" && items.length === 0 && (
          <StateMessage
            type="empty"
            title="아직 모집 글이 없어요"
            description="첫 모집 메모를 붙여 함께할 팀원을 찾아보세요."
            actionLabel="모집 글 쓰기"
            onAction={openCompose}
          />
        )}
        {status === "ready" && items.length > 0 && (
          <>
            <ul className="grid grid-cols-1 gap-5 pt-1 lg:grid-cols-2 lg:gap-7">
              {items.map((post, i) => (
                <li key={post.postId}>
                  <RecruitCard post={post} index={i} onOpen={() => setOpenId(post.postId)} />
                </li>
              ))}
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

      <RecruitDetailDialog postId={openId} onClose={() => setOpenId(null)} onChanged={() => void load(0)} />

      {composeKey !== null && (
        <RecruitComposeDialog
          key={composeKey}
          onClose={() => setComposeKey(null)}
          onSaved={(postId) => {
            setComposeKey(null);
            void load(0);
            setOpenId(postId);
          }}
        />
      )}
    </div>
  );
}
