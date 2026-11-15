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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} ${blackHanSans.variable}`}>
      <body>
        {/* 모바일 디자인을 먼저 구현합니다. 1024px 이상에서는 모바일 폭으로 가운데에 보여줍니다 (docs/screens.md 4-4). */}
        <div className="relative min-h-dvh bg-canvas lg:mx-auto lg:max-w-mobile lg:border-x lg:border-line">
          {children}
        </div>
      </body>
    </html>
  );
}
