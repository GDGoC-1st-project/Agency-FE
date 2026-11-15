"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { Dialog } from "@/components/layout/Dialog";
import { Button } from "@/components/ui/Button";
import { FilterChip } from "@/components/ui/Chip";
import { Field, FormError, Input, Textarea } from "@/components/ui/Input";
import { KeywordEditor } from "@/components/ui/KeywordEditor";
import { ApiError, createPost, getErrorMessage, searchKeywords, updatePost } from "@/lib/api";
import { DEPARTMENT_LABEL, DEPARTMENTS } from "@/lib/labels";
import type { Department, Keyword, PostDetailResponse } from "@/types/api";

const TITLE_MAX = 50;

interface Props {
  /** 수정할 글. 없으면 새 글 작성 */
  post?: PostDetailResponse;
  onClose: () => void;
  /** 저장에 성공하면 글 id와 함께 호출 */
  onSaved: (postId: number) => void;
}

type Errors = { title?: string; description?: string; roles?: string };

/**
 * 모집 상세 API는 키워드를 이름(string[])으로만 주므로, 수정할 때는 키워드 검색으로 같은 이름을 찾아 id를 되살립니다.
 * 찾지 못한 키워드(삭제된 키워드 등)는 빠지고 안내 문구를 보여줍니다.
 */
async function resolveKeywords(names: string[]): Promise<{ found: Keyword[]; missing: string[] }> {
  const results = await Promise.all(
    names.map(async (name) => {
      const { items } = await searchKeywords({ q: name, size: 10 });
      return items.find((k) => k.name === name) ?? name;
    }),
  );
  return {
    found: results.filter((r): r is Keyword => typeof r !== "string"),
    missing: results.filter((r): r is string => typeof r === "string"),
  };
}

/**
 * Figma 모집 글 작성 (모바일 1:197, PC 1:491). 새 글과 수정이 같은 다이얼로그를 씁니다.
 * 모집 역할(DEV/AI/DESIGN, 1개 이상)은 디자인에 없던 칸이라 추가했습니다 (docs/screens.md 4-1의 4번).
 * 관련 키워드는 키워드 검색으로 고르는 칩 방식(KeywordEditor)입니다.
 * 부모에서 `key`를 바꿔 열 때마다 처음 값으로 시작하게 합니다.
 */
