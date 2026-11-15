"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { FormCard } from "@/components/ui/Card";
import { FilterChip } from "@/components/ui/Chip";
import { Field, FormError, Input, Textarea, TextField } from "@/components/ui/Input";
import { Eyebrow } from "@/components/ui/PageIntro";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StateMessage } from "@/components/ui/StateMessage";
import { ApiError, createProfile, getErrorMessage, getMe, updateProfile } from "@/lib/api";
import { DEPARTMENTS } from "@/lib/labels";
import { ROUTES } from "@/lib/routes";
import { useResetOnHide } from "@/lib/useResetOnHide";
import type { Department, MyInfoResponse } from "@/types/api";

const BIO_MAX = 100;
/** PC: 폭 520, 진한 테두리 + 9·10px 그림자 카드 (Figma Dialog/Profile Setup) */
const PC_CARD = "lg:w-130 lg:border-ink lg:px-12 lg:py-12 lg:shadow-hard-lg";

interface Values {
  bio: string;
  department: Department | null;
  major: string;
  contact: string;
}
type Errors = Partial<Record<keyof Values, string>>;

function validate(v: Values): Errors {
  const errors: Errors = {};
  if (!v.bio.trim()) errors.bio = "한 줄 소개를 입력해 주세요.";
  else if (v.bio.trim().length > BIO_MAX) errors.bio = `한 줄 소개는 ${BIO_MAX}자 이내로 입력해 주세요.`;
  if (!v.department) errors.department = "역할을 하나 골라 주세요.";
  if (!v.major.trim()) errors.major = "전공을 입력해 주세요.";
  if (!v.contact.trim()) errors.contact = "연락처를 입력해 주세요.";
  return errors;
}

interface ProfileFormProps {
  /**
   * onboarding: 가입 설정 1/3. 프로필 작성 API → 키워드 등록으로 이동. 이미 작성했으면 보기만.
   * edit: 마이 › 프로필 수정 (승인 후). 프로필 수정 API → onSaved.
   */
  mode?: "onboarding" | "edit";
  /**
   * card: 종이 카드에 담음 (온보딩, 모바일 프로필 수정 화면)
   * plain: 카드 없이 (PC 마이의 프로필 수정 다이얼로그 안)
   */
  frame?: "card" | "plain";
  /** edit에서 저장이 끝났을 때 */
  onSaved?: () => void;
}

/**
 * Figma 마이 · 프로필 관리 (모바일 1:287) / Dialog/Profile Setup (PC 1:584, 1:3656) 양식.
 * 이름은 입력칸 없이 읽기 전용, 역할은 DEV/AI/DESIGN 하나 (docs/screens.md 4-1의 2번, 4-3의 6번).
 * 온보딩과 마이의 프로필 수정이 함께 씁니다.
 */
