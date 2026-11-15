import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode, Ref } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";

/**
 * Figma Button/Primary · Secondary · Outline (모바일, 높이 44).
 * docs/screens.md 5절 통일 결과: Primary 테두리 2px, Secondary 1px, Outline 2px.
 * "이전"·"취소"는 secondary를 씁니다.
 */
type Variant = "primary" | "secondary" | "outline";

const VARIANT: Record<Variant, string> = {
  primary: "border-2 border-ink bg-yellow shadow-hard",
  secondary: "border border-line bg-white hover:border-ink hover:bg-hover",
  outline: "border-2 border-ink bg-paper hover:bg-hover",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** 부모 폭을 꽉 채움 (Type=Full Width) */
  fullWidth?: boolean;
  /** 글자 앞 아이콘 */
  icon?: IconName;
  children?: ReactNode;
}

export function Button({
  variant = "primary",
  fullWidth = false,
  icon,
  type = "button",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-11 shrink-0 items-center justify-center gap-2 text-12 font-bold text-ink transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        children ? "px-4.5" : "w-11.5 px-3",
        fullWidth && "w-full",
        VARIANT[variant],
        className,
      )}
      {...rest}
    >
      {icon && <Icon name={icon} />}
      {children}
    </button>
  );
}

/** Button과 같은 모양의 링크 (다른 화면으로 이동할 때. 예: 연결 동료의 "채팅하기") */
export function ButtonLink({
  variant = "primary",
  fullWidth = false,
  className,
  ...rest
}: ComponentProps<typeof Link> & { variant?: Variant; fullWidth?: boolean }) {
  return (
    <Link
      className={cn(
        "inline-flex h-11 shrink-0 items-center justify-center gap-2 px-4.5 text-12 font-bold text-ink transition-colors",
        fullWidth && "w-full",
        VARIANT[variant],
        className,
      )}
      {...rest}
    />
  );
}

const TEXT_LINK = "p-2.5 text-11 text-muted underline underline-offset-2 transition-colors hover:text-ink";

/** Figma Button/Text Link 모양의 버튼 */
export function TextButton({ type = "button", className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={cn(TEXT_LINK, className)} {...rest} />;
}

/** Figma Button/Text Link: "이미 계정이 있나요? 로그인"처럼 다른 화면으로 가는 작은 글자 링크 */
export function TextLink({ className, ...rest }: ComponentProps<typeof Link>) {
  return <Link className={cn(TEXT_LINK, className)} {...rest} />;
}

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon: IconName;
  /** 화면 읽기용 이름 (필수) */
  label: string;
  /** round: 흰 원형 36px (닫기 등) / plain: 투명 44px (뒤로가기) */
  variant?: "round" | "plain";
  ref?: Ref<HTMLButtonElement>;
}

/** Figma Button/Icon, Button/Icon Utility */
export function IconButton({ icon, label, variant = "plain", type = "button", className, ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center text-ink transition-colors",
        variant === "round"
          ? "size-9 rounded-full border border-line bg-white hover:border-ink hover:bg-hover"
          : "size-11 hover:bg-hover",
        className,
      )}
      {...rest}
    >
      <Icon name={icon} />
    </button>
  );
}
