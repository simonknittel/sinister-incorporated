import type { CitizenReferenceRow } from "../citizenReference.js";

/**
 * A citizen in the rows of the wiki for the app: the owner and the authors
 * of a page, the members of a role, the creators of the snapshots and of
 * the reports. The app shows a deleted citizen with its label.
 */
export type WikiCitizen = CitizenReferenceRow;
