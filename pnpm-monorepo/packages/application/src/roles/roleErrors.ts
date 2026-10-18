/**
 * The messages of the errors that the role use cases throw for a rule of the
 * roles. They are the members of an enum, thus an app can map them to its
 * own texts, for example the role actions of the Next.js app to the German
 * texts of the role pages.
 */
export enum RoleErrorMessage {
  /** A `NotFoundError` */
  NotFound = "The role does not exist",
  /** A `ValidationError` */
  NameTaken = "A role with this name exists already",
  /** A `ValidationError`: a role that inherits itself adds nothing */
  SelfInheritance = "A role cannot inherit itself",
}

/**
 * The messages of the errors that the role-assignment use cases throw for a
 * rule of the role assignments
 */
export enum RoleAssignmentErrorMessage {
  /** A `NotFoundError` */
  CitizenNotFound = "The citizen does not exist",
  /** A `ConflictError` */
  CitizenDeleted = "The citizen is deleted",
  /** A `NotFoundError` */
  NotAssigned = "The citizen does not have the role",
  /** A `ConflictError` */
  RoleHasNoLevels = "The role has no levels",
}
