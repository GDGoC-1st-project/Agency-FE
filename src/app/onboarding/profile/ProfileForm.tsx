"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FormCard } from "@/components/ui/Card";
import { FilterChip } from "@/components/ui/Chip";
import { Field, FormError, Textarea, TextField } from "@/components/ui/Input";
import { StateMessage } from "@/components/ui/StateMessage";
import { ApiError, createProfile, getErrorMessage, getMe } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import { useResetOnHide } from "@/lib/useResetOnHide";
import type { Department, MyInfoResponse } from "@/types/api";

const DEPARTMENTS: Department[] = ["DEV", "AI", "DESIGN"];
const BIO_MAX = 100;

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

export function ProfileForm() {
  const router = useRouter();
  const bioId = useId();
  const roleLabelId = useId();
  const [me, setMe] = useState<MyInfoResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [values, setValues] = useState<Values>({ bio: "", department: null, major: "", contact: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  // 이미 프로필을 작성했으면(이전 버튼으로 돌아온 경우) 승인 전에는 수정할 수 없으므로 보기만 합니다.
  const alreadyWritten = !!me?.major;

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

    setSubmitting(true);
    try {
      await createProfile({
        bio: values.bio.trim(),
        department: values.department!,
        major: values.major.trim(),
        contact: values.contact.trim(),
      });
      router.push(ROUTES.onboardingKeywords);
    } catch (error) {
      if (error instanceof ApiError && error.code === "PROFILE409") {
        router.push(ROUTES.onboardingKeywords);
        return;
      }
      setFormError(getErrorMessage(error, "프로필을 저장하지 못했어요. 잠시 후 다시 시도해 주세요."));
      setSubmitting(false);
    }
  }

  if (loadError) {
    return <StateMessage type="error" title="내 정보를 불러오지 못했어요" description={loadError} actionLabel="다시 시도" onAction={load} />;
  }

  if (!me) {
    return (
      <FormCard tape={null}>
        <p role="status" className="py-10 text-center text-12 text-muted">
          내 정보를 불러오는 중…
        </p>
      </FormCard>
    );
  }

  const locked = submitting || alreadyWritten;
  // 값을 고치면 그 칸의 오류 문구는 지웁니다.
  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  return (
    <FormCard tape={null}>
      <form noValidate onSubmit={handleSubmit} aria-busy={submitting} className="flex flex-col gap-4">
        <p className="flex gap-2 text-13 text-ink">
          <span>이름</span>
          <span>{me.name}</span>
        </p>

        <Field label="한 줄 소개" htmlFor={bioId} error={errors.bio}>
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
          />
          <span className="self-end text-10 text-muted">
            {values.bio.length}/{BIO_MAX}
          </span>
        </Field>

        <div className="flex flex-col gap-1.75">
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
        />
        <TextField
          label="연락처"
          disabled={locked}
          placeholder="전화번호, 이메일, 오픈채팅 링크 등"
          value={values.contact}
          onChange={(e) => set("contact", e.target.value)}
          error={errors.contact}
        />

        {alreadyWritten && (
          <p className="text-11 text-muted">프로필은 이미 저장했어요. 승인 후 마이에서 수정할 수 있어요.</p>
        )}
        <FormError message={formError} />
        <Button type="submit" fullWidth disabled={submitting} className="mt-2">
          {submitting ? "저장하는 중…" : "다음: 키워드 등록"}
        </Button>
      </form>
    </FormCard>
  );
}
