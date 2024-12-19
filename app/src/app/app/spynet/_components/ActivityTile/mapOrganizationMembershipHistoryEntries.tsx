import { requireAuthentication } from "@/auth/server";
import {
  type Entity,
  type Organization,
  type OrganizationMembershipHistoryEntry,
} from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

export const mapOrganizationMembershipHistoryEntries = async (
  entries: Array<
    Pick<
      OrganizationMembershipHistoryEntry,
      "id" | "createdAt" | "type" | "visibility"
    > & {
      citizen: Pick<Entity, "id" | "handle">;
      organization: Pick<Organization, "id" | "name" | "logo">;
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
                </Link>{" "}
                wurde der Organisation{" "}
                <Link
                  href={`/app/spynet/organization/${entry.organization.id}`}
                  className="text-sinister-red-500 hover:text-sinister-red-300"
                >
                  {entry.organization.logo && (
                    <span className="inline-block rounded bg-black mr-1 align-bottom">
                      <Image
                        src={`https://robertsspaceindustries.com${entry.organization.logo}`}
                        alt=""
                        width={24}
                        height={24}
                      />
                    </span>
                  )}
                  {entry.organization.name}
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
                </Link>{" "}
                wurde der Organisation{" "}
                <Link
                  href={`/app/spynet/organization/${entry.organization.id}`}
                  className="inline-flex gap-1 items-center text-sinister-red-500 hover:text-sinister-red-300"
                >
                  {entry.organization.name}
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
                </Link>{" "}
                wurde aus der Organisation{" "}
                <Link
                  href={`/app/spynet/organization/${entry.organization.id}`}
                  className="inline-flex gap-1 items-center text-sinister-red-500 hover:text-sinister-red-300"
                >
                  {entry.organization.name}
                </Link>{" "}
                entfernt
              </p>
            ),
          };
      }
    });
};
