import { Tile } from "@/common/components/Tile";
import { prisma } from "@/db";
import { mapOrganizationMembershipHistoryEntries } from "@/spynet/components/ActivityTile/mapOrganizationMembershipHistoryEntries";
import { ConfirmationStatus } from "@prisma/client";
import clsx from "clsx";

type Props = Readonly<{
  className?: string;
  id: string;
}>;

export const OrganizationMembershipHistory = async ({
  className,
  id,
}: Props) => {
  const result = await prisma.organizationMembershipHistoryEntry.findMany({
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
      citizenId: id,
    },
    take: 15,
    include: {
      organization: true,
      citizen: true,
    },
  });

  const entries = await mapOrganizationMembershipHistoryEntries(result);

  const sortedEntries = entries.toSorted(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );

  const limitedEntries = sortedEntries.slice(0, 15);

  return (
    <Tile heading="Verlauf" className={clsx(className)}>
      {entries.length > 0 ? (
        <ul className="flex flex-col gap-8">
          {limitedEntries.map((entry) => (
            <li key={entry.key}>
              <div className="text-sm flex gap-2 border-b pb-2 mb-2 items-center border-neutral-800/50 flex-wrap text-neutral-500">
                <p>
                  <time dateTime={entry.date.toISOString()}>
                    {entry.date.toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      timeZone: "Europe/Berlin",
                    })}
                  </time>
                </p>
              </div>

              <div>{entry.message}</div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-neutral-500">Keine Aktivität vorhanden</p>
      )}
    </Tile>
  );
};
