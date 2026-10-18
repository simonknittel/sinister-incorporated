/**
 * The messages of the errors that the profit distribution use cases throw
 * for a rule of the cycles. They are the members of an enum, thus an app can
 * map them to its own texts.
 */
export enum ProfitDistributionErrorMessage {
  /** A `NotFoundError` */
  CycleNotFound = "The profit distribution cycle does not exist",
  /**
   * A `ConflictError`. The guarded updates cannot tell a missing cycle from a
   * cycle in a different phase.
   */
  WrongPhase = "The cycle does not exist or is not in the phase of the operation",
  /** A `ValidationError` */
  CollectionEndInPast = "The planned end of the collection phase is before today",
}
