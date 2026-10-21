/**
 * The messages of the typed errors of the onboarding. They are the members
 * of an enum, thus the app can show its own text for each of them.
 */
export enum OnboardingErrorMessage {
  /** A `ForbiddenError`: the actor does not have the permission of the task */
  TaskNotOpen = "The onboarding task is not open to the actor",
  /**
   * A `ForbiddenError`: the actor does not have the permission of the task or
   * of the step
   */
  StepNotOpen = "The onboarding step is not open to the actor",
  /** A `NotFoundError` */
  StepNotFound = "The onboarding step does not belong to the task",
}
