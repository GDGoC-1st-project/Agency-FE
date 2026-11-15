import { Avatar, toneFor } from "@/components/ui/Avatar";
import { MoreLabel, NoteCard, noteToneAt, type NoteTone } from "@/components/ui/Card";
import { KeywordTag } from "@/components/ui/Chip";
import { DEPARTMENT_LABEL } from "@/lib/labels";
import type { MemberListItem } from "@/types/api";

/** Figma 목록 순서대로: 노랑 카드엔 분홍 테이프, 파랑엔 파랑, 분홍엔 파랑, 초록엔 분홍 */
const TAPE_FOR: Record<NoteTone, NoteTone> = { yellow: "pink", blue: "blue", pink: "blue", green: "pink" };

/**
 * Figma Card/Member (모바일 358×290, PC 355×310): 아바타 · 이름 · 분야 · 대표 키워드 · "프로필 보기".
 * 한 줄 소개와 "연결 가능" 뱃지는 docs/screens.md 4-1의 6번, 4-3의 3번 결정으로 넣지 않습니다.
 * 카드 전체가 버튼이고 누르면 멤버 프로필 다이얼로그가 열립니다.
 */
export function MemberCard({ member, index, onOpen }: { member: MemberListItem; index: number; onOpen: () => void }) {
  const tone = noteToneAt(index);
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${member.name} 프로필 보기`}
      className="block w-full text-left transition-transform hover:-translate-y-1 focus-visible:-translate-y-1"
    >
      <NoteCard tone={tone} tape={TAPE_FOR[tone]} className="flex min-h-72.5 rotate-[0.5deg] flex-col px-6.5 pt-8 pb-5.75 lg:min-h-77.5">
        <Avatar tone={toneFor(member.memberId)} className="-rotate-[0.5deg]" />
        <p className="pt-4.5 font-display text-display-sm text-ink">{member.name}</p>
        <p className="text-11 text-subtle">{DEPARTMENT_LABEL[member.department]}</p>
        {member.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.25 pt-3.5">
            {member.keywords.map((k) => (
              <KeywordTag key={k} name={k} />
            ))}
          </div>
        )}
        <span className="mt-auto pt-4.5">
          <MoreLabel>프로필 보기</MoreLabel>
        </span>
      </NoteCard>
    </button>
  );
}
