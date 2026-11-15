"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, toneFor } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { NoteCard, type NoteTone } from "@/components/ui/Card";
import { ApiError, approveSignup, getErrorMessage, getPendingSignups } from "@/lib/api";
import { DEPARTMENT_LABEL } from "@/lib/labels";
import { ROUTES } from "@/lib/routes";
import { useResetOnHide } from "@/lib/useResetOnHide";
import type { AdminSignupItem } from "@/types/api";
import { isAdminForbidden } from "../AdminGuard";
import { AdminListBody, AdminListIntro, InfoRows, useAdminList } from "../AdminList";

/** Figma 순서: 초록 → 노랑 */
const TONES: NoteTone[] = ["green", "yellow"];

/**
 * 가입 승인: 승인 대기 목록 + "승인" (가입 승인 API).
 * Figma 카드의 "아이디"는 목록 API에 없어서, API가 주는 전공 · 분야 · 키워드를 보여줍니다.
 */
export function SignupApprovals() {
  const router = useRouter();
  const list = useAdminList<AdminSignupItem>(getPendingSignups, "가입 신청을 불러오지 못했어요.");
  const [approving, setApproving] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<number, string>>({});

  useResetOnHide(() => {
    setNotice(null);
    setErrors({});
  });

  async function approve(item: AdminSignupItem) {
    setApproving(item.userId);
    setNotice(null);
    setErrors((prev) => ({ ...prev, [item.userId]: "" }));
    try {
      await approveSignup(item.userId);
      list.remove((s) => s.userId === item.userId);
      setNotice(`${item.name} 님의 가입을 승인했어요.`);
    } catch (e) {
      if (isAdminForbidden(e)) return router.replace(ROUTES.members);
      if (e instanceof ApiError && (e.code === "USER409" || e.code === "USER404")) {
        list.remove((s) => s.userId === item.userId);
        setNotice(`${item.name} 님은 이미 처리된 신청이에요.`);
        return;
      }
      setErrors((prev) => ({ ...prev, [item.userId]: getErrorMessage(e, "승인하지 못했어요. 잠시 후 다시 시도해 주세요.") }));
    } finally {
      setApproving(null);
    }
  }

  return (
    <div className="flex flex-col">
      <AdminListIntro eyebrow="WAITING LIST" count={list.status === "ready" ? list.total : null} description="승인을 기다리는 가입 신청이에요." />
      <AdminListBody list={list} notice={notice} emptyTitle="기다리는 가입 신청이 없어요" emptyDescription="새 신청이 오면 여기에 보여요.">
        <ul className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {list.items.map((s, i) => (
            <li key={s.userId}>
              <NoteCard tone={TONES[i % TONES.length]} className="flex h-full min-h-55 flex-col px-5.5 pt-7 pb-5.5">
                <div className="flex items-center gap-3">
                  <Avatar tone={toneFor(s.userId)} />
                  <p className="min-w-0 truncate font-display text-display-2xs text-ink">{s.name}</p>
                </div>
                <InfoRows
                  rows={[
                    { term: "전공", value: s.major || "-" },
                    { term: "분야", value: DEPARTMENT_LABEL[s.department] },
                    { term: "키워드", value: s.keywords.length > 0 ? s.keywords.map((k) => `#${k}`).join(" ") : "-" },
                  ]}
                />
                <div className="mt-auto flex flex-col gap-1.5">
                  {errors[s.userId] && (
                    <p role="alert" className="text-10 text-danger">
                      {errors[s.userId]}
                    </p>
                  )}
                  <Button fullWidth disabled={approving !== null} onClick={() => approve(s)} aria-label={`${s.name} 님 가입 승인`}>
                    {approving === s.userId ? "승인하는 중…" : "승인"}
                  </Button>
                </div>
              </NoteCard>
            </li>
          ))}
        </ul>
      </AdminListBody>
    </div>
  );
}
