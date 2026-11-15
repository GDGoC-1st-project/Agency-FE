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

const BOX =
  "w-full border border-line-strong bg-white/80 px-3.25 text-ink placeholder:text-ink/50 outline-none transition-colors hover:border-ink hover:bg-white focus:border-ink focus:bg-white disabled:opacity-50 aria-invalid:border-danger";

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
  /** 입력창 아래 빨간 안내 문구. 입력창에는 aria-invalid·aria-describedby(`${htmlFor}-error`)를 넣어 주세요. */
  error?: string;
  children: ReactNode;
  className?: string;
}

/** Figma Field/*: 굵은 10px 라벨 + 7px 간격 + 입력창 (+ 오류 문구) */
export function Field({ label, htmlFor, error, children, className }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.75", className)}>
      <label htmlFor={htmlFor} className="text-10 font-bold text-ink">
        {label}
      </label>
      {children}
      {error && (
        <p id={htmlFor ? `${htmlFor}-error` : undefined} className="text-10 text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/** 라벨과 입력창을 한 번에: <TextField label="아이디" error="..." ... /> */
export function TextField({ label, error, id, className, ...rest }: InputProps & { label: string; error?: string }) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <Field label={label} htmlFor={inputId} error={error} className={className}>
      <Input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...rest}
      />
    </Field>
  );
}

/** 양식 전체에 대한 오류 문구 (예: 로그인 실패). 내용이 없으면 그리지 않습니다. */
export function FormError({ message, className }: { message?: string | null; className?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className={cn("border border-danger bg-white px-3.25 py-2.5 text-11 text-danger", className)}>
      {message}
    </p>
  );
}

/**
 * Figma Input/Search: 파란 그림자가 있는 검색창 (모바일 높이 53, PC 60).
 * PC에서는 오른쪽에 "검색" 키 버튼이 보입니다 (form 안에서 submit).
 */
export function SearchInput({ className, ...rest }: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  return (
    <div
      className={cn(
        "flex h-13.25 w-full items-center gap-3 border border-ink bg-paper px-4.5 shadow-search transition-colors focus-within:bg-white hover:bg-hover lg:h-15",
        className,
      )}
    >
      <Icon name="search" className="shrink-0 text-ink" />
      <input
        type="search"
        className="min-w-0 flex-1 bg-transparent text-14 leading-normal text-ink outline-none placeholder:text-ink"
        {...rest}
      />
      <button
        type="submit"
        className="hidden h-6.75 items-center rounded-sm border border-line bg-kbd px-2.25 text-10 text-muted hover:text-ink lg:inline-flex"
      >
        검색
      </button>
    </div>
  );
}
