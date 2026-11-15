import type { Metadata } from "next";
import { NotFound } from "@/components/ui/NotFound";

export const metadata: Metadata = { title: "찾을 수 없는 화면 · 인력사무소" };

/** 없는 주소로 들어왔을 때 (404). 모양은 공통 컴포넌트 `ui/NotFound` */
export default function NotFoundPage() {
  return <NotFound />;
}
