import { ApiError } from "./client";

/** 화면에 보여줄 오류 문구. 서버 메시지가 있으면 그대로, 연결 실패면 안내 문구를 돌려줍니다. */
export function getErrorMessage(error: unknown, fallback = "요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요."): string {
  if (error instanceof ApiError) return error.message || fallback;
  if (error instanceof TypeError) return "서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.";
  return fallback;
}
