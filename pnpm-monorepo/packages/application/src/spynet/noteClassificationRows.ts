import type { Prisma } from "@sam-monorepo/database/client";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";

/** A note type or a classification level */
export interface NoteClassificationRow {
  readonly id: string;
  readonly name: string;
}

/** The select of a note type or a classification level */
export const NOTE_CLASSIFICATION_SELECT = {
  id: true,
  name: true,
} as const satisfies Prisma.NoteTypeSelect & Prisma.ClassificationLevelSelect;

/**
 * All note types, sorted by their name. Takes no actor and checks no
 * permission: the note types are not secret, and their callers have
 * different gates.
 */
export const findNoteTypes = (
  context: Pick<ApplicationContext, "prisma">,
): Promise<NoteClassificationRow[]> =>
  context.prisma.noteType.findMany({
    orderBy: { name: "asc" },
    select: NOTE_CLASSIFICATION_SELECT,
  });

/**
 * All classification levels, sorted by their name. Takes no actor and checks
 * no permission: the classification levels are not secret, and their callers
 * have different gates.
 */
export const findClassificationLevels = (
  context: Pick<ApplicationContext, "prisma">,
): Promise<NoteClassificationRow[]> =>
  context.prisma.classificationLevel.findMany({
    orderBy: { name: "asc" },
    select: NOTE_CLASSIFICATION_SELECT,
  });

/**
 * The classification levels for which the actor can create a note of the
 * note type, in the order of the input. The permission `note;create` is the
 * filter: it names the classification level and the note type. The caller
 * gives the levels of `findClassificationLevels()`, thus a page reads them
 * one time for all its note types.
 */
export const filterCreatableClassificationLevels = (
  actor: Pick<Actor, "authorize">,
  classificationLevels: readonly NoteClassificationRow[],
  noteTypeId: string,
): NoteClassificationRow[] =>
  classificationLevels.filter((classificationLevel) =>
    actor.authorize("note", "create", [
      { key: "classificationLevelId", value: classificationLevel.id },
      { key: "noteTypeId", value: noteTypeId },
    ]),
  );
