import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/MainLayout";
import { RequestsBoard } from "./RequestsBoard";

export const metadata: Metadata = { title: "요청 · 인력사무소" };

/** Figma 받은 요청·보낸 요청 — 모바일 1:218 · 1:230, PC 1:514 · 1:528. 거절 사유 다이얼로그 1:242 · 1:542 */
export default function RequestsPage() {
  return (
    <MainLayout>
      <RequestsBoard />
    </MainLayout>
  );
}
