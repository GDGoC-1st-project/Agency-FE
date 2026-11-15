import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

export type AvatarTone = "yellow" | "pink" | "blue" | "green";
const TONES: AvatarTone[] = ["yellow", "blue", "pink", "green"];

const TONE_BG: Record<AvatarTone, string> = {
  yellow: "bg-yellow",
  pink: "bg-pink",
  blue: "bg-blue",
  green: "bg-green",
};

/** Figma Avatar(Small) 34 · Avatar(Medium) 38 · Avatar(Large) 84 */
const SIZE = {
  sm: { box: "size-8.5", icon: 24 },
  md: { box: "size-9.5", icon: 24 },
  lg: { box: "size-21", icon: 50 },
} as const;

/** 같은 사람이 늘 같은 색으로 보이도록 id로 색을 고릅니다. */
export function toneFor(id: number): AvatarTone {
  return TONES[Math.abs(id) % TONES.length];
}

interface AvatarProps {
  size?: keyof typeof SIZE;
  tone?: AvatarTone;
  /** 화면 읽기용 이름. 없으면 장식용 */
  label?: string;
  className?: string;
}

/** 사람 모양 아바타. 프로필 사진 기능이 없어서 색으로만 구분합니다. */
export function Avatar({ size = "md", tone = "yellow", label, className }: AvatarProps) {
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border-[1.5px] border-ink text-ink",
        TONE_BG[tone],
        SIZE[size].box,
        className,
      )}
    >
      <Icon name="profile" size={SIZE[size].icon} />
    </span>
  );
}
