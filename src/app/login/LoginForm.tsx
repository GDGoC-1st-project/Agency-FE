"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FormCard } from "@/components/ui/Card";
import { FormError, TextField } from "@/components/ui/Input";
import { getErrorMessage, login } from "@/lib/api";
import { pathForOnboardingStep } from "@/lib/routes";
import { useResetOnHide } from "@/lib/useResetOnHide";

type Errors = Partial<Record<"loginId" | "password", string>>;

function validate(loginId: string, password: string): Errors {
  const errors: Errors = {};
  if (!loginId.trim()) errors.loginId = "아이디를 입력해 주세요.";
  if (!password) errors.password = "비밀번호를 입력해 주세요.";
  return errors;
}

export function LoginForm() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useResetOnHide(() => {
    setSubmitting(false);
    setFormError(null);
    setPassword("");
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const nextErrors = validate(loginId, password);
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const result = await login({ loginId: loginId.trim(), password });
      router.replace(pathForOnboardingStep(result.onboardingStep));
    } catch (error) {
      setFormError(getErrorMessage(error, "로그인하지 못했어요. 잠시 후 다시 시도해 주세요."));
      setSubmitting(false);
    }
  }

  return (
    <FormCard>
      <form noValidate onSubmit={handleSubmit} aria-busy={submitting} className="flex flex-col">
        <fieldset disabled={submitting} className="flex flex-col gap-4">
          <TextField
            label="아이디"
            name="loginId"
            autoComplete="username"
            placeholder="아이디를 입력해 주세요"
            value={loginId}
            onChange={(e) => {
              setLoginId(e.target.value);
              setErrors((prev) => ({ ...prev, loginId: undefined }));
            }}
            error={errors.loginId}
          />
          <TextField
            label="비밀번호"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="8자 이상 입력해 주세요"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            error={errors.password}
          />
        </fieldset>
        <FormError message={formError} className="mt-4" />
        <Button type="submit" fullWidth disabled={submitting} className="mt-6">
          {submitting ? "로그인 중…" : "로그인"}
        </Button>
      </form>
    </FormCard>
  );
}
