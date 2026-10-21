import {
  encodeOnboardingStepProgressKey,
  ONBOARDING_TASK_RULES,
  type OnboardingStepKey,
  type OnboardingTaskKey,
} from "@sam-monorepo/domain";
import { satisfiesAnyPermissionString, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";

/**
 * A task the citizen is allowed to see, reduced to the keys of the task and
 * of its permitted steps. The client components resolve titles and contents
 * from the static config; only these keys and the progress rows cross the
 * server/client boundary.
 */
export interface EligibleOnboardingTask {
  readonly key: OnboardingTaskKey;
  /** Keys of the permitted steps, in the order of the rules */
  readonly stepKeys: readonly OnboardingStepKey[];
}

export interface OnboardingState {
  readonly eligibleTasks: readonly EligibleOnboardingTask[];
  /** Keys of the tasks the citizen completed or skipped */
  readonly completedTaskKeys: readonly string[];
  /**
   * Completed steps, encoded with `encodeOnboardingStepProgressKey()` so the
   * client can hold them in a flat set.
   */
  readonly completedStepProgressKeys: readonly string[];
}

/**
 * The onboarding tasks the actor is allowed to see, together with the
 * progress of the citizen of the actor. A task without a permitted step is
 * left out.
 */
export const loadOnboardingState = async (
  context: ApplicationContext,
  actor: Actor,
  citizenId: string,
): Promise<OnboardingState> => {
  const eligibleTasks = ONBOARDING_TASK_RULES.flatMap(
    (rule): EligibleOnboardingTask[] => {
      if (!satisfiesAnyPermissionString(actor, rule.requiredPermissionStrings))
        return [];

      const stepKeys = rule.steps
        .filter((step) =>
          satisfiesAnyPermissionString(actor, step.requiredPermissionStrings),
        )
        .map((step) => step.key);
      if (stepKeys.length === 0) return [];

      return [{ key: rule.key, stepKeys }];
    },
  );

  const [taskProgress, stepProgress] = await Promise.all([
    context.prisma.onboardingTaskProgress.findMany({
      where: { citizenId },
      select: { taskKey: true },
    }),
    context.prisma.onboardingStepProgress.findMany({
      where: { citizenId },
      select: { taskKey: true, stepKey: true },
    }),
  ]);

  return {
    eligibleTasks,
    completedTaskKeys: taskProgress.map((progress) => progress.taskKey),
    completedStepProgressKeys: stepProgress.map((progress) =>
      encodeOnboardingStepProgressKey(progress.taskKey, progress.stepKey),
    ),
  };
};

/**
 * `loadOnboardingState()`, or null for an actor without a citizen: such an
 * actor never sees the onboarding
 */
export const findOnboardingState = async (
  context: ApplicationContext,
  actor: Actor,
): Promise<OnboardingState | null> =>
  actor.citizen ? loadOnboardingState(context, actor, actor.citizen.id) : null;
