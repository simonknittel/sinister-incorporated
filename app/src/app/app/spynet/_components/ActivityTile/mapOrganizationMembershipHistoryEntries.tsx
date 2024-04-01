import {
  type Entity,
  type Organization,
  type OrganizationMembershipHistoryEntry,
} from "@prisma/client";
import Link from "next/link";
import { FaExternalLinkAlt } from "react-icons/fa";
import { requireAuthentication } from "../../../../../lib/auth/authenticateAndAuthorize";

export const mapOrganizationMembershipHistoryEntries = async (
  entries: Array<
    Pick<
      OrganizationMembershipHistoryEntry,
      "id" | "createdAt" | "type" | "visibility"
    > & {
      citizen: Pick<Entity, "id" | "handle">;
      organization: Pick<Organization, "id" | "name">;
    }
  >,
) => {
  const authentication = await requireAuthentication();

  if (!authentication.authorize("organization", "read")) return [];

  const alsoVisibilityRedacted = authentication.authorize(
    "organizationMembership",
    "read",
    [
      {
        key: "alsoVisibilityRedacted",
        value: true,
      },
    ],
  );

  return entries
    .filter((entry) =>
      (alsoVisibilityRedacted ? ["PUBLIC", "REDACTED"] : ["PUBLIC"]).includes(
        entry.visibility,
      ),
    )
    .map((entry) => {
      switch (entry.type) {
        case "MAIN":
          return {
            key: entry.id,
            date: entry.createdAt,
            message: (
              <p>
                Citizen{" "}
                <Link
                  href={`/app/spynet/entity/${entry.citizen.id}`}
                  className="inline-flex gap-1 items-center text-sinister-red-500 hover:text-sinister-red-300"
                >
                  {entry.citizen.handle}
                  <FaExternalLinkAlt className="text-xs" />
                </Link>{" "}
                wurde der Organisation{" "}
                <Link
                  href={`/app/spynet/organization/${entry.organization.id}`}
                  className="inline-flex gap-1 items-center text-sinister-red-500 hover:text-sinister-red-300"
                >
                  {entry.organization.name}
                  <FaExternalLinkAlt className="text-xs" />
                </Link>{" "}
                als <em>Main</em> hinzugefügt
              </p>
            ),
          };

        case "AFFILIATE":
          return {
            key: entry.id,
            date: entry.createdAt,
            message: (
              <p>
                Citizen{" "}
                <Link
                  href={`/app/spynet/entity/${entry.citizen.id}`}
                  className="inline-flex gap-1 items-center text-sinister-red-500 hover:text-sinister-red-300"
                >
                  {entry.citizen.handle}
                  <FaExternalLinkAlt className="text-xs" />
                </Link>{" "}
                wurde der Organisation{" "}
                <Link
                  href={`/app/spynet/organization/${entry.organization.id}`}
                  className="inline-flex gap-1 items-center text-sinister-red-500 hover:text-sinister-red-300"
                >
                  {entry.organization.name}
                  <FaExternalLinkAlt className="text-xs" />
                </Link>{" "}
                als <em>Affiliate</em> hinzugefügt
              </p>
            ),
          };

        case "LEFT":
          return {
            key: entry.id,
            date: entry.createdAt,
            message: (
              <p>
                Citizen{" "}
                <Link
                  href={`/app/spynet/entity/${entry.citizen.id}`}
                  className="inline-flex gap-1 items-center text-sinister-red-500 hover:text-sinister-red-300"
                >
                  {entry.citizen.handle}
                  <FaExternalLinkAlt className="text-xs" />
                </Link>{" "}
                wurde aus der Organisation{" "}
                <Link
                  href={`/app/spynet/organization/${entry.organization.id}`}
                  className="inline-flex gap-1 items-center text-sinister-red-500 hover:text-sinister-red-300"
                >
                  {entry.organization.name}
                  <FaExternalLinkAlt className="text-xs" />
                </Link>{" "}
                entfernt
              </p>
            ),
          };
      }
    });
};
