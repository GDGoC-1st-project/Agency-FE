"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * 화면을 떠날 때(숨겨질 때) reset을 실행합니다.
 *
 * Cache Components가 켜져 있어 Next.js는 떠난 화면을 지우지 않고 <Activity hidden>으로 보관합니다 (최대 3개).
 * 그래서 "저장하는 중…" 같은 진행 상태나 오류 문구가 돌아왔을 때 그대로 남습니다.
 * 이 훅으로 그런 일시적인 상태만 되돌리고, 입력값처럼 남겨도 되는 것은 그대로 둡니다.
 * 참고: node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md
 */
export function useResetOnHide(reset: () => void) {
  const resetRef = useRef(reset);

  useLayoutEffect(() => {
    resetRef.current = reset;
  });

  useLayoutEffect(() => {
    return () => resetRef.current();
  }, []);
}
