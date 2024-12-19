import { type requireAuthentication } from "@/auth/server";
import { type EntityLog, type EntityLogAttribute } from "@prisma/client";
import getLatestNoteAttributes from "../../../../../../../../lib/getLatestNoteAttributes";

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

  return authentication.authorize("note", "readRedacted", attributes);
}
