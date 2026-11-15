import type { ReactNode } from "react";
import { AdminGuard } from "./AdminGuard";

/** 운영 관리(/admin/*)는 role=ADMIN만. 아니면 멤버 화면으로 보냅니다 (docs/screens.md 8단계). */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>;
}
