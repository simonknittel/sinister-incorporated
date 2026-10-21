/** The order is the order in which the app shows the tasks */
export enum OnboardingTaskKey {
  Events = "events",
  Fleet = "fleet",
  BrowserNotifications = "browser-notifications",
  AvatarCreator = "avatar-creator",
  Profile = "profile",
}

export enum OnboardingStepKey {
  EventsCalendar = "events-calendar",
  EventsSignUp = "events-sign-up",
  EventsBriefing = "events-briefing",
  EventsLineup = "events-lineup",
  FleetIntroduction = "fleet-introduction",
  FleetAddShips = "fleet-add-ships",
  FleetOrgFleet = "fleet-org-fleet",
  NotificationsIntroduction = "notifications-introduction",
  NotificationsEnable = "notifications-enable",
  AvatarCreatorIntroduction = "avatar-creator-introduction",
  AvatarCreatorCreate = "avatar-creator-create",
  ProfileComplete = "profile-complete",
}

export interface OnboardingStepRule {
  readonly key: OnboardingStepKey;
  /** The step is only for a citizen who satisfies at least one string */
  readonly requiredPermissionStrings?: readonly string[];
}

export interface OnboardingTaskRule {
  readonly key: OnboardingTaskKey;
  /** The task is only for a citizen who satisfies at least one string */
  readonly requiredPermissionStrings?: readonly string[];
  readonly steps: readonly OnboardingStepRule[];
}

/**
 * The tasks of the onboarding with their steps and their permissions. A step
 * belongs to one task. The texts and the contents of the tasks are in the
 * app.
 */
const ONBOARDING_TASK_RULE_FIELDS: Readonly<
  Record<OnboardingTaskKey, Omit<OnboardingTaskRule, "key">>
> = {
  [OnboardingTaskKey.Events]: {
    requiredPermissionStrings: ["event;read"],
    steps: [
      { key: OnboardingStepKey.EventsCalendar },
      { key: OnboardingStepKey.EventsSignUp },
      { key: OnboardingStepKey.EventsBriefing },
      { key: OnboardingStepKey.EventsLineup },
    ],
  },
  [OnboardingTaskKey.Fleet]: {
    requiredPermissionStrings: ["ship;manage"],
    steps: [
      { key: OnboardingStepKey.FleetIntroduction },
      { key: OnboardingStepKey.FleetAddShips },
      {
        key: OnboardingStepKey.FleetOrgFleet,
        requiredPermissionStrings: ["orgFleet;read"],
      },
    ],
  },
  [OnboardingTaskKey.BrowserNotifications]: {
    steps: [
      { key: OnboardingStepKey.NotificationsIntroduction },
      { key: OnboardingStepKey.NotificationsEnable },
    ],
  },
  [OnboardingTaskKey.AvatarCreator]: {
    steps: [
      { key: OnboardingStepKey.AvatarCreatorIntroduction },
      { key: OnboardingStepKey.AvatarCreatorCreate },
    ],
  },
  [OnboardingTaskKey.Profile]: {
    steps: [{ key: OnboardingStepKey.ProfileComplete }],
  },
};

export const getOnboardingTaskRule = (
  taskKey: OnboardingTaskKey,
): OnboardingTaskRule => ({
  key: taskKey,
  ...ONBOARDING_TASK_RULE_FIELDS[taskKey],
});

/** The rules of all tasks, in the order of `OnboardingTaskKey` */
export const ONBOARDING_TASK_RULES: readonly OnboardingTaskRule[] =
  Object.values(OnboardingTaskKey).map(getOnboardingTaskRule);

/**
 * One string for a completed step, so a client can hold the completed steps
 * of all tasks in a flat set.
 */
export const encodeOnboardingStepProgressKey = (
  taskKey: string,
  stepKey: string,
) => `${taskKey}/${stepKey}`;
