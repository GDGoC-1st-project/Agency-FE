/**
 * /chats: 모바일은 레이아웃의 목록만 보이고(이 영역은 숨김), PC는 목록 오른쪽에 이 안내가 보입니다.
 */
export default function ChatsPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 bg-paper p-10 text-center">
      <p className="font-display text-display-xs text-ink">대화할 멤버를 골라 주세요</p>
      <p className="text-11 text-muted">왼쪽 목록에서 채팅방을 열면 여기에서 이야기할 수 있어요.</p>
    </div>
  );
}
