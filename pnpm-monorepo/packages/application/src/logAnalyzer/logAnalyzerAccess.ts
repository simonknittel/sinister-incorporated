import { requirePermission, type Actor } from "../actor.js";
import { ForbiddenError } from "../errors.js";
import { LogAnalyzerErrorMessage } from "./logAnalyzerErrors.js";

/** The kill switch of the sharing is a flag of the host (Unleash) */
export interface LogAnalyzerSharingOptions {
  readonly isSharingDisabled: boolean;
}

/**
 * The gate of the sharing: first the permission, then the kill switch
 *
 * @throws ForbiddenError without `logAnalyzer;read`, or
 * `LogAnalyzerErrorMessage.SharingDisabled`
 */
export const requireLogAnalyzerAccess = (
  actor: Actor,
  options: LogAnalyzerSharingOptions,
) => {
  requirePermission(actor, "logAnalyzer", "read");

  if (options.isSharingDisabled)
    throw new ForbiddenError(LogAnalyzerErrorMessage.SharingDisabled);
};
