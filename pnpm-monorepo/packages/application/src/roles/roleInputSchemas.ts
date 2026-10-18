import { PERMISSION_STRING_PATTERN } from "@sam-monorepo/domain";
import * as z from "zod";

/** A role name is much shorter. The limit keeps the input bounded. */
export const ROLE_NAME_MAX_LENGTH = 255;

/**
 * A role has much fewer permission strings or inherited roles. The limit
 * keeps the writes bounded.
 */
export const MAXIMUM_ROLE_RELATIONS = 250;

/** The same limit as the description field of the role page */
export const ROLE_DESCRIPTION_MAX_LENGTH = 2048;

export const permissionStringSchema = z
  .string()
  .trim()
  .min(1)
  .regex(PERMISSION_STRING_PATTERN)
  .describe(
    "A permission string: `resource;operation`, followed by any number of `;key=value` attributes.",
  );
