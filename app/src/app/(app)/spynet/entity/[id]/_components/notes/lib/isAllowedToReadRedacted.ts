import { type EntityLog, type EntityLogAttribute } from "@prisma/client";
import { type requireAuthentication } from "../../../../../../../../_lib/auth/authenticateAndAuthorize";
import getLatestNoteAttributes from "../../../../../../../../_lib/getLatestNoteAttributes";

export default function isAllowedToReadRedacted(
  note: EntityLog & {
    attributes: EntityLogAttribute[];
  },
  authentication: Awaited<ReturnType<typeof requireAuthentication>>,
) {
  const attributes = [];

  const { noteTypeId, classificationLevelId, confirmed } =
    getLatestNoteAttributes(note);

  if (noteTypeId?.value) {
    attributes.push({
      key: "noteTypeId",
      value: noteTypeId.value,
    });
  }

  if (classificationLevelId?.value) {
    attributes.push({
      key: "classificationLevelId",
      value: classificationLevelId.value,
    });
  }

  if (!confirmed || confirmed.value !== "confirmed") {
    attributes.push({
      key: "alsoUnconfirmed",
      value: true,
    });
  }

  return authentication.authorize([
    {
      resource: "note",
      operation: "readRedacted",
      attributes,
    },
  ]);
}
