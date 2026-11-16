import { MoreLabel, NoteCard, type NoteTone } from "@/components/ui/Card";
import { KeywordTag } from "@/components/ui/Chip";
import type { PostListItem } from "@/types/api";

/** Figma 모집 목록 순서: 노랑 → 분홍 → 파랑 → 초록 (PC 2열에서 노랑·분홍 / 파랑·초록) */
const TONES: NoteTone[] = ["yellow", "pink", "blue", "green"];
/** 카드 색마다 붙은 테이프 색 (Figma 그대로) */
const TAPE_FOR: Record<NoteTone, NoteTone> = { yellow: "yellow", pink: "green", blue: "yellow", green: "green" };

/**
 * Figma Card/Recruit (모바일 358×285, PC 546×285): 작성자 · 제목 · 설명 앞부분 · 키워드 · "자세히 보기".
 * 분류와 D-day 마감일은 넣지 않습니다 (docs/screens.md 4-1의 5번).
 * 카드 전체가 버튼이고 누르면 모집 글 상세 다이얼로그가 열립니다.
 */
export function RecruitCard({ post, index, onOpen }: { post: PostListItem; index: number; onOpen: () => void }) {
  const tone = TONES[index % TONES.length];
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${post.title} 자세히 보기`}
      className="block h-full w-full text-left transition-transform hover:-translate-y-1 focus-visible:-translate-y-1"
    >
      <NoteCard tone={tone} tape={TAPE_FOR[tone]} className="flex h-full min-h-71.25 flex-col px-7.5 pt-9 pb-6">
        <p className="pt-1.75 pb-5 text-12 text-muted">{post.authorName} 작성</p>
        <h3 className="font-display text-display-xs text-ink">{post.title}</h3>
        <div className="py-3.5">
          <p className="line-clamp-2 text-11 leading-[18.7px] text-note">{post.descriptionPreview}</p>
        </div>
        {post.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.25">
            {post.keywords.map((k) => (
              <KeywordTag key={k} name={k} />
            ))}
          </div>
        )}
        <span className="mt-auto pt-4.5">
          <MoreLabel>자세히 보기</MoreLabel>
        </span>
      </NoteCard>
    </button>
  );
}
