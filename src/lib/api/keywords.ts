import { api } from "./client";
import type { KeywordSearchParams, KeywordSearchResponse } from "@/types/api";

/** 키워드 검색(자동완성). q는 1자 이상 (승인 전 OK) */
export function searchKeywords(params: KeywordSearchParams) {
  return api.get<KeywordSearchResponse>("/api/v1/keywords", params);
}
