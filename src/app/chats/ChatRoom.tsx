"use client";

import { useParams, useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { Avatar, toneFor } from "@/components/ui/Avatar";
import { IconButton, TextButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { StateMessage } from "@/components/ui/StateMessage";
import { ApiError, getChatRoom, getErrorMessage, getMessages, markAsRead, sendMessage } from "@/lib/api";
import { cn } from "@/lib/cn";
import { formatClock, formatDateDivider, isSameDay } from "@/lib/datetime";
import { ROUTES } from "@/lib/routes";
import { useResetOnHide } from "@/lib/useResetOnHide";
import type { ChatRoomDetailResponse } from "@/types/api";
import { appendOlder, prependMessage, type ChatMessage } from "./chatMessages";
import { useChatRooms } from "./ChatRoomsContext";

const PAGE_SIZE = 30;
const CONTENT_MAX = 1000;
/** 맨 위에서 이만큼 남았을 때 이전 메시지를 미리 불러옵니다 */
const LOAD_OLDER_THRESHOLD = 80;

type Status = "loading" | "ready" | "error";

/**
 * Figma Chat/Conversation: 머리글(아바타 · 이름 · "연결된 멤버") + 메시지 + 입력창.
 * - 메시지 목록은 최신부터 오고, 위로 올리면 nextCursor로 이전 메시지를 불러옵니다.
 * - 보낸 메시지는 전송 API 응답으로 화면에 추가합니다.
 * - 메시지를 불러오면 가장 최신 메시지까지 읽음 처리합니다.
 * - 대화 맨 처음(더 불러올 것이 없을 때)에 "어떻게 연결됐는지" 카드(contextCard)를 보여줍니다.
 */
export function ChatRoom() {
  const params = useParams<{ chatRoomId: string }>();
  const chatRoomId = Number(params.chatRoomId);
  const router = useRouter();
  const { markRead, messageSent } = useChatRooms();
  // 다녀간 채팅방은 숨긴 채 보관되므로(Activity) 입력창 id가 겹치지 않게 만듭니다.
  const inputId = useId();

  const [detail, setDetail] = useState<ChatRoomDetailResponse | null>(null);
  /** 최신이 먼저 (API 순서). 그릴 때 뒤집습니다 */
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [olderError, setOlderError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  /** 이전 메시지를 붙이기 직전의 스크롤 위치 (붙인 뒤 보던 자리를 지킴) */
  const keepPosition = useRef<{ height: number; top: number } | null>(null);
  /** 다음 그리기에서 맨 아래로 내릴지 */
  const scrollToBottom = useRef(false);
  const loadingOlderRef = useRef(false);
  const seq = useRef(0);

  useResetOnHide(() => {
    setSendError(null);
    setOlderError(null);
  });

  const load = useCallback(async () => {
    const mySeq = ++seq.current;
    setStatus((s) => (s === "ready" ? s : "loading"));
    try {
      const [room, page] = await Promise.all([getChatRoom(chatRoomId), getMessages(chatRoomId, { size: PAGE_SIZE })]);
      if (mySeq !== seq.current) return;
      setDetail(room);
      setMessages(page.items);
      setNextCursor(page.hasNext ? page.nextCursor : null);
      setStatus("ready");
      setError(null);
      scrollToBottom.current = true;
      const newest = page.items[0];
      if (newest) {
        markAsRead(chatRoomId, newest.messageId)
          .then(() => markRead(chatRoomId))
          .catch(() => {});
      }
    } catch (e) {
      if (mySeq !== seq.current) return;
      setStatus("error");
      setError(
        e instanceof ApiError && (e.code === "CHAT404" || e.code === "CHAT403" || e.status === 404 || e.status === 403)
          ? "들어갈 수 없는 채팅방이에요."
          : getErrorMessage(e, "대화를 불러오지 못했어요."),
      );
    }
  }, [chatRoomId, markRead]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 방에 들어올 때마다(다른 화면에 갔다 와도) 최신 대화를 불러옵니다.
    void load();
  }, [load]);

  // ── 실시간 수신 자리 (WebSocket) ─────────────────────────────────────────────
  // 팀원이 맡을 예정입니다 (docs/screens.md 8절 "남은 작업" 1번). 붙일 때는 아래처럼 연결하면 됩니다.
  //
  // useEffect(() => {
  //   return connectChatSocket(chatRoomId, (e) => {
  //     if (e.event === "message.new") {
  //       setMessages((prev) => prependMessage(prev, e.data));   // 상대가 보낸 새 메시지
  //       scrollToBottom.current = true;                         // (보던 자리가 맨 아래일 때만 내리는 게 좋음)
  //       void markAsRead(chatRoomId, e.data.messageId).then(() => markRead(chatRoomId));
  //     } else if (e.event === "message.read") {
  //       setMessages((prev) => applyReadReceipt(prev, e.data.lastReadMessageId)); // 내 메시지 읽음 표시
  //     }
  //   });
  // }, [chatRoomId, markRead]);
  //
  // connectChatSocket·applyReadReceipt는 이미 있습니다 (@/lib/api, ./chatMessages).
  // ───────────────────────────────────────────────────────────────────────────

  const loadOlder = useCallback(async () => {
    if (nextCursor === null || loadingOlderRef.current) return;
    loadingOlderRef.current = true;
    setLoadingOlder(true);
    setOlderError(null);
    const mySeq = seq.current;
    try {
      const page = await getMessages(chatRoomId, { cursor: nextCursor, size: PAGE_SIZE });
      if (mySeq !== seq.current) return;
      const el = scrollRef.current;
      if (el) keepPosition.current = { height: el.scrollHeight, top: el.scrollTop };
      setMessages((prev) => appendOlder(prev, page.items));
      setNextCursor(page.hasNext ? page.nextCursor : null);
    } catch (e) {
      if (mySeq === seq.current) setOlderError(getErrorMessage(e, "이전 메시지를 불러오지 못했어요."));
    } finally {
      loadingOlderRef.current = false;
      setLoadingOlder(false);
    }
  }, [chatRoomId, nextCursor]);

  // 메시지가 바뀐 뒤 스크롤 맞추기: 이전 메시지를 붙였으면 보던 자리 유지, 처음·전송 후에는 맨 아래로.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (keepPosition.current) {
      el.scrollTop = el.scrollHeight - keepPosition.current.height + keepPosition.current.top;
      keepPosition.current = null;
    } else if (scrollToBottom.current) {
      el.scrollTop = el.scrollHeight;
      scrollToBottom.current = false;
    }
  }, [messages, status]);

  function onScroll() {
    const el = scrollRef.current;
    if (el && el.scrollTop < LOAD_OLDER_THRESHOLD && nextCursor !== null && !olderError) void loadOlder();
  }

  async function send(e: FormEvent) {
    e.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    setSendError(null);
    try {
      const res = await sendMessage(chatRoomId, content);
      scrollToBottom.current = true;
      setMessages((prev) =>
        prependMessage(prev, { messageId: res.messageId, isMine: true, content: res.content, isRead: false, createdAt: res.createdAt }),
      );
      setDraft("");
      messageSent(chatRoomId, res.content, res.createdAt);
    } catch (err) {
      setSendError(
        err instanceof ApiError && err.code === "CHAT403"
          ? "이 동료와는 지금 대화할 수 없어요."
          : getErrorMessage(err, "메시지를 보내지 못했어요. 잠시 후 다시 시도해 주세요."),
      );
    } finally {
      setSending(false);
    }
  }

  const backButton = (
    <IconButton icon="back" label="채팅 목록으로" onClick={() => router.push(ROUTES.chats)} className="-ml-2.5 lg:hidden" />
  );

  if (status === "error") {
    return (
      <div className="flex flex-1 flex-col">
        <header className="flex h-18.25 shrink-0 items-center border-b border-line px-6 lg:hidden">{backButton}</header>
        <div className="flex flex-1 items-center justify-center">
          <StateMessage type="error" title="대화를 열지 못했어요" description={error} actionLabel="다시 시도" onAction={() => void load()} />
        </div>
      </div>
    );
  }

  const ordered = [...messages].reverse();
  const card = detail?.contextCard;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Figma Chat/Header: 높이 73, 좌우 24 */}
      <header className="flex h-18.25 shrink-0 items-center gap-2.5 border-b border-line bg-paper px-6 max-lg:px-4">
        {backButton}
        {detail ? (
          <>
            <Avatar tone={toneFor(detail.member.memberId)} />
            <div className="flex min-w-0 flex-col">
              <h2 className="truncate text-13 font-bold text-ink">{detail.member.name}</h2>
              <p className="text-9 text-muted">연결된 멤버</p>
            </div>
          </>
        ) : (
          <p className="text-11 text-muted">불러오는 중…</p>
        )}
      </header>

      <div
        ref={scrollRef}
        onScroll={onScroll}
        role="log"
        aria-label={detail ? `${detail.member.name} 님과의 대화` : "대화"}
        className="min-h-0 flex-1 overflow-y-auto bg-paper p-7.5 max-lg:px-4"
      >
        {status === "loading" && (
          <p role="status" className="py-10 text-center text-11 text-muted">
            대화를 불러오는 중…
          </p>
        )}
        {status === "ready" && (
          <>
            {nextCursor !== null && (
              <div className="flex flex-col items-center pb-4">
                <TextButton disabled={loadingOlder} onClick={() => void loadOlder()}>
                  {loadingOlder ? "이전 메시지를 불러오는 중…" : "이전 메시지 보기"}
                </TextButton>
                {olderError && <p className="text-10 text-danger">{olderError}</p>}
              </div>
            )}
            {nextCursor === null && card && (
              <div className="mx-auto mb-6 max-w-90 border border-line bg-white px-4 py-3 text-center">
                <p className="text-9 font-bold tracking-eyebrow text-eyebrow">
                  {card.sourceType === "PROPOSAL" ? "같이 해요 제안으로 연결됐어요" : "모집 글 지원으로 연결됐어요"}
                </p>
                <p className="pt-1 text-11 font-bold text-ink">{card.title}</p>
                {card.content && <p className="line-clamp-3 pt-0.5 text-10 whitespace-pre-line text-muted">{card.content}</p>}
              </div>
            )}
            {ordered.length === 0 && (
              <p className="py-6 text-center text-11 text-muted">아직 메시지가 없어요. 먼저 인사해 보세요.</p>
            )}
            {ordered.map((m, i) => {
              const prev = ordered[i - 1];
              const showDate = !prev || !isSameDay(prev.createdAt, m.createdAt);
              return (
                <Fragment key={m.messageId}>
                  {showDate && (
                    <div className="flex justify-center pb-6">
                      <span className="rounded-full bg-chip px-2.25 py-1 text-9 text-muted">{formatDateDivider(m.createdAt)}</span>
                    </div>
                  )}
                  <Bubble message={m} />
                </Fragment>
              );
            })}
          </>
        )}
      </div>

      {/* Figma Chat/Composer: 첨부(+) 버튼 없음 (4-1의 10번) */}
      <form onSubmit={send} className="shrink-0 border-t border-line bg-paper p-3.5 pb-[max(14px,env(safe-area-inset-bottom))]">
        <div className="flex gap-2">
          <label htmlFor={inputId} className="sr-only">
            메시지
          </label>
          <input
            id={inputId}
            value={draft}
            maxLength={CONTENT_MAX}
            autoComplete="off"
            disabled={status !== "ready"}
            placeholder="메시지를 입력하세요"
            onChange={(e) => {
              setDraft(e.target.value);
              if (sendError) setSendError(null);
            }}
            aria-invalid={sendError ? true : undefined}
            aria-describedby={sendError ? `${inputId}-error` : undefined}
            className="h-10.25 min-w-0 flex-1 border border-line bg-field px-3.25 text-11 text-ink outline-none placeholder:text-muted focus:border-ink disabled:opacity-50"
          />
          <button
            type="submit"
            aria-label={sending ? "보내는 중" : "보내기"}
            disabled={sending || !draft.trim() || status !== "ready"}
            className="inline-flex h-10.25 w-10.5 shrink-0 items-center justify-center border border-ink bg-yellow text-ink transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon name="send" size={20} />
          </button>
        </div>
        {sendError && (
          <p id={`${inputId}-error`} role="alert" className="pt-1.5 text-10 text-danger">
            {sendError}
          </p>
        )}
      </form>
    </div>
  );
}

/** Figma Chat/Bubble: 상대는 흰색 왼쪽, 나는 노랑 오른쪽. 진한 테두리 + 2px 그림자. 옆에 시간(내 메시지는 읽음 여부) */
function Bubble({ message: m }: { message: ChatMessage }) {
  return (
    <div className={cn("flex items-end gap-1.5 pb-2.5", m.isMine ? "flex-row-reverse" : "flex-row")}>
      <p
        className={cn(
          "max-w-[75%] border border-ink px-3.75 py-3 text-11 leading-[17.6px] break-words whitespace-pre-wrap text-ink shadow-hard-sm",
          m.isMine ? "bg-yellow" : "bg-white",
        )}
      >
        {m.content}
      </p>
      <span className={cn("flex shrink-0 flex-col pb-0.5 text-8 text-muted", m.isMine ? "items-end" : "items-start")}>
        {m.isMine && <span>{m.isRead ? "읽음" : "안 읽음"}</span>}
        <span>{formatClock(m.createdAt)}</span>
      </span>
    </div>
  );
}
