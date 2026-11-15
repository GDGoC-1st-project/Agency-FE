import { RootRedirect } from "./RootRedirect";

/** 메인 주소 `/`: 로그인되어 있으면 가입 단계에 맞는 화면(완료면 멤버), 아니면 로그인 화면으로 보냅니다. */
export default function Home() {
  return <RootRedirect />;
}