export function ProfileForm({ mode = "onboarding", frame = "card", onSaved }: ProfileFormProps) {
  const router = useRouter();
  const bioId = useId();
  const roleLabelId = useId();
  const nameId = useId();
  const [me, setMe] = useState<MyInfoResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [values, setValues] = useState<Values>({ bio: "", department: null, major: "", contact: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = mode === "edit";

  // 화면을 떠나면 진행 상태를 지웁니다. 돌아오면 아래 effect가 다시 실행되어 내 정보를 새로 불러옵니다.
  useResetOnHide(() => {
    setSubmitting(false);
    setFormError(null);
    setErrors({});
  });

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const info = await getMe();
      setMe(info);
      setValues({ bio: info.bio ?? "", department: info.department, major: info.major ?? "", contact: info.contact ?? "" });
    } catch (e) {
      setLoadError(getErrorMessage(e, "내 정보를 불러오지 못했어요."));
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 화면을 열 때 한 번 내 정보를 불러옵니다.
    void load();
  }, [load]);

  // 온보딩에서 이미 프로필을 작성했으면(이전 버튼으로 돌아온 경우) 승인 전에는 수정할 수 없으므로 보기만 합니다.
  const alreadyWritten = !isEdit && !!me?.major;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    if (alreadyWritten) {
      router.push(ROUTES.onboardingKeywords);
      return;
    }

    const nextErrors = validate(values);
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    const body = {
      bio: values.bio.trim(),
      department: values.department!,
      major: values.major.trim(),
      contact: values.contact.trim(),
    };
    setSubmitting(true);
    try {
      if (isEdit) {
        await updateProfile(body);
        setSubmitting(false);
        onSaved?.();
        return;
      }
      await createProfile(body);
      router.push(ROUTES.onboardingKeywords);
    } catch (error) {
      if (!isEdit && error instanceof ApiError && error.code === "PROFILE409") {
        router.push(ROUTES.onboardingKeywords);
        return;
      }
      setFormError(getErrorMessage(error, "프로필을 저장하지 못했어요. 잠시 후 다시 시도해 주세요."));
      setSubmitting(false);
    }
  }

  const frameClass = frame === "card" ? (isEdit ? "lg:w-130" : PC_CARD) : undefined;
  // 함수로 감쌉니다 (렌더 안에서 컴포넌트를 만들면 입력할 때마다 다시 그려져 입력칸 포커스가 사라짐).
  const wrap = (children: ReactNode) =>
    frame === "card" ? (
      <FormCard tape={null} className={frameClass}>
        {children}
      </FormCard>
    ) : (
      children
    );

  if (loadError) {
    return <StateMessage type="error" title="내 정보를 불러오지 못했어요" description={loadError} actionLabel="다시 시도" onAction={load} />;
  }

  if (!me) {
    return wrap(
      <p role="status" className="py-10 text-center text-12 text-muted">
        내 정보를 불러오는 중…
      </p>,
    );
  }

  const locked = submitting || alreadyWritten;
  // 값을 고치면 그 칸의 오류 문구는 지웁니다.
  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  // 모바일(1:287)은 이름 → 한 줄 소개 → 역할 → 전공 → 연락처 한 줄씩,
  // PC(Dialog/Profile Setup)는 이름·전공 / 역할·연락처 두 칸 + 한 줄 소개. 순서는 order로 바꿉니다.
  return wrap(
    <>
      {!isEdit && (
        <div className="hidden pb-6 lg:block">
          <Eyebrow>PROFILE SETUP</Eyebrow>
          <h1 className="pt-2 font-display text-display-md text-ink">나를 소개하는 메모</h1>
          <p className="pt-1 text-11 text-subtle">동료들이 나를 잘 알아볼 수 있도록 핵심 정보만 또렷하게 적어주세요.</p>
          <ProgressBar value={33} label="가입 설정 1/3" className="mt-5" />
        </div>
      )}
      <form noValidate onSubmit={handleSubmit} aria-busy={submitting} className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-x-3.5">
        <div className="order-1">
          <p className="flex gap-2 text-13 text-ink lg:hidden">
            <span>이름</span>
            <span>{me.name}</span>
          </p>
          <Field label="이름" htmlFor={nameId} className="hidden lg:flex">
            <Input id={nameId} size="dialog" readOnly value={me.name} className="bg-hover" />
          </Field>
        </div>

        <Field label="한 줄 소개" htmlFor={bioId} error={errors.bio} className="order-2 lg:order-5 lg:col-span-2">
          <Textarea
            id={bioId}
            size="auth"
            maxLength={BIO_MAX}
            disabled={locked}
            placeholder="어떤 사람인지 한 문장으로 소개해 주세요"
            value={values.bio}
            onChange={(e) => set("bio", e.target.value)}
            aria-invalid={errors.bio ? true : undefined}
            aria-describedby={errors.bio ? `${bioId}-error` : undefined}
            className="lg:h-23 lg:text-11 lg:leading-[16.5px]"
          />
          <span className="self-end text-10 text-muted">
            {values.bio.length}/{BIO_MAX}
          </span>
        </Field>

        <div className="order-3 flex flex-col gap-1.75">
          <p id={roleLabelId} className="text-10 font-bold text-ink">
            역할
          </p>
          <div role="group" aria-labelledby={roleLabelId} className="flex gap-1.5">
            {DEPARTMENTS.map((d) => (
              <FilterChip key={d} selected={values.department === d} disabled={locked} onClick={() => set("department", d)}>
                {d}
              </FilterChip>
            ))}
          </div>
          {errors.department && <p className="text-10 text-danger">{errors.department}</p>}
        </div>

        <TextField
          label="전공"
          disabled={locked}
          placeholder="전공을 입력해 주세요"
          value={values.major}
          onChange={(e) => set("major", e.target.value)}
          error={errors.major}
          className="order-4 lg:order-2 lg:[&_input]:h-10.75 lg:[&_input]:text-11"
        />
        <TextField
          label="연락처"
          disabled={locked}
          placeholder="전화번호, 이메일, 오픈채팅 링크 등"
          value={values.contact}
          onChange={(e) => set("contact", e.target.value)}
          error={errors.contact}
          className="order-5 lg:order-4 lg:[&_input]:h-10.75 lg:[&_input]:text-11"
        />

        <div className="order-6 flex flex-col gap-4 lg:col-span-2">
          {alreadyWritten && <p className="text-11 text-muted">프로필은 이미 저장했어요. 승인 후 마이에서 수정할 수 있어요.</p>}
          <FormError message={formError} />
          <Button type="submit" fullWidth disabled={submitting} className="mt-2">
            {isEdit ? (submitting ? "저장하는 중…" : "저장하기") : submitting ? "저장하는 중…" : "다음: 키워드 등록"}
          </Button>
        </div>
      </form>
    </>,
  );
}
