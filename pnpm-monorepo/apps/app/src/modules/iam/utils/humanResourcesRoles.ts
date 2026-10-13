import * as z from "zod";

/** Usually only a few roles are Human Resources. The limit stops a very large list. */
export const MAX_HUMAN_RESOURCES_ROLES = 20;

/** Role ids are `cuid()`, not `cuid2()`, thus a non-empty string is sufficient */
export const humanResourcesRoleIdsSchema = z
  .array(z.string().min(1))
  .max(MAX_HUMAN_RESOURCES_ROLES);
