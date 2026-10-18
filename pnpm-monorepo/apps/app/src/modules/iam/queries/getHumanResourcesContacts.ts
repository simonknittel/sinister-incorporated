import { getApplicationContext } from "@/modules/application";
import { listHumanResourcesContacts } from "@sam-monorepo/application";
import { cache } from "react";

/**
 * The handles of the Human Resources contacts, sorted by handle. No permission
 * check: the clearance page calls it for a user without permissions.
 */
export const getHumanResourcesContacts = cache(() =>
  listHumanResourcesContacts(getApplicationContext()),
);
