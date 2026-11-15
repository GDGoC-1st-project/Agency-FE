import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/MainLayout";
import { RecruitBoard } from "./RecruitBoard";

export const metadata: Metadata = { title: "모집 · 인력사무소" };

/** Figma 모집 글 목록 — 모바일 1:174, PC 1:464. 결정: docs/screens.md 4-1의 4·5번, 4-3의 2번 */
export default function RecruitsPage() {
  return (
    <MainLayout>
      <RecruitBoard />
    </MainLayout>
  );
}
