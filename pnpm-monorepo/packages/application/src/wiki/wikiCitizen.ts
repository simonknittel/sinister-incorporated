import type { Citizen, Prisma } from "@sam-monorepo/database/client";

/**
 * A citizen in the rows of the wiki for the app: the owner and the authors
 * of a page, the members of a role, the creators of the snapshots and of
 * the reports. The app shows a deleted citizen with its label.
 */
export type WikiCitizen = Pick<Citizen, "id" | "handle" | "deletedAt">;

export const WIKI_CITIZEN_SELECT = {
  id: true,
  handle: true,
  deletedAt: true,
} as const satisfies Prisma.CitizenSelect;
