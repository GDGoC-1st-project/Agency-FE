"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FilterChip } from "@/components/ui/Chip";
import { SearchInput } from "@/components/ui/Input";
import { PageIntro } from "@/components/ui/PageIntro";
import { StateMessage } from "@/components/ui/StateMessage";
import { getErrorMessage, getMembers } from "@/lib/api";
import { DEPARTMENT_LABEL, DEPARTMENTS } from "@/lib/labels";
import { useResetOnHide } from "@/lib/useResetOnHide";
import type { Department, MemberListItem } from "@/types/api";
import { MemberCard } from "./MemberCard";
import { MemberProfileDialog } from "./MemberProfileDialog";

const PAGE_SIZE = 20;

type Status = "loading" | "ready" | "error";

/**
 * 멤버 탐색: 키워드 검색 + 분야 필터 + 카드 목록.
 * 멤버 검색 API는 키워드로만 찾으므로(이름·역할 검색 없음) 안내 문구도 키워드로 맞췄습니다.
 * 인원 수("24명", "6명의 메모")는 총개수가 없어 빼고, 다음 페이지가 있으면 "더 보기"를 둡니다.
 */
export function MembersBoard() {
  const [input, setInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [department, setDepartment] = useState<Department | null>(null);
  const [items, setItems] = useState<MemberListItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const seq = useRef(0);

  // 다른 화면에 갔다가 돌아오면 다이얼로그는 닫혀 있게 합니다.
  useResetOnHide(() => setOpenId(null));

  const load = useCallback(async (nextPage: number) => {
    const mySeq = ++seq.current;
    if (nextPage === 0) setStatus("loading");
    else setLoadingMore(true);
    try {
      const result = await getMembers({ keyword: keyword || undefined, department: department ?? undefined, page: nextPage, size: PAGE_SIZE });
      if (mySeq !== seq.current) return;
      setItems((prev) => (nextPage === 0 ? result.items : [...prev, ...result.items]));
      setPage(result.page);
      setHasNext(result.hasNext);
      setStatus("ready");
      setError(null);
    } catch (e) {
      if (mySeq !== seq.current) return;
      const message = getErrorMessage(e, "멤버를 불러오지 못했어요.");
      if (nextPage === 0) {
        setStatus("error");
        setError(message);
      } else {
        setError(message);
      }
    } finally {
      if (mySeq === seq.current) setLoadingMore(false);
    }
  }, [keyword, department]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 검색 조건이 바뀌면 첫 페이지부터 다시 불러옵니다.
    void load(0);
  }, [load]);

  // 입력을 멈추고 0.3초 뒤 검색 (Enter·PC "검색" 버튼은 바로)
  useEffect(() => {
    const trimmed = input.trim();
    if (trimmed === keyword) return;
    const timer = setTimeout(() => setKeyword(trimmed), 300);
    return () => clearTimeout(timer);
  }, [input, keyword]);

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setKeyword(input.trim());
  }

  function clearSearch() {
    setInput("");
    setKeyword("");
    setDepartment(null);
  }

  const filters: { value: Department | null; label: string }[] = [
    { value: null, label: "전체" },
    ...DEPARTMENTS.map((d) => ({ value: d, label: DEPARTMENT_LABEL[d] })),
  ];

  return (
    <div className="flex flex-col">
      <PageIntro
        title="어떤 멤버를 찾고 있나요?"
        description="관심사와 역할이 잘 맞는 멤버를 둘러보고 가볍게 연결을 시작해 보세요."
      />

      <form role="search" onSubmit={onSearch} className="pt-7.5 lg:pt-12">
        <SearchInput
          aria-label="키워드로 멤버 검색"
          placeholder="키워드로 검색해 보세요 (예: React, 디자인)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </form>

      <div className="flex flex-col gap-3.75 pt-12 lg:flex-row lg:items-end lg:justify-between lg:gap-7.5">
        <h2 className="font-display text-[25px] leading-[37.5px] tracking-[-0.7px] text-ink">함께할 멤버</h2>
        <div role="group" aria-label="분야" className="flex gap-1">
          {filters.map((f) => (
            <FilterChip key={f.label} selected={department === f.value} onClick={() => setDepartment(f.value)}>
              {f.label}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="pt-5.5 lg:pt-7">
        {status === "loading" && (
          <p role="status" className="py-16 text-center text-12 text-muted">
            멤버를 불러오는 중…
          </p>
        )}
        {status === "error" && (
          <StateMessage type="error" title="멤버를 불러오지 못했어요" description={error} actionLabel="다시 시도" onAction={() => load(0)} />
        )}
        {status === "ready" && items.length === 0 && (
          <StateMessage
            type="empty"
            title="조건에 맞는 멤버가 없어요"
            description="다른 키워드나 분야로 찾아보세요."
            actionLabel={keyword || department ? "검색어 지우기" : undefined}
            onAction={clearSearch}
          />
        )}
        {status === "ready" && items.length > 0 && (
          <>
            <ul className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-7">
              {items.map((member, i) => (
                <li key={member.memberId}>
                  <MemberCard member={member} index={i} onOpen={() => setOpenId(member.memberId)} />
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

      <MemberProfileDialog
        memberId={openId}
        onClose={() => setOpenId(null)}
        onBlocked={() => {
          setOpenId(null);
          void load(0);
        }}
      />
    </div>
  );
}
