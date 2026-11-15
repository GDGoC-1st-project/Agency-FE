import { notFound } from "next/navigation";
import { DevCatalog } from "./DevCatalog";

export const metadata = { title: "컴포넌트 모음 · 인력사무소" };

/** 공통 레이아웃·컴포넌트 모음. 개발할 때만 열립니다 (배포 빌드에서는 404). */
export default function DevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <DevCatalog />;
}
