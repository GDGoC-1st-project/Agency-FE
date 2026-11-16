"use client";

import { useCallback, useEffect, useState } from "react";
import { Dialog } from "@/components/layout/Dialog";
import { Button } from "@/components/ui/Button";
import { NoteCard } from "@/components/ui/Card";
import { KeywordTag } from "@/components/ui/Chip";
import { FormError } from "@/components/ui/Input";
import { StateMessage } from "@/components/ui/StateMessage";
import { ApiError, applyToPost, deletePost, getErrorMessage, getPost } from "@/lib/api";
import { DEPARTMENT_LABEL } from "@/lib/labels";
import type { Department, PostDetailResponse } from "@/types/api";
import { RecruitComposeDialog } from "./RecruitComposeDialog";

type View = "detail" | "delete" | "edit";

interface Props {
  /** 열 글 id. null이면 닫힘 */
  postId: number | null;
  onClose: () => void;
  /** 글을 고치거나 지웠을 때 (목록 다시 불러오기) */
  onChanged: () => void;
}

function roleLabel(role: string) {
  return DEPARTMENT_LABEL[role as Department] ?? role;
}

/**
 * Figma 모집 글 상세 (모바일 1:184, PC 1:476).
 * - 상단 소제목은 D-day 없이 "RECRUIT DETAIL" (docs/screens.md 4-3의 2번)
 * - hasApplied면 "지원했어요"(누를 수 없음), 아니면 "함께하고 싶어요" → 모집글 지원 API
 * - 내가 쓴 글(isAuthor)이면 지원 대신 "삭제하기"(한 번 더 확인) · "수정하기"(작성 다이얼로그를 기존 값으로)
 * - 디자인의 "이런 멤버를 기다려요"에는 모집 역할(requiredRoles)을, 그 아래 "관련 키워드"에 키워드를 보여줍니다.
 */
export function RecruitDetailDialog({ postId, onClose, onChanged }: Props) {
  const [post, setPost] = useState<PostDetailResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [view, setView] = useState<View>("detail");
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (id: number) => {
    setLoadError(null);
    try {
      setPost(await getPost(id));
    } catch (e) {
      setLoadError(
        e instanceof ApiError && e.code === "POST404" ? "삭제됐거나 없는 모집 글이에요." : getErrorMessage(e, "모집 글을 불러오지 못했어요."),
      );
    }
  }, []);

  useEffect(() => {
    if (postId === null) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 다이얼로그를 열 때마다 처음 상태로 시작합니다.
    setPost(null);
    setView("detail");
    setNotice(null);
    setActionError(null);
    setBusy(false);
    void load(postId);
  }, [postId, load]);

  if (postId === null) return null;

  async function apply() {
    if (!post) return;
    setBusy(true);
    setActionError(null);
    try {
      await applyToPost(post.postId);
      setPost({ ...post, hasApplied: true });
      setNotice("지원했어요. 작성자가 수락하면 채팅이 열려요. 요청 › 보낸 요청에서 볼 수 있어요.");
    } catch (e) {
      if (e instanceof ApiError && e.code === "APPLICATION409") {
        setPost({ ...post, hasApplied: true });
        setActionError("이미 지원한 모집 글이에요.");
      } else if (e instanceof ApiError && e.code === "POST404") {
        setActionError("삭제된 모집 글이에요.");
      } else {
        setActionError(getErrorMessage(e, "지원하지 못했어요. 잠시 후 다시 시도해 주세요."));
      }
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!post) return;
    setBusy(true);
    setActionError(null);
    try {
      await deletePost(post.postId);
      onChanged();
      onClose();
    } catch (e) {
      setActionError(
        e instanceof ApiError && e.code === "POST404"
          ? "이미 삭제된 모집 글이에요."
          : getErrorMessage(e, "글을 지우지 못했어요. 잠시 후 다시 시도해 주세요."),
      );
      setBusy(false);
    }
  }

  const backToDetail = () => {
    setView("detail");
    setActionError(null);
  };

  if (view === "edit" && post) {
    return (
      <RecruitComposeDialog
        post={post}
        onClose={onClose}
        onSaved={async (id) => {
          onChanged();
          await load(id);
          setView("detail");
          setNotice("글을 고쳤어요.");
        }}
      />
    );
  }

  if (view === "delete" && post) {
    return (
      <Dialog
        open
        onClose={onClose}
        title="이 모집 글을 지울까요?"
        description="지운 글은 되돌릴 수 없고, 목록에서도 바로 사라져요."
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={backToDetail}>
              취소
            </Button>
            <Button disabled={busy} onClick={remove}>
              {busy ? "지우는 중…" : "삭제하기"}
            </Button>
          </>
        }
      >
        <p className="border border-line bg-white/72 p-4 text-12 font-bold text-ink">{post.title}</p>
        <FormError message={actionError} className="mt-3" />
      </Dialog>
    );
  }

  let footer = null;
  if (post?.isAuthor) {
    footer = (
      <>
        <Button variant="secondary" onClick={() => setView("delete")}>
          삭제하기
        </Button>
        <Button icon="edit" onClick={() => setView("edit")}>
          수정하기
        </Button>
      </>
    );
  } else if (post) {
    footer = (
      <Button fullWidth disabled={busy || post.hasApplied} onClick={apply}>
        {busy ? "지원하는 중…" : post.hasApplied ? "지원했어요" : "함께하고 싶어요"}
      </Button>
    );
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={post?.title ?? "모집 글"}
      description={post ? (post.isAuthor ? "내가 붙인 모집 메모" : `${post.author.name} 님이 붙인 모집 메모`) : undefined}
      footer={footer}
    >
      {!post && !loadError && (
        <p role="status" className="py-6 text-center text-12 text-muted">
          모집 글을 불러오는 중…
        </p>
      )}
      {loadError && (
        <StateMessage type="error" title="모집 글을 불러오지 못했어요" description={loadError} actionLabel="다시 시도" onAction={() => load(postId)} />
      )}
      {post && (
        <div className="flex flex-col gap-4 pt-3">
          {notice && (
            <p role="status" className="border border-ink bg-green-soft px-3.25 py-2.5 text-11 text-ink">
              {notice}
            </p>
          )}
          <NoteCard tone="yellow" tape="pink" className="mt-2 px-7 pt-8.75 pb-7">
            <h3 className="text-12 text-ink">어떤 프로젝트인가요?</h3>
            <p className="pt-2.5 text-12 leading-[21.6px] whitespace-pre-line text-ink">{post.description}</p>
            <h3 className="pt-6 text-12 text-ink">이런 멤버를 기다려요</h3>
            <ul aria-label="모집 역할" className="flex flex-wrap gap-1.25 pt-2.5">
              {post.requiredRoles.map((r) => (
                <li key={r} className="inline-flex h-8.25 items-center rounded-tag border border-ink bg-ink px-2.5 text-11 text-white">
                  {roleLabel(r)}
                </li>
              ))}
            </ul>
            {post.keywords.length > 0 && (
              <>
                <h3 className="pt-5 text-12 text-ink">관련 키워드</h3>
                <div className="flex flex-wrap gap-1.25 pt-2.5">
                  {post.keywords.map((k) => (
                    <KeywordTag key={k} name={k} size="md" />
                  ))}
                </div>
              </>
            )}
          </NoteCard>
          <FormError message={actionError} />
        </div>
      )}
    </Dialog>
  );
}
