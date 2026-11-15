import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/MainLayout";
import { MyDesk } from "./MyDesk";

export const metadata: Metadata = { title: "마이 · 인력사무소" };

/** Figma 마이 (내 프로필) — 모바일 1:275, PC 1:571. 결정: docs/screens.md 4-1의 8번, 4-3의 4번 */
export default function MyPage() {
  return (
    <MainLayout>
      <MyDesk />
    </MainLayout>
  );
}
