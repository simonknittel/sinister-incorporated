import type { Prisma } from "@sam-monorepo/database/client";

/**
 * One note on the notes page of a citizen. Neither the page nor its
 * permission helpers read the author of the note or of its confirmation,
 * thus these `User` joins are absent.
 */
export const CITIZEN_NOTE_SELECT = {
  id: true,
  citizenId: true,
  type: true,
  content: true,
  createdAt: true,
  confirmed: true,
  noteTypeId: true,
  classificationLevelId: true,
} as const satisfies Prisma.CitizenLogSelect;

export type CitizenNoteRow = Prisma.CitizenLogGetPayload<{
  select: typeof CITIZEN_NOTE_SELECT;
}>;
