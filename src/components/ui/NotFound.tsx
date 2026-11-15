import { ButtonLink } from "./Button";
import { Logo } from "./Logo";

interface NotFoundProps {
  title?: string;
  description?: string;
  /** 버튼 이동 위치. 기본 "/" (로그인했으면 멤버, 아니면 로그인으로 보냄) */
  href?: string;
  actionLabel?: string;
}

/**
 * 없는 주소(404) 안내. Figma에 화면이 없어 기존 모양(로고, 큰 제목, Primary 버튼)으로 만들었습니다.
 * `app/not-found.tsx`가 쓰고, 화면 안에서 "없는 항목"을 보여줄 때도 쓸 수 있습니다.
 */
export function NotFound({
  title = "찾는 화면이 없어요",
  description = "주소가 바뀌었거나 잘못 입력됐을 수 있어요. 처음 화면에서 다시 시작해 주세요.",
  href = "/",
  actionLabel = "처음으로 가기",
}: NotFoundProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <Logo variant="mobile" />
      <div className="flex flex-col items-center gap-2">
        <p className="font-display text-display-2xl text-ink" aria-hidden>
          404
        </p>
        <h1 className="font-display text-display-md text-ink">{title}</h1>
        <p className="max-w-80 text-13 text-muted">{description}</p>
      </div>
      <ButtonLink href={href}>{actionLabel}</ButtonLink>
    </main>
  );
}
