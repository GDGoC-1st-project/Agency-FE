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
  description: "GDGoC에서 함께할 멤버를 찾는 곳",
};

/**
 * 화면은 모바일과 PC를 함께 만듭니다 (docs/screens.md 4-4). 1024px(lg) 이상이 PC 디자인입니다.
 * 화면마다 `lg:` 클래스로 모바일과 PC 모양을 나눕니다.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} ${blackHanSans.variable}`}>
      <body className="min-h-dvh bg-canvas">{children}</body>
    </html>
  );
}
