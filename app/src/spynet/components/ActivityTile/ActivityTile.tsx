import { requireAuthentication } from "@/auth/server";
import { formatDate } from "@/common/utils/formatDate";
import { prisma } from "@/db";
import { ConfirmationStatus } from "@prisma/client";
import clsx from "clsx";
import { TbCircleDot } from "react-icons/tb";
import { mapOrganizationAttributeHistoryEntries } from "./mapOrganizationAttributeHistoryEntries";
import { mapOrganizationEntries } from "./mapOrganizationEntries";
import { mapOrganizationMembershipHistoryEntries } from "./mapOrganizationMembershipHistoryEntries";

interface Props {
  readonly className?: string;
}

export const ActivityTile = async ({ className }: Props) => {
  await requireAuthentication();

  const result = await prisma.$transaction([
    prisma.organization.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 15,
    }),

    prisma.organizationAttributeHistoryEntry.findMany({
      orderBy: [
        {
          confirmedAt: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      where: {
        confirmed: ConfirmationStatus.CONFIRMED,
      },
      take: 15,
    }),

    prisma.organizationMembershipHistoryEntry.findMany({
      orderBy: [
        {
          confirmedAt: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      where: {
        confirmed: ConfirmationStatus.CONFIRMED,
      },
      take: 15,
      include: {
        organization: true,
        citizen: true,
      },
    }),
  ]);

  const entries = [
    ...(await mapOrganizationEntries(result[0])),
    ...(await mapOrganizationAttributeHistoryEntries(result[1])),
    ...(await mapOrganizationMembershipHistoryEntries(result[2])),
  ];

  const sortedEntries = entries.toSorted(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );

  const limitedEntries = sortedEntries.slice(0, 15);

  return (
    <section className={clsx(className)}>
      <small className="text-neutral-500 italic">
        Aktuell werden hier nur Änderungen an Organisationen aufgelistet.
        Änderungen an Citizens folgen später.
      </small>

      <div className="rounded-2xl p-4 lg:p-8 bg-neutral-800/50 mt-4">
        {entries.length > 0 ? (
          <ul className="flex flex-col gap-8">
            {limitedEntries.map((entry) => (
              <li key={entry.key} className="flex gap-2">
                <div className="h-[20px] flex items-center">
                  <TbCircleDot />
                </div>

                <div className="flex-1">
                  <div className="text-sm flex gap-2 border-b pb-2 mb-2 items-center border-neutral-800/50 flex-wrap text-neutral-500">
                    <p>
                      <time dateTime={entry.date.toISOString()}>
                        {formatDate(entry.date)}
                      </time>
                    </p>
                  </div>

                  <div>{entry.message}</div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-neutral-500">Keine Aktivität vorhanden</p>
        )}
      </div>
    </section>
  );
};
