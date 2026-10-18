/**
 * The messages of the errors that the task use cases throw for a rule of the
 * tasks. They are the members of an enum, thus an app can map them to its
 * own texts, for example the task actions of the Next.js app to the German
 * texts of the task page.
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
  NotAccepted = "The user did not accept the task",
  /** A `ValidationError` */
  NoCompletionist = "The completion needs at least one completionist",
  /** A `ConflictError` */
  InactiveCompletionist = "At least one completionist does not exist or is deleted",
  /** A `ValidationError`: a personalized task is one task for each assignee */
  NoAssignee = "A personalized task needs at least one assignee",
  /** A `ValidationError` */
  UnknownAssignee = "At least one assignee does not exist or is deleted",
  /** A `ValidationError` */
  UnknownRequiredRole = "At least one required role does not exist or the user cannot see it",
  /**
   * A `ValidationError`: the assignees, the assignment limit and the
   * required roles of a group or personalized task cannot change
   */
  OnlyForPublicTask = "assignee_ids, assignment_limit, required_role_ids and hidden_for_other_roles can change only for a public task",
  /** A `ValidationError` */
  TextRewardOnly = "The task has a text reward: give reward_text instead",
  /** A `ValidationError` */
  SilcRewardOnly = "The task has a SILC reward: give reward_silc_value instead",
  /** A `ValidationError` */
  NoChange = "Give at least one field to change",
}
