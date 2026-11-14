import { api } from "./client";
import type { ConnectionItem, Page, PageParams } from "@/types/api";

/** 내 연결 목록 */
export function getConnections(params: PageParams = {}) {
  return api.get<Page<ConnectionItem>>("/api/v1/connections", params);
}
