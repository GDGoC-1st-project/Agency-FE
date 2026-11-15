"use client";

import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

/**
 * Figma Input/Text · Input/Password · Input/Textarea · Field/* · Input/Search.
 * - size "auth": 로그인·회원가입·프로필 (높이 50, 글자 16)
 * - size "dialog": 다이얼로그·폼 안 (높이 43, 글자 11)
 */
type FieldSize = "auth" | "dialog";

const BOX = "w-full border border-line-strong bg-white/80 px-3.25 text-ink placeholder:text-ink/50 outline-none transition-colors hover:border-ink hover:bg-white focus:border-ink focus:bg-white disabled:opacity-50";

const INPUT_SIZE: Record<FieldSize, string> = {
  auth: "h-12.5 text-16",
  dialog: "h-10.75 text-11",
};

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: FieldSize;
}

export function Input({ size = "auth", className, ...rest }: InputProps) {
  return <input className={cn(BOX, INPUT_SIZE[size], className)} {...rest} />;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** dialog: 높이 92, 글자 11 / auth: 높이 122, 글자 16 */
  size?: FieldSize;
}

export function Textarea({ size = "dialog", className, ...rest }: TextareaProps) {
  return (
    <textarea
      className={cn(
        BOX,
        "resize-none py-3",
        size === "auth" ? "h-30.5 text-16 leading-6" : "h-23 text-11 leading-[16.5px]",
        className,
      )}
      {...rest}
    />
  );
}

interface FieldProps {
  label: string;
  /** label을 연결할 입력창 id. 없으면 children에 직접 id를 넣어 주세요. */
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}

/** Figma Field/*: 굵은 10px 라벨 + 7px 간격 + 입력창 */
export function Field({ label, htmlFor, children, className }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.75", className)}>
      <label htmlFor={htmlFor} className="text-10 font-bold text-ink">
        {label}
      </label>
      {children}
    </div>
  );
}

/** 라벨과 입력창을 한 번에: <TextField label="아이디" ... /> */
export function TextField({ label, id, className, ...rest }: InputProps & { label: string }) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <Field label={label} htmlFor={inputId} className={className}>
      <Input id={inputId} {...rest} />
    </Field>
  );
}

/** Figma Input/Search (모바일): 파란 그림자가 있는 검색창 */
export function SearchInput({ className, ...rest }: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  return (
    <label
      className={cn(
        "flex h-13.25 w-full items-center gap-3 border border-ink bg-paper px-4.5 shadow-search transition-colors hover:bg-hover focus-within:bg-white",
        className,
      )}
    >
      <Icon name="search" className="shrink-0 text-ink" />
      <input
        type="search"
        className="min-w-0 flex-1 bg-transparent text-14 leading-normal text-ink placeholder:text-ink outline-none"
        {...rest}
      />
    </label>
  );
}
