import clsx from "clsx";
import Link from "next/link";
import { FaExternalLinkAlt, FaListAlt } from "react-icons/fa";
import { TbCircleDot } from "react-icons/tb";
import { requireAuthentication } from "../../../../../../lib/auth/authenticateAndAuthorize";
import { prisma } from "../../../../../../server/db";

type Props = Readonly<{
  className?: string;
  id: string;
}>;

export const ActivityTile = async ({ className, id }: Props) => {
  const authentication = await requireAuthentication();
  if (
    !authentication.authorize([
      {
        resource: "organization",
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

  const organization = await prisma.organization.findUnique({
    where: {
      id,
    },
    select: {
      createdAt: true,
      attributeHistoryEntries: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          attributeKey: true,
          createdAt: true,
          newValue: true,
        },
      },
      membershipHistoryEntries: {
        where: {
          visibility: {
            in: alsoVisibilityRedacted ? ["PUBLIC", "REDACTED"] : ["PUBLIC"],
          },
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          citizen: {
            select: {
              id: true,
              handle: true,
            },
          },
          type: true,
          visibility: true,
          createdAt: true,
        },
      },
    },
  });
  if (!organization) throw new Error("Organization not found");

  const entries = [
    {
      key: "created",
      date: organization.createdAt,
      /**
       * We can use `!` here since it's guaranteed that the first entry exists because it will always get created with the creation of the organization.
       */
      message: (
        <p>
          Erstellt unter dem Namen{" "}
          <strong>{organization.attributeHistoryEntries[0]!.newValue}</strong>
        </p>
      ),
    },
    ...organization.attributeHistoryEntries.toSpliced(0, 1).map((entry) => {
      switch (entry.attributeKey) {
        case "name":
          return {
            key: entry.id,
            date: entry.createdAt,
            message: (
              <p>
                Unbenannt in <strong>{entry.newValue}</strong>
              </p>
            ),
          };

        default:
          throw new Error(`Unknown attribute key: ${entry.attributeKey}`);
      }
    }),
    ...organization.membershipHistoryEntries.map((entry) => {
      switch (entry.type) {
        case "MAIN":
          return {
            key: entry.id,
            date: entry.createdAt,
            message: (
              <p>
                <Link
                  href={`/app/spynet/entity/${entry.citizen.id}`}
                  className="inline-flex gap-2 items-center text-sinister-red-500 hover:text-sinister-red-300 font-bold mr-1"
                >
                  {entry.citizen.handle}
                  <FaExternalLinkAlt className="text-xs" />
                </Link>{" "}
                wurde als <strong>Main</strong> hinzugefügt
              </p>
            ),
          };

        case "AFFILIATE":
          return {
            key: entry.id,
            date: entry.createdAt,
            message: (
              <p>
                <Link
                  href={`/app/spynet/entity/${entry.citizen.id}`}
                  className="inline-flex gap-2 items-center text-sinister-red-500 hover:text-sinister-red-300 font-bold mr-1"
                >
                  {entry.citizen.handle}
                  <FaExternalLinkAlt className="text-xs" />
                </Link>{" "}
                wurde als <strong>Affiliate</strong> hinzugefügt
              </p>
            ),
          };

        case "LEFT":
          return {
            key: entry.id,
            date: entry.createdAt,
            message: (
              <p>
                <Link
                  href={`/app/spynet/entity/${entry.citizen.id}`}
                  className="inline-flex gap-2 items-center text-sinister-red-500 hover:text-sinister-red-300 font-bold mr-1"
                >
                  {entry.citizen.handle}
                  <FaExternalLinkAlt className="text-xs" />
                </Link>{" "}
                wurde entfernt
              </p>
            ),
          };
      }
    }),
  ];

  // Sort entries by date in descending order
  const sortedEntries = entries.toSorted(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );

  return (
    <section
      className={clsx(className, "rounded-2xl p-4 lg:p-8 bg-neutral-800/50")}
    >
      <h2 className="font-bold flex gap-2 items-center">
        <FaListAlt /> Aktivität
      </h2>

      <ul className="mt-4 flex flex-col gap-8">
        {sortedEntries.map((entry) => (
          <li key={entry.key} className="flex gap-2">
            <div className="h-[20px] flex items-center">
              <TbCircleDot />
            </div>

            <div className="flex-1">
              <div className="text-sm flex gap-2 border-b pb-2 mb-2 items-center border-neutral-800 flex-wrap text-neutral-500">
                <p>
                  <time dateTime={entry.date.toISOString()}>
                    {entry.date.toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </time>
                </p>
              </div>

              <div>{entry.message}</div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
