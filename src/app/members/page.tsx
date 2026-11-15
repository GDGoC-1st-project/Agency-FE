import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/MainLayout";
import { MembersBoard } from "./MembersBoard";

export const metadata: Metadata = { title: "멤버 · 인력사무소" };

/** Figma 멤버 탐색 — 모바일 1:124, PC 1:408. 결정: docs/screens.md 4-3의 3·5번, 4-2의 ⑥⑦⑧ */
export default function MembersPage() {
  return (
    <MainLayout>
      <MembersBoard />
    </MainLayout>
  );
}
