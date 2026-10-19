/**
 * The messages of the typed errors of the onboarding. They are the members
 * of an enum, thus the app can show its own text for each of them.
 */
export enum OnboardingErrorMessage {
  /** A `NotFoundError` */
  TaskNotFound = "The onboarding task does not exist",
  /** A `NotFoundError` */
  StepNotFound = "The onboarding step does not belong to the task",
}
