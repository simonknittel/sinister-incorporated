import {
  PERMISSION_STRING_PATTERN,
  ROLE_NAME_MAXIMUM_LENGTH,
} from "@sam-monorepo/domain";
import * as z from "zod";

/**
 * A role has much fewer permission strings or inherited roles, and a citizen
 * has much fewer roles. The limit keeps the writes bounded.
 */
export const MAXIMUM_ROLE_RELATIONS = 250;

export const roleNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(ROLE_NAME_MAXIMUM_LENGTH);

export const permissionStringSchema = z
  .string()
  .trim()
  .min(1)
  .regex(PERMISSION_STRING_PATTERN)
  .describe(
    "A permission string: `resource;operation`, followed by any number of `;key=value` attributes.",
  );
