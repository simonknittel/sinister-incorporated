import { type authenticate } from "@/auth/server";
import { type ClassificationLevel, type NoteType } from "@prisma/client";

export default function isAllowedToCreate(
  classificationLevelId: ClassificationLevel["id"],
  authentication: Awaited<ReturnType<typeof authenticate>>,
  noteTypeId?: NoteType["id"],
) {
  const attributes = [
    {
      key: "classificationLevelId",
      value: classificationLevelId,
    },
  ];

  if (noteTypeId) {
    attributes.push({
      key: "noteTypeId",
      value: noteTypeId,
    });
  }

  return (
    // @ts-expect-error The authorization types need to get overhauled
    authentication && authentication.authorize("note", "create", attributes)
  );
}
