"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { getErrorMessage, searchKeywords } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useResetOnHide } from "@/lib/useResetOnHide";
import type { Keyword } from "@/types/api";
import { KeywordChip } from "./Chip";

export type KeywordEditorTone = "yellow" | "blue" | "green";

const TONE_BG: Record<KeywordEditorTone, string> = {
  yellow: "bg-yellow-soft",
  blue: "bg-blue-soft",
  green: "bg-green-soft",
};

/** docs/api-list.md: 관계별 최대 20개 */
export const MAX_KEYWORDS_PER_RELATION = 20;

interface KeywordEditorProps {
  /** "할 수 있는 것" · "배우고 싶은 것" · "관심 있는 것" */
  label: string;
  tone: KeywordEditorTone;
  value: Keyword[];
  onChange: (next: Keyword[]) => void;
  disabled?: boolean;
  /** 고를 수 있는 최대 개수 (기본: 관계별 20개) */
  max?: number;
  /** 입력창 아래 안내 문구 (예: "키워드를 불러오는 중…") */
  hint?: string;
}

/**
 * Figma Keyword/Category (모바일): 관계 하나의 키워드 편집 칸.
 * 입력하면 키워드 검색 API로 자동완성 → 목록에서 고르거나 Enter로 추가 → 칩을 누르면 삭제.
 * 승인 전 화면(온보딩)과 마이 › 내 키워드, 모집 글 작성(관련 키워드)에서 함께 씁니다.
 */
export function KeywordEditor({
  label,
  tone,
  value,
  onChange,
  disabled = false,
  max = MAX_KEYWORDS_PER_RELATION,
  hint,
}: KeywordEditorProps) {
  const inputId = useId();
  const listId = useId();
  const [query, setQuery] = useState("");
  /** 마지막 검색 결과와 그 결과가 어떤 검색어의 것인지 */
  const [search, setSearch] = useState<{ q: string; items: Keyword[]; error: string | null }>({ q: "", items: [], error: null });
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const requestSeq = useRef(0);

  // 화면을 떠나면 검색 목록을 닫고 검색어를 비웁니다.
  useResetOnHide(() => {
    setOpen(false);
    setQuery("");
  });

  const full = value.length >= max;
  const trimmed = query.trim();
  // 지금 입력한 검색어의 결과가 아직 안 왔으면 "찾는 중"
  const loading = trimmed.length > 0 && search.q !== trimmed;
  // 이미 고른 키워드는 목록에서 뺍니다.
  const options = loading ? [] : search.items.filter((k) => !value.some((v) => v.keywordId === k.keywordId));

  useEffect(() => {
    if (!trimmed) return;
    const seq = ++requestSeq.current;
    const timer = setTimeout(async () => {
      try {
        const { items } = await searchKeywords({ q: trimmed, size: 10 });
        if (seq !== requestSeq.current) return; // 더 최근 입력의 결과만 반영
        setSearch({ q: trimmed, items, error: null });
      } catch (e) {
        if (seq !== requestSeq.current) return;
        setSearch({ q: trimmed, items: [], error: getErrorMessage(e, "키워드를 불러오지 못했어요.") });
      }
      setActive(0);
    }, 200);
    return () => clearTimeout(timer);
  }, [trimmed]);

  function add(keyword: Keyword) {
    if (full || value.some((v) => v.keywordId === keyword.keywordId)) return;
    onChange([...value, keyword]);
    setQuery("");
    setOpen(false);
  }

  function remove(keywordId: number) {
    onChange(value.filter((v) => v.keywordId !== keywordId));
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" && options.length) {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % options.length);
    } else if (e.key === "ArrowUp" && options.length) {
      e.preventDefault();
      setActive((i) => (i - 1 + options.length) % options.length);
    } else if (e.key === "Enter") {
      // 폼 제출을 막고, 강조된(없으면 첫 번째) 키워드를 추가합니다.
      e.preventDefault();
      const pick = options[active] ?? options[0];
      if (pick) add(pick);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showList = open && trimmed.length > 0;

  return (
    <section className={cn("p-5.5 shadow-paper lg:p-6", TONE_BG[tone])}>
      <label htmlFor={inputId} className="block text-12 font-bold text-ink">
        {label}
        <span className="sr-only"> 키워드 추가</span>
      </label>
      <div className="relative mt-2.5">
        <input
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && options[active] ? `${listId}-${options[active].keywordId}` : undefined}
          autoComplete="off"
          disabled={disabled || full}
          placeholder={full ? `최대 ${max}개까지 고를 수 있어요.` : "키워드를 검색해 주세요."}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          className="h-12 w-full border border-ink bg-white/78 px-3.25 text-16 text-ink outline-none placeholder:text-ink focus:bg-white disabled:opacity-60"
        />
        {showList && (
          <ul
            id={listId}
            role="listbox"
            aria-label={`${label} 키워드 검색 결과`}
            className="absolute inset-x-0 top-full z-20 max-h-60 overflow-y-auto border border-t-0 border-ink bg-paper shadow-hard-sm"
          >
            {loading && <li className="px-3.25 py-2.5 text-12 text-muted">찾는 중…</li>}
            {!loading && search.error && <li className="px-3.25 py-2.5 text-12 text-danger">{search.error}</li>}
            {!loading && !search.error && options.length === 0 && (
              <li className="px-3.25 py-2.5 text-12 text-muted">일치하는 키워드가 없어요.</li>
            )}
            {options.map((k, i) => (
              <li
                key={k.keywordId}
                id={`${listId}-${k.keywordId}`}
                role="option"
                aria-selected={i === active}
                // blur보다 먼저 실행되도록 mousedown에서 추가
                onMouseDown={(e) => {
                  e.preventDefault();
                  add(k);
                }}
                onMouseEnter={() => setActive(i)}
                className={cn("cursor-pointer px-3.25 py-2.5 text-14 text-ink", i === active && "bg-yellow-soft")}
              >
                #{k.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      {hint && <p className="pt-2.5 text-11 text-muted">{hint}</p>}
      {value.length > 0 && (
        <ul aria-label={`${label}로 고른 키워드`} className="flex flex-wrap gap-1.5 pt-3.5">
          {value.map((k) => (
            <li key={k.keywordId}>
              <KeywordChip name={k.name} onRemove={disabled ? undefined : () => remove(k.keywordId)} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
