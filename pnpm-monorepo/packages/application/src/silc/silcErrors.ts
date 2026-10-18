/**
 * The messages of the errors that the SILC use cases throw for a rule of the
 * SILC. They are the members of an enum, thus an app can map them to its own
 * texts.
 */
export enum SilcErrorMessage {
  /** A `NotFoundError`: a different user deleted the transaction before */
  TransactionNotFound = "The SILC transaction does not exist or is deleted",
  /** A `ConflictError`: a different user deleted a receiver before */
  InactiveReceiver = "At least one receiver does not exist or is deleted",
  /** A `ValidationError`, see `SilcRoleSalary_roleId_dayOfMonth_key` */
  DuplicateSalaryDay = "A role can have only one salary on each day of the month",
}
