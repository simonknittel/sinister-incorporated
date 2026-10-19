import { getApplicationContext } from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { findWikiPermissionRoles } from "@sam-monorepo/application";
import { cache } from "react";

/**
 * Every role of the organization, to resolve the wiki permissions role by
 * role (see `findWikiPermissionRoles()`). Never fill a role picker with it:
 * use `getVisibleRoles()`.
 */
export const getWikiPermissionRoles = cache(
  withTrace("getWikiPermissionRoles", () =>
    findWikiPermissionRoles(getApplicationContext()),
  ),
);
