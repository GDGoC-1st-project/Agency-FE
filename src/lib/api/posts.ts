import { api } from "./client";
import type {
  ApplicationCreateResponse,
  Page,
  PostCreateRequest,
  PostCreateResponse,
  PostDetailResponse,
  PostListItem,
  PostListParams,
  PostUpdateRequest,
} from "@/types/api";

/** 모집글 목록 (sort는 LATEST만 지원) */
export function getPosts(params: PostListParams = {}) {
  return api.get<Page<PostListItem>>("/api/v1/posts", params);
}

/** 모집글 상세. isAuthor로 수정·삭제 버튼, hasApplied로 지원 버튼 상태를 정합니다. */
export function getPost(postId: number) {
  return api.get<PostDetailResponse>(`/api/v1/posts/${postId}`);
}

/** 모집글 작성 */
export function createPost(body: PostCreateRequest) {
  return api.post<PostCreateResponse>("/api/v1/posts", body);
}

/** 모집글 수정 — 보낸 것만 수정, 배열은 전체 교체 (작성자만) */
export function updatePost(postId: number, body: PostUpdateRequest) {
  return api.patch(`/api/v1/posts/${postId}`, body);
}

/** 모집글 삭제 (작성자만) */
export function deletePost(postId: number) {
  return api.delete(`/api/v1/posts/${postId}`);
}

/** 모집글 지원 */
export function applyToPost(postId: number) {
  return api.post<ApplicationCreateResponse>(`/api/v1/posts/${postId}/applications`);
}
