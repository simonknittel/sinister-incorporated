import { type EntityLog, type EntityLogAttribute } from "@prisma/client";
import { type requireAuthentication } from "../../../../../lib/auth/authenticateAndAuthorize";

export default function isAllowedToRead(
  entityLog: EntityLog & {
    attributes: EntityLogAttribute[];
  },
  authentication: Awaited<ReturnType<typeof requireAuthentication>>,
) {
  if (["discord-id", "teamspeak-id"].includes(entityLog.type)) {
    const allowedToRead = authentication.authorize([
      {
        resource: entityLog.type,
        operation: "read",
      },
    ]);

    if (!allowedToRead) return false;
  }

  const confirmed = entityLog.attributes.find(
    (attribute) => attribute.key === "confirmed",
  );

  if (!confirmed || confirmed.value !== "confirmed") {
    return authentication.authorize([
      {
        resource: entityLog.type,
        operation: "confirm",
      },
    ]);
  }

  return true;
}
