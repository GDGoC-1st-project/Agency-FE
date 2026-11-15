import { ChatRoom } from "../ChatRoom";

/**
 * /chats/{chatRoomId}: 1:1 채팅방. 방 번호는 ChatRoom이 useParams로 읽습니다
 * (params를 서버에서 기다리지 않아 화면 틀을 미리 그릴 수 있음).
 */
export default function ChatRoomPage() {
  return <ChatRoom />;
}
