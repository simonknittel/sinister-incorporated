import { requireAuthentication } from "@/auth/server";
import { Link } from "@/common/components/Link";
import type { Entity } from "@prisma/client";
import clsx from "clsx";

type Props = Readonly<{
  className?: string;
  active: string;
  citizenId: Entity["id"];
}>;

export const CitizenNavigation = async ({
  className,
  active,
  citizenId,
}: Props) => {
  const authentication = await requireAuthentication();
  const showOrganizations = await authentication.authorize(
    "organizationMembership",
    "read",
  );
  const showSilcTransactions =
    citizenId === authentication.session.entityId
      ? await authentication.authorize(
          "silcTransactionOfCurrentCitizen",
          "read",
        )
      : await authentication.authorize("silcTransactionOfOtherCitizen", "read");
  const showPenaltyPoints =
    citizenId === authentication.session.entityId
      ? await authentication.authorize("ownPenaltyEntry", "read")
      : await authentication.authorize("penaltyEntry", "read");

  const pages = [
    {
      name: "Übersicht",
      path: `/app/spynet/citizen/${citizenId}`,
    },

    {
      name: "Notizen",
      path: `/app/spynet/citizen/${citizenId}/notes`,
    },

    ...(showOrganizations
      ? [
          {
            name: "Organisationen",
            path: `/app/spynet/citizen/${citizenId}/organizations`,
          },
        ]
      : []),

    ...(showSilcTransactions
      ? [
          {
            name: "SILC",
            path: `/app/spynet/citizen/${citizenId}/silc`,
          },
        ]
      : []),

    ...(showPenaltyPoints
      ? [
          {
            name: "Strafpunkte",
            path: `/app/spynet/citizen/${citizenId}/penalty-points`,
          },
        ]
      : []),
  ];

  return (
    <div className={clsx("flex flex-wrap", className)}>
      {pages.map((page) => (
        <Link
          key={page.path}
          href={page.path}
          className={clsx(
            "first:rounded-l border-[1px] border-sinister-red-700 last:rounded-r h-8 flex items-center justify-center px-3 gap-2 uppercase",
            {
              "bg-sinister-red-500 text-white": active === page.path,
              "text-sinister-red-500 hover:text-sinister-red-300 hover:border-sinister-red-300":
                active !== page.path,
            },
          )}
        >
          {page.name}
        </Link>
      ))}
    </div>
  );
};
