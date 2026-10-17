import {
  getApplicationContext,
  throwApplicationErrorForPage,
  toActor,
} from "@/modules/application";
import { requireAuthentication } from "@/modules/auth/server";
import { Link } from "@/modules/common/components/Link";
import { Tile } from "@/modules/common/components/Tile";
import { CreateMembership } from "@/modules/organizations/components/CreateMembership";
import { DeleteOrganizationMembership } from "@/modules/spynet/components/DeleteOrganizationMembership";
import { listOrganizationMembershipsOfCitizen } from "@sam-monorepo/application";
import clsx from "clsx";
import Image from "next/image";
import { FaExternalLinkAlt } from "react-icons/fa";

interface Props {
  readonly className?: string;
  readonly id: string;
}

export const OrganizationMembershipsTile = async ({ className, id }: Props) => {
  const authentication = await requireAuthentication();
  const actor = await toActor(authentication.session);

  const activeOrganizationMemberships =
    await listOrganizationMembershipsOfCitizen(
      getApplicationContext(),
      actor,
      id,
    ).catch(throwApplicationErrorForPage);

  const showDeleteButton = actor.authorize("organizationMembership", "delete");
  const showCreateButton = actor.authorize("organizationMembership", "create");
  const showConfirmButton = actor.authorize(
    "organizationMembership",
    "confirm",
  );

  return (
    <Tile
      heading="Aktuell"
      cta={
        showCreateButton ? (
          <CreateMembership
            citizenId={id}
            showConfirmButton={showConfirmButton}
          />
        ) : null
      }
      className={clsx(className)}
    >
      {activeOrganizationMemberships.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {activeOrganizationMemberships.map((membership) => (
            <li
              key={membership.organization.id}
              className="flex overflow-hidden rounded-secondary bg-neutral-700/50"
            >
              <Link
                href={`/app/spynet/organization/${membership.organization.id}`}
                className="inline-flex"
              >
                {membership.organization.logo_url && (
                  <span className="flex w-8 items-center justify-center bg-black align-bottom">
                    <Image
                      src={membership.organization.logo_url}
                      alt=""
                      width={24}
                      height={24}
                      loading="lazy"
                    />
                  </span>
                )}

                <span className="inline-flex items-center gap-2 px-2 py-1">
                  {membership.organization.name}
                  <FaExternalLinkAlt className="text-xs text-brand-red-500 hover:text-brand-red-300" />
                </span>
              </Link>

              {showDeleteButton && (
                <div className="flex items-center border-l border-neutral-700">
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
        <p className="text-neutral-500">Keine Organisationen</p>
      )}
    </Tile>
  );
};
