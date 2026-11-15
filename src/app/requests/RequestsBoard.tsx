"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRequestCount } from "@/components/layout/RequestCountContext";
import { Button } from "@/components/ui/Button";
import { PageIntro } from "@/components/ui/PageIntro";
import { StateMessage } from "@/components/ui/StateMessage";
import { Tabs } from "@/components/ui/Tabs";
import { acceptRequest, ApiError, getErrorMessage, getReceivedRequests, getSentRequests } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import { useResetOnHide } from "@/lib/useResetOnHide";
import type { Page, ReceivedRequestItem, RequestListParams, RequestStatus, SentRequestItem } from "@/types/api";
import { RejectDialog } from "./RejectDialog";
import { RequestCard, requestKey } from "./RequestCard";

const PAGE_SIZE = 20;

type Tab = "received" | "sent";
type Status = "loading" | "ready" | "error";

/** 받은·보낸 요청 목록 하나 (최신순, "더 보기"로 다음 페이지) */
function useRequestList<T extends { requestType: string; requestId: number }>(
  fetchPage: (params: RequestListParams) => Promise<Page<T>>,
) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [status, setStatus] = useState<Status>("loading");
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
        setPage(result.page);
        setHasNext(result.hasNext);
        setStatus("ready");
        setError(null);
      } catch (e) {
        if (mySeq !== seq.current) return;
        if (nextPage === 0) setStatus("error");
        setError(getErrorMessage(e, "요청을 불러오지 못했어요."));
      } finally {
        if (mySeq === seq.current) setLoadingMore(false);
      }
    },
    [fetchPage],
  );

  /** 수락·거절한 항목을 다시 불러오지 않고 바로 바꿉니다 */
  const update = useCallback((key: string, patch: Partial<T>) => {
    setItems((prev) => prev.map((it) => (requestKey(it) === key ? { ...it, ...patch } : it)));
  }, []);

  return { items, page, hasNext, status, error, loadingMore, load, update };
}

/**
 * 요청 화면: 받은 요청 / 보낸 요청 탭.
 * - 받은 요청: 대기 중이면 "다음에"(거절 사유 다이얼로그) · "수락하기"(수락 후 채팅방 주소로 이동)
 * - 보낸 요청: 상태 표시, 거절됐으면 거절 사유
 * - 수락·거절하면 사이드바 요청 뱃지와 받은 요청 탭 숫자를 바로 하나 줄입니다.
 */
