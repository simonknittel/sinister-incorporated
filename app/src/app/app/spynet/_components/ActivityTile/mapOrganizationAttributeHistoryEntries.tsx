import { type OrganizationAttributeHistoryEntry } from "@prisma/client";
import Link from "next/link";
import { FaExternalLinkAlt } from "react-icons/fa";
import { requireAuthentication } from "../../../../../lib/auth/authenticateAndAuthorize";

export const mapOrganizationAttributeHistoryEntries = async (
  entries: Array<
    Pick<
      OrganizationAttributeHistoryEntry,
      | "id"
      | "organizationId"
      | "createdAt"
      | "attributeKey"
      | "oldValue"
      | "newValue"
    >
  >,
) => {
  const authentication = await requireAuthentication();

  if (!authentication.authorize("organization", "read")) return [];

  return entries
    .filter((entry) => !(entry.attributeKey === "name" && !entry.oldValue)) // Filter out initial name
    .map((entry) => {
      switch (entry.attributeKey) {
        case "name":
          return {
            key: entry.id,
            date: entry.createdAt,
            message: (
              <p>
                Organisation unbenannt in{" "}
                <Link
                  href={`/app/spynet/organization/${entry.organizationId}`}
                  className="inline-flex gap-1 items-center text-sinister-red-500 hover:text-sinister-red-300"
                >
                  {entry.newValue} <FaExternalLinkAlt className="text-xs" />
                </Link>
              </p>
            ),
          };

        default:
          throw new Error(`Unknown attribute key: ${entry.attributeKey}`);
      }
    });
};
