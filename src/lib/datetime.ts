import type { LocalDateTime } from "@/types/api";

/**
 * API 날짜("2026-10-05T10:00:00", 타임존 없음·서울 시간)를 화면 문구로 바꿉니다.
 * 타임존 없는 ISO 문자열은 브라우저 시간대로 읽히므로 서울 시간 기준 사용자에게 그대로 맞습니다.
 */
export function parseDateTime(value: LocalDateTime): Date {
  return new Date(value);
}

const DAY_NAMES = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** 오늘 0시 기준 며칠 전인지 (오늘 0, 어제 1) */
function daysAgo(d: Date, now: Date) {
  return Math.round((startOfDay(now) - startOfDay(d)) / 86_400_000);
}

/** "오후 2:14" */
export function formatClock(value: LocalDateTime): string {
  const d = parseDateTime(value);
  const h = d.getHours();
  return `${h < 12 ? "오전" : "오후"} ${h % 12 === 0 ? 12 : h % 12}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** 채팅 목록 시간 (Figma: "오후 2:14" · "어제" · "월요일"), 일주일이 넘으면 "10월 5일" */
export function formatListTime(value: LocalDateTime, now = new Date()): string {
  const d = parseDateTime(value);
  const ago = daysAgo(d, now);
  if (ago <= 0) return formatClock(value);
  if (ago === 1) return "어제";
  if (ago < 7) return DAY_NAMES[d.getDay()];
  if (d.getFullYear() !== now.getFullYear()) return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/** 채팅 날짜 구분 (Figma: "오늘"), 그 밖에는 "어제" · "10월 5일 월요일" */
export function formatDateDivider(value: LocalDateTime, now = new Date()): string {
  const d = parseDateTime(value);
  const ago = daysAgo(d, now);
  if (ago <= 0) return "오늘";
  if (ago === 1) return "어제";
  const year = d.getFullYear() !== now.getFullYear() ? `${d.getFullYear()}년 ` : "";
  return `${year}${d.getMonth() + 1}월 ${d.getDate()}일 ${DAY_NAMES[d.getDay()]}`;
}

/** 같은 날인지 (날짜 구분선을 넣을지 정할 때) */
export function isSameDay(a: LocalDateTime, b: LocalDateTime): boolean {
  return startOfDay(parseDateTime(a)) === startOfDay(parseDateTime(b));
}