export function RequestsBoard() {
  const router = useRouter();
  const { count: receivedPending, decrease, refresh } = useRequestCount();
  const [tab, setTab] = useState<Tab>("received");
  const [sentPending, setSentPending] = useState(0);
  /** 거절 사유 다이얼로그를 연 요청 */
  const [rejecting, setRejecting] = useState<ReceivedRequestItem | null>(null);
  /** 수락 중인 요청 key */
  const [accepting, setAccepting] = useState<string | null>(null);
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  const received = useRequestList<ReceivedRequestItem>(getReceivedRequests);
  const sent = useRequestList<SentRequestItem>(getSentRequests);
  const { load: loadReceived } = received;
  const { load: loadSent } = sent;

  useResetOnHide(() => {
    setRejecting(null);
    setAccepting(null);
    setCardErrors({});
  });

  useEffect(() => {
    void loadReceived(0);
    void loadSent(0);
    let cancelled = false;
    // 보낸 요청 탭 숫자: 답을 기다리는 보낸 요청 수 (총개수 필드가 없어 최대 100개를 받아 셉니다)
    getSentRequests({ status: "PENDING", size: 100 })
      .then((p) => !cancelled && setSentPending(p.hasNext ? p.items.length + 1 : p.items.length))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [loadReceived, loadSent]);

  /** 이미 다른 곳에서 처리된 요청이면 목록과 뱃지를 서버 기준으로 다시 맞춥니다 */
  const resync = () => {
    void loadReceived(0);
    refresh();
  };

  async function accept(item: ReceivedRequestItem) {
    const key = requestKey(item);
    setAccepting(key);
    setCardErrors((prev) => ({ ...prev, [key]: "" }));
    try {
      const { chatRoomId } = await acceptRequest(item.requestType, item.requestId);
      received.update(key, { status: "ACCEPTED" as RequestStatus });
      decrease();
      router.push(ROUTES.chatRoom(chatRoomId));
    } catch (e) {
      const message =
        e instanceof ApiError && e.code === "REQUEST409"
          ? "이미 처리된 요청이에요."
          : e instanceof ApiError && e.code === "REQUEST404"
            ? "사라진 요청이에요."
            : getErrorMessage(e, "수락하지 못했어요. 잠시 후 다시 시도해 주세요.");
      setCardErrors((prev) => ({ ...prev, [key]: message }));
      if (e instanceof ApiError && (e.code === "REQUEST409" || e.code === "REQUEST404")) resync();
    } finally {
      setAccepting(null);
    }
  }

  const current = tab === "received" ? received : sent;

  return (
    <div className="flex flex-col">
      <PageIntro
        eyebrow="CONNECTION REQUESTS"
        title="도착한 연결 요청을 확인해요"
        description="한 번의 수락이 멋진 팀의 시작이 될 수 있어요."
      />

      <div className="pt-7.5">
        <Tabs
          label="요청 종류"
          value={tab}
          onChange={setTab}
          items={[
            { value: "received", label: "받은 요청", count: receivedPending },
            { value: "sent", label: "보낸 요청", count: sentPending },
          ]}
        />
      </div>

      <div role="tabpanel" aria-label={tab === "received" ? "받은 요청" : "보낸 요청"} className="pt-5.5">
        {current.status === "loading" && (
          <p role="status" className="py-16 text-center text-12 text-muted">
            요청을 불러오는 중…
          </p>
        )}
        {current.status === "error" && (
          <StateMessage
            type="error"
            title="요청을 불러오지 못했어요"
            description={current.error}
            actionLabel="다시 시도"
            onAction={() => current.load(0)}
          />
        )}
        {current.status === "ready" && current.items.length === 0 && (
          <StateMessage
            type="empty"
            title={tab === "received" ? "아직 받은 요청이 없어요" : "아직 보낸 요청이 없어요"}
            description={
              tab === "received"
                ? "누군가 같이 해요 제안을 보내거나 내 모집 글에 지원하면 여기에 보여요."
                : "멤버에게 같이 해요 제안을 보내거나 모집 글에 지원해 보세요."
            }
          />
        )}
        {current.status === "ready" && current.items.length > 0 && (
          <>
            <ul className="flex flex-col gap-3">
              {tab === "received"
                ? received.items.map((item) => {
                    const key = requestKey(item);
                    const busy = accepting === key;
                    return (
                      <li key={key}>
                        <RequestCard
                          direction="received"
                          request={{ ...item, person: item.sender }}
                          error={cardErrors[key]}
                          actions={
                            <>
                              <Button variant="secondary" disabled={accepting !== null} onClick={() => setRejecting(item)}>
                                다음에
                              </Button>
                              <Button disabled={accepting !== null} onClick={() => accept(item)}>
                                {busy ? "수락하는 중…" : "수락하기"}
                              </Button>
                            </>
                          }
                        />
                      </li>
                    );
                  })
                : sent.items.map((item) => (
                    <li key={requestKey(item)}>
                      <RequestCard direction="sent" request={{ ...item, person: item.receiver }} />
                    </li>
                  ))}
            </ul>
            {current.error && <p className="pt-4 text-center text-11 text-danger">{current.error}</p>}
            {current.hasNext && (
              <div className="flex justify-center pt-8">
                <Button variant="secondary" disabled={current.loadingMore} onClick={() => current.load(current.page + 1)}>
                  {current.loadingMore ? "불러오는 중…" : "더 보기"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {rejecting && (
        <RejectDialog
          key={requestKey(rejecting)}
          request={rejecting}
          onClose={() => setRejecting(null)}
          onRejected={(alreadyHandled) => {
            setRejecting(null);
            if (alreadyHandled) {
              setCardErrors((prev) => ({ ...prev, [requestKey(rejecting)]: "이미 처리된 요청이에요." }));
              resync();
              return;
            }
            received.update(requestKey(rejecting), { status: "REJECTED" as RequestStatus });
            decrease();
          }}
        />
      )}
    </div>
  );
}
