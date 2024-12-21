import { requireAuthentication } from "@/auth/server";
import { prisma } from "@/db";
import { OrganizationMembershipVisibility } from "@prisma/client";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { FaExternalLinkAlt, FaSitemap } from "react-icons/fa";
import { DeleteOrganizationMembership } from "../../../_components/DeleteOrganizationMembership";
import { CreateOrganizationMembership } from "./CreateOrganizationMembership";

type Props = Readonly<{
  className?: string;
  id: string;
}>;

export const OrganizationMembershipsTile = async ({ className, id }: Props) => {
  const authentication = await requireAuthentication();
  if (!authentication.authorize("organizationMembership", "read"))
    throw new Error("Unauthorized");

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

  const activeOrganizationMemberships =
    await prisma.activeOrganizationMembership.findMany({
      where: {
        citizenId: id,
        visibility: {
          in: alsoVisibilityRedacted
            ? [
                OrganizationMembershipVisibility.PUBLIC,
                OrganizationMembershipVisibility.REDACTED,
              ]
            : [OrganizationMembershipVisibility.PUBLIC],
        },
      },
      include: {
        organization: true,
      },
    });

  const showDeleteButton = authentication.authorize(
    "organizationMembership",
    "delete",
  );

  const showCreateButton = authentication.authorize(
    "organizationMembership",
    "create",
  );

  return (
    <section
      className={clsx(className, "rounded-2xl p-4 lg:p-8 bg-neutral-800/50")}
    >
      <h2 className="font-bold flex gap-2 items-center">
        <FaSitemap /> Organisationen
      </h2>

      {activeOrganizationMemberships.length > 0 ? (
        <ul className="flex gap-2 flex-wrap mt-4">
          {activeOrganizationMemberships
            .sort((a, b) =>
              a.organization.name.localeCompare(b.organization.name),
            )
            .map((membership) => (
              <li
                key={membership.organization.id}
                className="rounded bg-neutral-700/50 flex overflow-hidden"
              >
                <Link
                  href={`/app/spynet/organization/${membership.organization.id}`}
                  className="inline-flex"
                >
                  {membership.organization.logo && (
                    <span className="bg-black align-bottom flex w-[32px] items-center justify-center">
                      <Image
                        src={`https://robertsspaceindustries.com${membership.organization.logo}`}
                        alt=""
                        width={24}
                        height={24}
                      />
                    </span>
                  )}

                  <span className="inline-flex gap-2 px-2 py-1 items-center">
                    {membership.organization.name}
                    <FaExternalLinkAlt className="text-sinister-red-500 hover:text-sinister-red-300 text-xs" />
                  </span>
                </Link>

                {showDeleteButton && (
                  <div className="border-l border-neutral-700 flex items-center">
                    <DeleteOrganizationMembership
                      className="p-2"
                      organizationId={membership.organization.id}
                      citizenId={id}
                    />
                  </div>
                )}
              </li>
            ))}
        </ul>
      ) : (
        <p className="mt-4 text-neutral-500">Keine Organisationen</p>
      )}

      {showCreateButton && (
        <CreateOrganizationMembership className="mt-2" citizenId={id} />
      )}
    </section>
  );
};
