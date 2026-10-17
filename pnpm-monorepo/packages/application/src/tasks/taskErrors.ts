/**
 * The messages of the errors that the task use cases throw for a rule of the
 * tasks. An app can map them to its own texts, for example the task actions
 * of the Next.js app to the German texts of the task page.
 */
export enum TaskErrorMessage {
  /** A `NotFoundError` */
  NotFound = "The task does not exist or the user cannot see it",
  /** A `ConflictError` */
  NotOpen = "The task is already completed, cancelled, deleted or expired",
  /** A `ValidationError` */
  NotSelfAssignable = "Only the assignees of a public task can change their own assignment",
  /** A `ConflictError` */
  AssignmentLimitReached = "All places of the task are taken",
  /** A `ForbiddenError` */
  MissingRequiredRole = "The user does not have a role that the task requires",
  /** A `ConflictError` */
  AlreadyAccepted = "The user already accepted the task",
  /** A `ConflictError` */
  NotAccepted = "The user did not accept the task",
  /** A `ValidationError` */
  NoCompletionist = "The completion needs at least one completionist",
  /** A `ConflictError` */
  InactiveCompletionist = "At least one completionist does not exist or is deleted",
}

export const isTaskErrorMessage = (
  message: string,
): message is TaskErrorMessage =>
  Object.values<string>(TaskErrorMessage).includes(message);
