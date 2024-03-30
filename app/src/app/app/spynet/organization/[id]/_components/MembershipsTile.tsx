import clsx from "clsx";
import Link from "next/link";
import { FaExternalLinkAlt, FaUsers } from "react-icons/fa";
import { requireAuthentication } from "../../../../../../lib/auth/authenticateAndAuthorize";
import { prisma } from "../../../../../../server/db";
import { DeleteOrganizationMembership } from "../../../_components/DeleteOrganizationMembership";
import { CreateMembership } from "./CreateMembership";

type Props = Readonly<{
  className?: string;
  id: string;
}>;

export const MembershipsTile = async ({ className, id }: Props) => {
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
        organizationId: id,
        visibility: {
          in: alsoVisibilityRedacted ? ["PUBLIC", "REDACTED"] : ["PUBLIC"],
        },
      },
      select: {
        citizen: {
          select: {
            id: true,
            handle: true,
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
        <FaUsers /> Mitglieder
      </h2>

      {activeOrganizationMemberships.length > 0 ? (
        <ul className="flex gap-2 flex-wrap mt-4">
          {activeOrganizationMemberships.map((membership) => (
            <li
              key={membership.citizen.id}
              className="rounded bg-neutral-700/50 flex"
            >
              <Link
                href={`/app/spynet/entity/${membership.citizen.id}`}
                className="inline-flex gap-2 px-2 py-1 items-center"
              >
                {membership.citizen.handle || membership.citizen.id}
                <FaExternalLinkAlt className="text-sinister-red-500 hover:text-sinister-red-300 text-xs" />
              </Link>

              {showDeleteButton && (
                <div className="border-l border-neutral-700 flex items-center">
                  <DeleteOrganizationMembership
                    className="p-2"
                    organizationId={id}
                    citizenId={membership.citizen.id}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-neutral-500 mt-4">Keine Mitglieder</p>
      )}

      {showCreateButton && (
        <CreateMembership className="mt-2" organizationId={id} />
      )}
    </section>
  );
};
