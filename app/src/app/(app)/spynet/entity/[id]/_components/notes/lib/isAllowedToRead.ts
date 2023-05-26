import { type EntityLog, type EntityLogAttribute } from "@prisma/client";
import { type authenticate } from "~/app/_lib/auth/authenticateAndAuthorize";
import getLatestNoteAttributes from "~/app/_lib/getLatestNoteAttributes";

export default function isAllowedToRead(
  note: EntityLog & {
    attributes: EntityLogAttribute[];
  },
  authentication: Awaited<ReturnType<typeof authenticate>>
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

  return (
    authentication &&
    authentication.authorize([
      {
        resource: "note",
        operation: "read",
        attributes,
      },
    ])
  );
}
