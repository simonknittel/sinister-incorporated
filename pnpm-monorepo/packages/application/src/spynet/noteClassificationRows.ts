import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";

/** A note type or a classification level */
export interface NoteClassificationRow {
  readonly id: string;
  readonly name: string;
}

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
    select: { id: true, name: true },
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
    select: { id: true, name: true },
  });

export interface CreatableClassificationLevelsInput {
  readonly noteTypeId: string;
}

/**
 * The classification levels, sorted by their name, for which the actor can
 * create a note of the note type. The permission `note;create` is the
 * filter: it names the classification level and the note type.
 */
export const findCreatableClassificationLevels = async (
  context: Pick<ApplicationContext, "prisma">,
  actor: Pick<Actor, "authorize">,
  input: CreatableClassificationLevelsInput,
): Promise<NoteClassificationRow[]> => {
  const classificationLevels = await findClassificationLevels(context);

  return classificationLevels.filter((classificationLevel) =>
    actor.authorize("note", "create", [
      { key: "classificationLevelId", value: classificationLevel.id },
      { key: "noteTypeId", value: input.noteTypeId },
    ]),
  );
};
