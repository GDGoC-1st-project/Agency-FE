import { api } from "./client";
import type {
  Page,
  ReceivedRequestItem,
  RequestAcceptResponse,
  RequestListParams,
  RequestRejectRequest,
  RequestType,
  SentRequestItem,
} from "@/types/api";

/** 받은 요청 목록. status 없으면 전체 */
export function getReceivedRequests(params: RequestListParams = {}) {
  return api.get<Page<ReceivedRequestItem>>("/api/v1/requests/received", params);
}

/** 보낸 요청 목록. status 없으면 전체 */
export function getSentRequests(params: RequestListParams = {}) {
  return api.get<Page<SentRequestItem>>("/api/v1/requests/sent", params);
}

/** 요청 수락 (받은 사람만). 받은 chatRoomId로 바로 채팅방 이동 가능 */
export function acceptRequest(requestType: RequestType, requestId: number) {
  return api.patch<RequestAcceptResponse>(`/api/v1/requests/${requestType}/${requestId}/accept`);
}

/** 요청 거절 (받은 사람만). reasonType=ETC면 reasonDetail 필수 */
export function rejectRequest(requestType: RequestType, requestId: number, body: RequestRejectRequest) {
  return api.patch(`/api/v1/requests/${requestType}/${requestId}/reject`, body);
}
