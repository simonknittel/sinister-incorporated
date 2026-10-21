import { SLUG_MAX_LENGTH, SLUG_PATTERN } from "../slug.js";

/**
 * Arbitrary cap of the name of a career flow. The forms of the app and the
 * use cases use the same value.
 */
export const FLOW_NAME_MAX_LENGTH = 128;

/**
 * Static segments under `/app/career`. The router matches them before
 * `[flowSlug]`, so a flow taking one would be unreachable.
 */
export const RESERVED_FLOW_SLUGS: readonly string[] = ["settings"];

/** Why a flow cannot use a slug */
export enum FlowSlugProblem {
  /** The slug does not agree with `SLUG_PATTERN`, or it is too long */
  Format = "format",
  /** The slug is one of `RESERVED_FLOW_SLUGS` */
  Reserved = "reserved",
}

/**
 * Examines a hand-edited slug with the derivation rules and the reserved
 * segments. The function does not examine the uniqueness: it needs the
 * database, thus the use cases examine it, and the partial unique index on
 * the rows that are not deleted is the last guard.
 */
export const findFlowSlugProblem = (slug: string): FlowSlugProblem | null => {
  if (slug.length > SLUG_MAX_LENGTH || !SLUG_PATTERN.test(slug))
    return FlowSlugProblem.Format;
  if (RESERVED_FLOW_SLUGS.includes(slug)) return FlowSlugProblem.Reserved;
  return null;
};
