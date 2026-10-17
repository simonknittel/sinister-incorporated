import { ConfirmationStatus } from "@sam-monorepo/database/browser";
import type { Prisma } from "@sam-monorepo/database/client";
import type {
  GenericCitizenLogType,
  PermissionSet,
} from "@sam-monorepo/permissions";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { getNotePermissionAttributes } from "./notePermissions.js";

export type CitizenLogTableType = GenericCitizenLogType | "note";

/** The log types that need their own permission to be read at all */
const TYPES_WITH_READ_PERMISSION: readonly CitizenLogTableType[] = [
  "discord-id",
  "teamspeak-id",
];

export interface NoteClassification {
  readonly noteTypeId: string;
  readonly classificationLevelId: string;
}

/** Each combination of an existing note type and classification level */
export const loadNoteClassifications = async (
  context: Pick<ApplicationContext, "prisma">,
): Promise<NoteClassification[]> => {
  const [noteTypes, classificationLevels] = await Promise.all([
    context.prisma.noteType.findMany({ select: { id: true } }),
    context.prisma.classificationLevel.findMany({ select: { id: true } }),
  ]);

  return noteTypes.flatMap((noteType) =>
    classificationLevels.map((classificationLevel) => ({
      noteTypeId: noteType.id,
      classificationLevelId: classificationLevel.id,
    })),
  );
};

/**
 * The notes that the operation allows: the permission for the note type and
 * the classification level of the note, and `alsoUnconfirmed` for a note
 * that is not confirmed. The database cannot compare a note with the
 * permissions, thus the conditions list each allowed combination. A note
 * without a note type or without a classification level matches none.
 */
export const getNoteClassificationConditions = (
  actor: Pick<Actor, "authorize">,
  operation: Extract<PermissionSet["operation"], "read" | "readRedacted">,
  classifications: readonly NoteClassification[],
): Prisma.CitizenLogWhereInput[] =>
  classifications.flatMap((classification) => {
    /**
     * A permission for the notes that are not confirmed also matches the
     * confirmed notes: their attributes are a part of the attributes of a
     * note that is not confirmed (see getNotePermissionAttributes)
     */
    if (
      actor.authorize(
        "note",
        operation,
        getNotePermissionAttributes({ ...classification, confirmed: null }),
      )
    )
      return [{ ...classification }];

    if (
      actor.authorize(
        "note",
        operation,
        getNotePermissionAttributes({
          ...classification,
          confirmed: ConfirmationStatus.CONFIRMED,
        }),
      )
    )
      return [{ ...classification, confirmed: ConfirmationStatus.CONFIRMED }];

    return [];
  });

/**
 * The logs of the given types that the actor may read in the Spynet tables:
 * a type with its own read permission needs it, and a log that is not
 * confirmed needs the permission to confirm logs of its type. A note needs
 * the read permission for its classification instead.
 */
export const getReadableCitizenLogWhere = async (
  context: Pick<ApplicationContext, "prisma">,
  actor: Pick<Actor, "authorize">,
  types: readonly CitizenLogTableType[],
): Promise<Prisma.CitizenLogWhereInput> => {
  const classifications = types.includes("note")
    ? await loadNoteClassifications(context)
    : [];

  const conditions = types.flatMap((type): Prisma.CitizenLogWhereInput[] => {
    /** An empty OR matches no note */
    if (type === "note")
      return [
        {
          type: "note",
          OR: getNoteClassificationConditions(actor, "read", classifications),
        },
      ];

    if (
      TYPES_WITH_READ_PERMISSION.includes(type) &&
      !actor.authorize(type, "read")
    )
      return [];

    return actor.authorize(type, "confirm")
      ? [{ type }]
      : [{ type, confirmed: ConfirmationStatus.CONFIRMED }];
  });

  /** An empty OR matches no log */
  return { OR: conditions };
};
