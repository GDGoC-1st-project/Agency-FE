import { RootRedirect } from "./RootRedirect";

/** 메인 주소 `/`: 로그인되어 있으면 멤버 화면, 아니면 로그인 화면으로 보냅니다. */
export default function Home() {
  return <RootRedirect />;
}
