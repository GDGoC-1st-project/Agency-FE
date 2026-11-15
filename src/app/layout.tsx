import type { Metadata } from "next";
import { Black_Han_Sans, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  weight: ["400", "700", "900"],
  subsets: ["latin"],
});

const blackHanSans = Black_Han_Sans({
  variable: "--font-black-han-sans",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "인력사무소 · GDGoC TEAM MATCH",
  description: "GDGoC 멤버들이 함께할 동료를 찾는 곳",
};

/**
 * 화면은 모바일과 PC를 함께 만듭니다 (docs/screens.md 4-4). 1024px(lg) 이상이 PC 디자인입니다.
 * PC 디자인이 아직 없는 화면은 그 화면에서 `MobileColumn`으로 감싸 모바일 폭으로 가운데 표시합니다.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} ${blackHanSans.variable}`}>
      <body className="min-h-dvh bg-canvas">{children}</body>
    </html>
  );
}
