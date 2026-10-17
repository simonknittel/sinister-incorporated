import { ConfirmationStatus } from "@sam-monorepo/database/browser";
import type { CitizenLog } from "@sam-monorepo/database/client";
import type { PermissionSet } from "@sam-monorepo/permissions";
import type { Actor } from "../actor.js";

type PermissionAttributes = NonNullable<PermissionSet["attributes"]>;

export type NotePermissionSubject = Pick<
  CitizenLog,
  "noteTypeId" | "classificationLevelId" | "confirmed"
>;

/**
 * The attribute value of a note whose note type or classification level was
 * deleted (the column is NULL). A permission string allows only the
 * characters A-Z, a-z, 0-9, "_", "-" and "*" in a value (the CHECK
 * constraint `PermissionString_format_check`), thus no permission can name
 * this value, and only the wildcard `*` matches it. Without the attribute, a
 * permission for one note type would match the note of each deleted note
 * type.
 */
const DELETED_CLASSIFICATION_ATTRIBUTE_VALUE = "(deleted)";

/**
 * The classification of a note as the note permissions (for example
 * `note;delete;noteTypeId=…;classificationLevelId=…`) compare with it
 */
const getNoteClassificationAttributes = (
  note: Pick<CitizenLog, "noteTypeId" | "classificationLevelId">,
): PermissionAttributes => [
  {
    key: "noteTypeId",
    value: note.noteTypeId ?? DELETED_CLASSIFICATION_ATTRIBUTE_VALUE,
  },
  {
    key: "classificationLevelId",
    value: note.classificationLevelId ?? DELETED_CLASSIFICATION_ATTRIBUTE_VALUE,
  },
];

/**
 * The attributes that the note permissions compare an existing note with:
 * the classification, and `alsoUnconfirmed` for a note that is not confirmed
 */
export const getNotePermissionAttributes = (
  note: NotePermissionSubject,
): PermissionAttributes => [
  ...getNoteClassificationAttributes(note),
  ...(note.confirmed !== ConfirmationStatus.CONFIRMED
    ? [{ key: "alsoUnconfirmed" as const, value: true }]
    : []),
];

/** The actor can read the content of the note */
export const canReadNote = (
  actor: Pick<Actor, "authorize">,
  note: NotePermissionSubject,
) => actor.authorize("note", "read", getNotePermissionAttributes(note));

/** The actor can see that the note exists, but not its content */
export const canReadNoteRedacted = (
  actor: Pick<Actor, "authorize">,
  note: NotePermissionSubject,
) => actor.authorize("note", "readRedacted", getNotePermissionAttributes(note));
