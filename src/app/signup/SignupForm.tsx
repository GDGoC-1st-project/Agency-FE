"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FormCard } from "@/components/ui/Card";
import { FormError, TextField } from "@/components/ui/Input";
import { ApiError, getErrorMessage, signup } from "@/lib/api";
import { ROUTES } from "@/lib/routes";

interface Values {
  loginId: string;
  password: string;
  passwordConfirm: string;
  inviteCode: string;
}

type Errors = Partial<Record<keyof Values, string>>;

const LOGIN_ID_PATTERN = /^[A-Za-z0-9]{4,20}$/;

/** api-list.md 회원가입 조건: 아이디 영문·숫자 4~20자, 비밀번호 8자 이상, 초대 코드 필수 */
function validate(v: Values): Errors {
  const errors: Errors = {};
  if (!LOGIN_ID_PATTERN.test(v.loginId)) errors.loginId = "아이디는 영문·숫자 4~20자로 입력해 주세요.";
  if (v.password.length < 8) errors.password = "비밀번호는 8자 이상 입력해 주세요.";
  if (!v.passwordConfirm) errors.passwordConfirm = "비밀번호를 한 번 더 입력해 주세요.";
  else if (v.password !== v.passwordConfirm) errors.passwordConfirm = "비밀번호가 서로 달라요.";
  if (!v.inviteCode.trim()) errors.inviteCode = "초대 코드를 입력해 주세요.";
  return errors;
}

export function SignupForm() {
  const router = useRouter();
  const [values, setValues] = useState<Values>({ loginId: "", password: "", passwordConfirm: "", inviteCode: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const bind = (key: keyof Values) => ({
    name: key,
    value: values[key],
    onChange: (e: { target: { value: string } }) => setValues((prev) => ({ ...prev, [key]: e.target.value })),
    error: errors[key],
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const nextErrors = validate(values);
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await signup({ loginId: values.loginId, password: values.password, inviteCode: values.inviteCode.trim() });
      // 새 계정은 프로필이 없으므로 가입 설정 1단계(프로필 작성)로 갑니다.
      router.replace(ROUTES.onboardingProfile);
    } catch (error) {
      // 입력칸 하나의 문제면 그 칸 아래에, 아니면 양식 아래에 보여줍니다.
      if (error instanceof ApiError && error.code === "AUTH409") {
        setErrors({ loginId: error.message });
      } else if (error instanceof ApiError && error.code === "INVITE400") {
        setErrors({ inviteCode: error.message });
      } else {
        setFormError(getErrorMessage(error, "가입하지 못했어요. 잠시 후 다시 시도해 주세요."));
      }
      setSubmitting(false);
    }
  }

  return (
    <FormCard>
      <form noValidate onSubmit={handleSubmit} aria-busy={submitting} className="flex flex-col">
        <fieldset disabled={submitting} className="flex flex-col gap-4">
          <TextField label="아이디" autoComplete="username" placeholder="영문·숫자 4~20자" {...bind("loginId")} />
          <TextField
            label="비밀번호"
            type="password"
            autoComplete="new-password"
            placeholder="8자 이상 입력해 주세요"
            {...bind("password")}
          />
          <TextField
            label="비밀번호 확인"
            type="password"
            autoComplete="new-password"
            placeholder="비밀번호를 다시 입력해 주세요"
            {...bind("passwordConfirm")}
          />
          <TextField label="초대 코드" autoComplete="off" placeholder="초대 코드를 입력해 주세요" {...bind("inviteCode")} />
        </fieldset>
        <FormError message={formError} className="mt-4" />
        <Button type="submit" fullWidth disabled={submitting} className="mt-6">
          {submitting ? "가입하는 중…" : "가입하기"}
        </Button>
      </form>
    </FormCard>
  );
}
