"use client";

import { useState, type ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Dialog } from "@/components/layout/Dialog";
import { FlowHeader } from "@/components/layout/FlowHeader";
import { OnboardingHeader } from "@/components/layout/OnboardingHeader";
import { PcTopBar } from "@/components/layout/PcTopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { Avatar, toneFor } from "@/components/ui/Avatar";
import { CountBadge } from "@/components/ui/Badge";
import { Button, IconButton, TextButton } from "@/components/ui/Button";
import { BoxCard, LinkCard, MoreLabel, NoteCard, noteToneAt } from "@/components/ui/Card";
import { FilterChip, KeywordChip, KeywordTag } from "@/components/ui/Chip";
import { Icon, ICON_NAMES } from "@/components/ui/Icon";
import { Field, Input, SearchInput, Textarea, TextField } from "@/components/ui/Input";
import { Logo } from "@/components/ui/Logo";
import { PageIntro } from "@/components/ui/PageIntro";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StateMessage } from "@/components/ui/StateMessage";
import { Tabs } from "@/components/ui/Tabs";
import { ROUTES } from "@/lib/routes";
import type { Department } from "@/types/api";

const COLORS = [
  ["ink", "bg-ink"],
  ["muted", "bg-muted"],
  ["subtle", "bg-subtle"],
  ["eyebrow", "bg-eyebrow"],
  ["note", "bg-note"],
  ["paper", "bg-paper"],
  ["canvas", "bg-canvas"],
  ["line", "bg-line"],
  ["line-strong", "bg-line-strong"],
  ["hover", "bg-hover"],
  ["yellow", "bg-yellow"],
  ["yellow-soft", "bg-yellow-soft"],
  ["blue", "bg-blue"],
  ["blue-soft", "bg-blue-soft"],
  ["pink", "bg-pink"],
  ["pink-soft", "bg-pink-soft"],
  ["green", "bg-green"],
  ["green-soft", "bg-green-soft"],
  ["red", "bg-red"],
  ["danger", "bg-danger"],
] as const;

const TEXT_SIZES = ["text-9", "text-10", "text-11", "text-12", "text-13", "text-14", "text-15", "text-16"] as const;
const DISPLAY_SIZES = [
  "text-display-xl",
  "text-display-lg",
  "text-display-md",
  "text-display-sm",
  "text-display-xs",
  "text-display-2xs",
] as const;

const DEPARTMENTS: { value: Department | "ALL"; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "DEV", label: "개발" },
  { value: "AI", label: "AI" },
  { value: "DESIGN", label: "디자인" },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-t border-line pt-6">
      <h2 className="text-12 font-bold text-ink">{title}</h2>
      {children}
    </section>
  );
}

