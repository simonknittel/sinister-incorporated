import clsx from "clsx";
import Link from "next/link";
import { FaExternalLinkAlt, FaSitemap } from "react-icons/fa";
import { requireAuthentication } from "../../../../../../lib/auth/authenticateAndAuthorize";
import { prisma } from "../../../../../../server/db";
import { DeleteOrganizationMembership } from "../../../_components/DeleteOrganizationMembership";
import { CreateOrganizationMembership } from "./CreateOrganizationMembership";

type Props = Readonly<{
  className?: string;
  id: string;
}>;

export const OrganizationMembershipsTile = async ({ className, id }: Props) => {
  const authentication = await requireAuthentication();
  if (
    !authentication.authorize([
      {
        resource: "organizationMembership",
        operation: "read",
      },
    ])
  )
    throw new Error("Unauthorized");

  const alsoVisibilityRedacted = authentication.authorize([
    {
      resource: "organizationMembership",
      operation: "read",
      attributes: [
        {
          key: "alsoVisibilityRedacted",
          value: true,
        },
      ],
    },
  ]);

  const activeOrganizationMemberships =
    await prisma.activeOrganizationMembership.findMany({
      where: {
        citizenId: id,
        visibility: {
          in: alsoVisibilityRedacted ? ["PUBLIC", "REDACTED"] : ["PUBLIC"],
        },
      },
      select: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

  const showDeleteButton = authentication.authorize([
    {
      resource: "organizationMembership",
      operation: "delete",
    },
  ]);

  const showCreateButton = authentication.authorize([
    {
      resource: "organizationMembership",
      operation: "create",
    },
  ]);

  return (
    <section
      className={clsx(className, "rounded-2xl p-4 lg:p-8 bg-neutral-800/50")}
    >
      <h2 className="font-bold flex gap-2 items-center">
        <FaSitemap /> Organisationen
      </h2>

      {activeOrganizationMemberships.length > 0 ? (
        <ul className="flex gap-2 flex-wrap mt-4">
          {activeOrganizationMemberships.map((membership) => (
            <li
              key={membership.organization.id}
              className="rounded bg-neutral-700/50 flex"
            >
              <Link
                href={`/app/spynet/organization/${membership.organization.id}`}
                className="inline-flex gap-2 px-2 py-1 items-center"
              >
                {membership.organization.name}
                <FaExternalLinkAlt className="text-sinister-red-500 hover:text-sinister-red-300 text-xs" />
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
