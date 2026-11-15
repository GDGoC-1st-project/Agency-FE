import { getApprovalStatus, getMe } from "@/lib/api";
import { getAccessToken, getOnboardingStep, setOnboardingStep } from "@/lib/auth/token";
import { pathForOnboardingStep, ROUTES } from "@/lib/routes";
import type { OnboardingStep } from "@/types/api";

interface Options {
  /**
   * 승인 전 API가 403(AUTH403)을 줬을 때: 승인 안 된 게 확실하므로 DONE(멤버)으로는 보내지 않습니다.
   */
  notApproved?: boolean;
}

/**
 * 로그인한 사용자가 지금 가야 할 화면을 정합니다. 가입 단계(onboardingStep)에 따라
 * PROFILE → 프로필 작성, KEYWORD → 키워드 등록, WAITING → 승인 대기, DONE → 멤버. 토큰이 없으면 로그인.
 *
 * 가입 단계는 로그인·회원가입·프로필 작성·키워드 저장·승인 확인 때 저장해 둔 값(`getOnboardingStep`)을 먼저 쓰고,
 * 프로필 단계이거나 모를 때는 승인 전에도 되는 API로 확인합니다.
 * - 내 정보 조회(getMe): 전공(major)이 없으면 아직 프로필 작성 전 → PROFILE
 * - 저장된 값이 없으면 승인 상태 조회로 승인 여부 확인 → APPROVED면 DONE
 * - 프로필은 있는데 키워드를 저장했는지는 승인 전 API로 알 수 없어서(내 키워드 조회는 승인 후만), 모르면 KEYWORD로 보냅니다
 *   (키워드 화면에서 다시 저장하면 이어집니다).
 *
 * 쓰는 곳: `/`(RootRedirect), `/login`·`/signup`(RedirectIfLoggedIn), 404의 "처음으로 가기", 공통 API 함수의 AUTH403 처리.
 */
/** 같은 때 여러 곳(개발 모드에서 effect 두 번 실행, 동시에 난 403 등)에서 불러도 확인 API는 한 번만 부릅니다 */
const inflight = new Map<boolean, Promise<string>>();

export function resolveHomePath({ notApproved = false }: Options = {}): Promise<string> {
  const running = inflight.get(notApproved);
  if (running) return running;
  const promise = resolve(notApproved).finally(() => inflight.delete(notApproved));
  inflight.set(notApproved, promise);
  return promise;
}

async function resolve(notApproved: boolean): Promise<string> {
  if (!getAccessToken()) return ROUTES.login;

  let step: OnboardingStep | null = getOnboardingStep();
  if (notApproved && step === "DONE") step = null;
  if (step === "DONE" || step === "WAITING") return pathForOnboardingStep(step);

  try {
    const me = await getMe();
    if (!me.major) {
      step = "PROFILE";
    } else if (step === "PROFILE" || step === null) {
      if (step === null && !notApproved) {
        const { status } = await getApprovalStatus();
        if (status === "APPROVED") step = "DONE";
      }
      if (step !== "DONE") step = "KEYWORD";
    }
  } catch {
    // 확인하지 못하면 아는 값으로, 그것도 없으면 승인 전이면 승인 대기·아니면 멤버(각 화면의 API가 다시 바로잡음)
    if (!step) return notApproved ? ROUTES.pendingApproval : ROUTES.members;
  }

  setOnboardingStep(step!);
  return pathForOnboardingStep(step!);
}