export function DevCatalog() {
  const [department, setDepartment] = useState<Department | "ALL">("ALL");
  const [tab, setTab] = useState<"received" | "sent">("received");
  const [keywords, setKeywords] = useState(["Python", "데이터 분석", "React"]);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <AppShell requestCount={3} userName="강민지">
      <div className="flex flex-col gap-8">
        <PageIntro
          eyebrow="DESIGN SYSTEM"
          title="컴포넌트 모음"
          description="docs/screens.md 기준 모바일·PC 공통 레이아웃과 components/ui 입니다. 1024px 이상에서 PC 레이아웃으로 바뀝니다. 개발 모드에서만 열립니다."
        />

        <Section title="색 (Tailwind: bg-* / text-* / border-*)">
          <div className="grid grid-cols-3 gap-2">
            {COLORS.map(([name, bg]) => (
              <div key={name} className="flex flex-col gap-1">
                <span className={`h-10 border border-line ${bg}`} />
                <span className="text-9 text-muted">{name}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="글자 (font-sans · font-display)">
          {TEXT_SIZES.map((size) => (
            <p key={size} className={size}>
              <span className="font-bold">{size}</span> 함께할 동료를 찾아요
            </p>
          ))}
          {DISPLAY_SIZES.map((size) => (
            <p key={size} className={`font-display ${size}`}>
              {size.replace("text-", "")} 함께할 동료
            </p>
          ))}
          <p className="text-10 font-bold tracking-eyebrow text-eyebrow">EYEBROW · tracking-eyebrow</p>
        </Section>

        <Section title="아이콘 (Icon)">
          <div className="grid grid-cols-4 gap-3">
            {ICON_NAMES.map((name) => (
              <div key={name} className="flex flex-col items-center gap-1 text-ink">
                <Icon name={name} />
                <span className="text-9 text-muted">{name}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="로고 (Logo)">
          <div className="flex items-center gap-6 pt-2">
            <Logo />
            <Logo variant="onboarding" />
          </div>
        </Section>

        <Section title="버튼 (Button · TextButton · IconButton)">
          <div className="flex flex-wrap gap-3">
            <Button>수락하기</Button>
            <Button variant="secondary">다음에</Button>
            <Button variant="outline" icon="edit">
              프로필 수정
            </Button>
            <Button icon="plus" aria-label="모집 글 쓰기" />
            <Button disabled>비활성</Button>
          </div>
          <Button fullWidth>저장하기</Button>
          <div className="flex gap-2 [&>*]:flex-1">
            <Button variant="secondary">이전</Button>
            <Button>다음</Button>
          </div>
          <div className="flex items-center gap-3">
            <TextButton>이미 계정이 있나요? 로그인</TextButton>
            <IconButton icon="close" label="닫기" variant="round" />
            <IconButton icon="back" label="뒤로 가기" />
          </div>
        </Section>

        <Section title="입력 (Input · Textarea · Field · SearchInput)">
          <SearchInput placeholder="이름, 역할, 키워드로 검색해 보세요" />
          <TextField label="아이디" placeholder="영문·숫자 4~20자" />
          <TextField label="비밀번호" type="password" placeholder="8자 이상 입력해 주세요" />
          <Field label="자기소개 (auth 크기)" htmlFor="dev-bio">
            <Textarea id="dev-bio" size="auth" placeholder="어떤 사람인지 한 문장으로 소개해 주세요" />
          </Field>
          <Field label="제목 (dialog 크기)" htmlFor="dev-title">
            <Input id="dev-title" size="dialog" placeholder="어떤 팀원을 찾고 있나요?" />
          </Field>
          <Field label="거절 사유" htmlFor="dev-reason">
            <Textarea id="dev-reason" placeholder="예: 현재 참여 중인 프로젝트가 있어 이번에는 함께하기 어려워요." />
          </Field>
        </Section>

        <Section title="칩 · 태그 (FilterChip · KeywordTag · KeywordChip)">
          <div className="flex gap-2">
            {DEPARTMENTS.map((d) => (
              <FilterChip key={d.value} selected={department === d.value} onClick={() => setDepartment(d.value)}>
                {d.label}
              </FilterChip>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.25">
            <KeywordTag name="React" />
            <KeywordTag name="TypeScript" />
            <KeywordTag name="기획 협업" />
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.map((k) => (
              <KeywordChip key={k} name={k} onRemove={() => setKeywords((prev) => prev.filter((x) => x !== k))} />
            ))}
            {keywords.length === 0 && (
              <button type="button" className="text-11 text-muted underline" onClick={() => setKeywords(["Python", "데이터 분석", "React"])}>
                다시 채우기
              </button>
            )}
          </div>
        </Section>

        <Section title="뱃지 · 아바타 · 진행 막대 (CountBadge · Avatar · ProgressBar)">
          <div className="flex items-center gap-3">
            <CountBadge count={3} />
            <CountBadge count={2} size="sm" />
            <CountBadge count={120} />
          </div>
          <div className="flex items-center gap-3">
            <Avatar size="sm" />
            <Avatar size="md" tone="blue" />
            <Avatar size="md" tone="pink" />
            <Avatar size="md" tone="green" />
            <Avatar size="lg" />
          </div>
          <ProgressBar value={66} label="가입 설정 진행률" />
        </Section>

        <Section title="탭 (Tabs)">
          <Tabs
            label="요청 종류"
            value={tab}
            onChange={setTab}
            items={[
              { value: "received", label: "받은 요청", count: 3 },
              { value: "sent", label: "보낸 요청", count: 2 },
            ]}
          />
        </Section>

        <Section title="카드 (NoteCard · BoxCard · LinkCard)">
          <p className="text-10 text-muted">멤버·모집 카드는 화면을 만들 때 NoteCard로 조립합니다. 아래는 조립 예시입니다.</p>
          <NoteCard tone={noteToneAt(0)} tape="pink" className="flex flex-col px-6.5 pt-8 pb-5.75">
            <Avatar tone={toneFor(2)} />
            <p className="pt-4.5 font-display text-display-sm">김유진</p>
            <p className="text-11 text-subtle">개발</p>
            <div className="flex flex-wrap gap-1.25 pt-3.5">
              <KeywordTag name="React" />
              <KeywordTag name="TypeScript" />
              <KeywordTag name="기획 협업" />
            </div>
            <div className="pt-4.5">
              <MoreLabel>프로필 보기</MoreLabel>
            </div>
          </NoteCard>
          <NoteCard tone={noteToneAt(1)} tape="blue" className="flex flex-col px-7.5 pt-9 pb-6">
            <p className="pb-5 text-9 text-muted">김유진 작성</p>
            <p className="font-display text-display-xs">마음 기록 앱을 함께 만들 팀원을 찾아요</p>
            <p className="py-3.5 text-11 leading-[1.7] text-note">하루의 감정을 짧게 기록하고 서로 응원하는 서비스를 만들고 있어요.</p>
            <div className="flex flex-wrap gap-1.25">
              <KeywordTag name="백엔드" />
              <KeywordTag name="사이드프로젝트" />
            </div>
            <div className="pt-4.5">
              <MoreLabel>자세히 보기</MoreLabel>
            </div>
          </NoteCard>
          <BoxCard className="relative flex flex-col gap-3 p-4.5 pl-18.5">
            <Avatar className="absolute top-4.5 left-4.5" />
            <p className="flex items-baseline gap-1.5">
              <span className="text-16 font-bold">김유진</span>
              <span className="text-10 text-muted">개발</span>
            </p>
            <p className="text-12">마음 기록 앱을 같이 만들어 보고 싶어요!</p>
            <div className="flex gap-2 [&>*]:flex-1">
              <Button variant="secondary">다음에</Button>
              <Button>수락하기</Button>
            </div>
          </BoxCard>
          <LinkCard href={ROUTES.my} icon="key" title="내 키워드" description="잘하는 일과 관심사를 수정해요" />
          <LinkCard href={ROUTES.my} icon="members" title="내 연결" description="연결된 동료를 한눈에 확인해요" tone="blue" />
          <LinkCard href={ROUTES.my} icon="shield" title="운영 관리" description="가입 승인과 신고를 처리해요" tone="green" />
        </Section>

        <Section title="상태 안내 (StateMessage)">
          <StateMessage type="empty" title="검색 결과가 없어요" description="다른 이름이나 키워드로 찾아보세요." actionLabel="검색어 지우기" onAction={() => {}} />
          <StateMessage type="error" title="내용을 불러오지 못했어요" description="잠시 후 다시 시도해 주세요." actionLabel="다시 시도" onAction={() => {}} />
        </Section>

        <Section title="페이지 소개 (PageIntro)">
          <PageIntro variant="flow" eyebrow="START TOGETHER" title="함께할 준비를 시작해요" description="기본 정보를 남기고 나와 잘 맞는 동료를 만나보세요." />
          <PageIntro
            eyebrow="RECRUIT BOARD"
            title="지금 함께할 팀을 찾아요"
            description="action: 오른쪽 버튼 (모바일은 아이콘만, PC는 글자까지)"
            action={
              <Button icon="plus" aria-label="모집 글 쓰기" className="max-lg:w-11.5 max-lg:px-3">
                <span className="hidden lg:inline">모집 글 쓰기</span>
              </Button>
            }
          />
        </Section>

        <Section title="레이아웃 (TopNav · FlowHeader · OnboardingHeader · BottomNav)">
          <p className="text-10 text-muted">실제 화면에서는 위에 고정됩니다. 하단 내비는 1024px 미만에서 이 페이지 맨 아래에 실제로 붙어 있습니다. TopNav는 1024px 이상에서 숨습니다.</p>
          <div className="-mx-4 flex flex-col gap-3 [&_header]:static">
            <TopNav />
            <FlowHeader title="프로필 작성" />
            <OnboardingHeader step={2} />
          </div>
        </Section>

        <Section title="PC 레이아웃 (Sidebar · PcTopBar · AppShell)">
          <p className="text-10 text-muted">
            1024px 이상에서는 이 페이지 왼쪽에 실제 사이드바가 붙어 있습니다. 아래는 미리보기입니다. 요청 뱃지는 받은 요청 중 대기 개수(여기서는 예시 3), 프로필 진행률은 결정대로 뺐습니다.
          </p>
          <div className="overflow-x-auto border border-line">
            <div className="flex w-max">
              <Sidebar preview requestCount={3} userName="강민지" />
              <div className="w-[640px] bg-canvas">
                <PcTopBar preview />
                <p className="px-18 pt-14 text-12 text-muted">본문 (좌우 여백 72px)</p>
              </div>
            </div>
          </div>
        </Section>

        <Section title="다이얼로그 (Dialog)">
          <Button variant="outline" onClick={() => setDialogOpen(true)}>
            거절 사유 다이얼로그 열기
          </Button>
        </Section>
      </div>
      </AppShell>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        eyebrow="REQUEST RESPONSE"
        title="이번 연결은 정중히 거절할게요"
        description="김유진 님에게 전달할 이유를 짧게 남겨주세요."
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={() => setDialogOpen(false)}>거절하기</Button>
          </>
        }
      >
        <Field label="거절 사유" htmlFor="dev-dialog-reason">
          <Textarea id="dev-dialog-reason" placeholder="예: 현재 참여 중인 프로젝트가 있어 이번에는 함께하기 어려워요." />
        </Field>
      </Dialog>

    </>
  );
}