export function RecruitComposeDialog({ post, onClose, onSaved }: Props) {
  const titleId = useId();
  const descriptionId = useId();
  const rolesId = useId();
  const editing = Boolean(post);

  const [title, setTitle] = useState(post?.title ?? "");
  const [description, setDescription] = useState(post?.description ?? "");
  const [roles, setRoles] = useState<Department[]>(
    () => (post?.requiredRoles ?? []).filter((r): r is Department => (DEPARTMENTS as string[]).includes(r)),
  );
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [keywordHint, setKeywordHint] = useState<string | undefined>(post?.keywords.length ? "키워드를 불러오는 중…" : undefined);
  const [resolving, setResolving] = useState(Boolean(post?.keywords.length));
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // 수정: 기존 키워드 이름 → 키워드(id) 되살리기
  useEffect(() => {
    if (!post?.keywords.length) return;
    let alive = true;
    resolveKeywords(post.keywords)
      .then(({ found, missing }) => {
        if (!alive) return;
        setKeywords(found);
        setKeywordHint(missing.length ? `찾을 수 없는 키워드는 빠졌어요: ${missing.map((m) => `#${m}`).join(" ")}` : undefined);
      })
      .catch((e) => {
        if (!alive) return;
        setKeywordHint(getErrorMessage(e, "기존 키워드를 불러오지 못했어요. 다시 골라 주세요."));
      })
      .finally(() => {
        if (alive) setResolving(false);
      });
    return () => {
      alive = false;
    };
  }, [post]);

  function toggleRole(role: Department) {
    setRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
    setErrors((prev) => ({ ...prev, roles: undefined }));
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const t = title.trim();
    const d = description.trim();
    const nextErrors: Errors = {
      title: t ? undefined : "제목을 입력해 주세요.",
      description: d ? undefined : "프로젝트 소개를 입력해 주세요.",
      roles: roles.length ? undefined : "모집 역할을 1개 이상 골라 주세요.",
    };
    setErrors(nextErrors);
    setFormError(null);
    if (nextErrors.title || nextErrors.description || nextErrors.roles) return;

    // 역할은 DEV · AI · DESIGN 순서로 보냅니다.
    const body = {
      title: t,
      description: d,
      requiredRoles: DEPARTMENTS.filter((r) => roles.includes(r)),
      keywordIds: keywords.map((k) => k.keywordId),
    };
    setSaving(true);
    try {
      if (post) {
        await updatePost(post.postId, body);
        onSaved(post.postId);
      } else {
        const { postId } = await createPost(body);
        onSaved(postId);
      }
    } catch (err) {
      setFormError(
        err instanceof ApiError && err.code === "POST404"
          ? "삭제된 모집 글이에요."
          : err instanceof ApiError && err.code === "POST403"
            ? "내가 쓴 글만 고칠 수 있어요."
            : getErrorMessage(err, editing ? "글을 고치지 못했어요. 잠시 후 다시 시도해 주세요." : "글을 올리지 못했어요. 잠시 후 다시 시도해 주세요."),
      );
      setSaving(false);
    }
  }

  const busy = saving || resolving;

  return (
    <Dialog
      open
      onClose={onClose}
      eyebrow={editing ? "EDIT RECRUIT NOTE" : "NEW RECRUIT NOTE"}
      title={editing ? "모집 메모 고치기" : "새 모집 메모 붙이기"}
      description="부담 없이 적어도 괜찮아요. 필요한 내용만 또렷하게 알려주세요."
    >
      <form noValidate onSubmit={submit} className="flex flex-col gap-4 pt-3">
        <Field label="제목" htmlFor={titleId} error={errors.title}>
          <Input
            id={titleId}
            size="dialog"
            maxLength={TITLE_MAX}
            placeholder="어떤 팀원을 찾고 있나요?"
            value={title}
            disabled={saving}
            onChange={(e) => {
              setTitle(e.target.value);
              setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={errors.title ? `${titleId}-error` : undefined}
          />
          <span className="self-end text-10 text-muted">
            {title.length}/{TITLE_MAX}
          </span>
        </Field>

        <Field label="프로젝트 소개" htmlFor={descriptionId} error={errors.description}>
          <Textarea
            id={descriptionId}
            placeholder="만들고 싶은 것을 소개해 주세요."
            value={description}
            disabled={saving}
            onChange={(e) => {
              setDescription(e.target.value);
              setErrors((prev) => ({ ...prev, description: undefined }));
            }}
            aria-invalid={errors.description ? true : undefined}
            aria-describedby={errors.description ? `${descriptionId}-error` : undefined}
          />
        </Field>

        <fieldset aria-describedby={errors.roles ? `${rolesId}-error` : undefined} className="flex flex-col gap-1.75">
          <legend className="pb-1.75 text-10 font-bold text-ink">
            모집 역할 <span className="font-normal text-muted">(여러 개 고를 수 있어요)</span>
          </legend>
          <div className="flex gap-1.5">
            {DEPARTMENTS.map((role) => (
              <FilterChip key={role} selected={roles.includes(role)} disabled={saving} onClick={() => toggleRole(role)}>
                {role}
                <span className="sr-only"> ({DEPARTMENT_LABEL[role]})</span>
              </FilterChip>
            ))}
          </div>
          {errors.roles && (
            <p id={`${rolesId}-error`} className="text-10 text-danger">
              {errors.roles}
            </p>
          )}
        </fieldset>

        <div className="pt-1">
          <KeywordEditor label="관련 키워드" tone="yellow" value={keywords} onChange={setKeywords} disabled={busy} hint={keywordHint} />
        </div>

        <FormError message={formError} />

        <div className="pt-2">
          <Button type="submit" fullWidth disabled={busy}>
            {saving ? (editing ? "고치는 중…" : "올리는 중…") : editing ? "수정 완료하기" : "모집 시작하기"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
