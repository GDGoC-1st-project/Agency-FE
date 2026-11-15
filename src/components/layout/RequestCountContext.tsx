"use client";

import { createContext, useContext } from "react";

export interface RequestCountValue {
  /** 받은 요청 중 대기(PENDING) 개수 (사이드바 "요청" 뱃지) */
  count: number;
  /** 요청을 수락·거절했을 때 뱃지를 바로 하나 줄입니다 */
  decrease: () => void;
  /** 서버에서 다시 셉니다 */
  refresh: () => void;
}

export const RequestCountContext = createContext<RequestCountValue>({
  count: 0,
  decrease: () => {},
  refresh: () => {},
});

/** `MainLayout` 안의 화면에서 사이드바 요청 뱃지 숫자를 읽고 바꿉니다. */
export function useRequestCount() {
  return useContext(RequestCountContext);
}
