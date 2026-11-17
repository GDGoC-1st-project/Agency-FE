"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { StateMessage } from "@/components/ui/StateMessage";
import { getErrorMessage } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import type { CountedPage, PageParams } from "@/types/api";
import { isAdminForbidden } from "./AdminGuard";

const PAGE_SIZE = 20;

/**
 * 운영진 목록(가입 승인 대기 · 신고) 공통 상태: 첫 페이지 + "더 보기", totalCount, 처리한 항목 빼기.
 * 운영진이 아니면(ADMIN403) 멤버 화면으로 보냅니다.
 */
export function useAdminList<T>(fetchPage: (params: PageParams) => Promise<CountedPage<T>>, fallbackError: string) {
  const router = useRouter();
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const seq = useRef(0);

  const load = useCallback(
    async (nextPage: number) => {
      const mySeq = ++seq.current;
      if (nextPage === 0) setStatus((s) => (s === "ready" ? s : "loading"));
      else setLoadingMore(true);
      try {
        const result = await fetchPage({ page: nextPage, size: PAGE_SIZE });
        if (mySeq !== seq.current) return;
        setItems((prev) => (nextPage === 0 ? result.items : [...prev, ...result.items]));
        setTotal(result.totalCount);
        setPage(result.page);
        setHasNext(result.hasNext);
        setStatus("ready");
        setError(null);
      } catch (e) {
        if (mySeq !== seq.current) return;
        if (isAdminForbidden(e)) return router.replace(ROUTES.members);
        if (nextPage === 0) setStatus("error");
        setError(getErrorMessage(e, fallbackError));
      } finally {
        if (mySeq === seq.current) setLoadingMore(false);
      }
    },
    [fetchPage, fallbackError, router],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 들어올 때마다 최신 목록을 불러옵니다.
    void load(0);
  }, [load]);

  /** 처리(승인·신고 처리)한 항목을 목록에서 빼고 총개수를 줄입니다 */
  const remove = useCallback((match: (item: T) => boolean) => {
    setItems((prev) => prev.filter((it) => !match(it)));
    setTotal((t) => Math.max(0, t - 1));
  }, []);

  return { items, total, hasNext, status, error, loadingMore, reload: () => load(0), loadMore: () => load(page + 1), remove };
}

/** Figma 가입 승인·신고 관리 머리: 큰 "2건" + 설명 */
export function AdminListIntro({ count, description }: { count: number | null; description: string }) {
  return (
    <header className="flex flex-col lg:max-w-88.75">
      {count !== null && <p className="font-display text-display-md text-ink">{count}건</p>}
      <p className="pt-2 text-10 text-muted">{description}</p>
    </header>
  );
}

/** 목록 본문: 불러오는 중 / 오류 / 비어 있음 / 카드들 + 더 보기 */
export function AdminListBody<T>({
  list,
  emptyTitle,
  emptyDescription,
  notice,
  children,
}: {
  list: ReturnType<typeof useAdminList<T>>;
  emptyTitle: string;
  emptyDescription: string;
  notice?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 pt-6">
      {notice && (
        <p role="status" className="border border-line bg-paper px-4 py-3 text-11 text-ink">
          {notice}
        </p>
      )}
      {list.status === "loading" && (
        <p role="status" className="py-16 text-center text-12 text-muted">
          불러오는 중…
        </p>
      )}
      {list.status === "error" && (
        <StateMessage type="error" title="목록을 불러오지 못했어요" description={list.error} actionLabel="다시 시도" onAction={() => void list.reload()} />
      )}
      {list.status === "ready" && list.items.length === 0 && <StateMessage type="empty" title={emptyTitle} description={emptyDescription} />}
      {list.status === "ready" && list.items.length > 0 && (
        <>
          {children}
          {list.error && <p className="text-center text-11 text-danger">{list.error}</p>}
          {list.hasNext && (
            <div className="flex justify-center pt-4">
              <Button variant="secondary" disabled={list.loadingMore} onClick={() => void list.loadMore()}>
                {list.loadingMore ? "불러오는 중…" : "더 보기"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/** Figma Definition List: 왼쪽 항목 이름(82px, 굵은 11px 회색) + 오른쪽 값 */
export function InfoRows({ rows }: { rows: { term: string; value: ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-[82px_minmax(0,1fr)] gap-x-2.5 gap-y-2.25 py-5 text-11">
      {rows.map((r) => (
        <div key={r.term} className="contents">
          <dt className="font-bold text-muted">{r.term}</dt>
          <dd className="break-words text-ink">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
