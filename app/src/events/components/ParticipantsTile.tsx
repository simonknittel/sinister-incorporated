import { RolesCell } from "@/app/app/spynet/citizen/_components/RolesCell";
import { prisma } from "@/db";
import { type getEvent } from "@/discord/getEvent";
import { getEventUsersDeduped } from "@/discord/getEventUsers";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

type Props = Readonly<{
  className?: string;
  event: Awaited<ReturnType<typeof getEvent>>["data"];
}>;

const GRID_COLS = "grid-cols-[160px,1fr]";

export const ParticipantsTile = async ({ className, event }: Props) => {
  const discordEventUsers = await getEventUsersDeduped(event.id);

  const citizenEntities = await prisma.entity.findMany({
    where: {
      discordId: {
        in: discordEventUsers.map((user) => user.user.id),
      },
    },
  });

  const resolvedUsers = discordEventUsers
    .map((user) => {
      const entity = citizenEntities.find(
        (entity) => entity.discordId === user.user.id,
      );

      return {
        entity,
        discord: user,
      };
    })
    .toSorted((a, b) => {
      return (
        a.entity?.handle ||
        a.discord.member.nick ||
        a.discord.user.global_name ||
        a.discord.user.username
      ).localeCompare(
        b.entity?.handle ||
          b.discord.member.nick ||
          b.discord.user.global_name ||
          b.discord.user.username,
      );
    });

  return (
    <div className={clsx("flex flex-col gap-4", className)}>
      <section className="rounded-2xl bg-neutral-800/50 p-4 lg:p-8">
        <h2 className="font-bold mb-4">Discord-Anmeldungen</h2>

        {resolvedUsers.length > 0 ? (
          <div className="flex gap-2 flex-wrap">
            {resolvedUsers.map((user) => (
              <div
                key={user.discord.user.id}
                className="flex gap-2 rounded bg-neutral-800 p-1 pr-2 items-center"
              >
                <div className="rounded overflow-hidden">
                  <Image
                    src={`https://cdn.discordapp.com/avatars/${user.discord.user.id}/${user.discord.member.avatar || user.discord.user.avatar}.png`}
                    alt=""
                    width={32}
                    height={32}
                  />
                </div>

                <span>
                  {user.entity?.handle ||
                    user.discord.member.nick ||
                    user.discord.user.global_name ||
                    user.discord.user.username}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p>Es sind keine Teilnehmer angemeldet.</p>
        )}
      </section>

      <section className="rounded-2xl bg-neutral-800/50 p-4 lg:p-8 overflow-auto">
        <h2 className="font-bold mb-4">Spynet</h2>

        {resolvedUsers.filter((user) => Boolean(user.entity)).length > 0 ? (
          <table>
            <thead>
              <tr
                className={clsx(
                  "grid items-center gap-4 text-left text-neutral-500 -mx-2",
                  GRID_COLS,
                )}
              >
                <th className="px-2">Handle</th>

                <th
                  className="overflow-hidden text-ellipsis whitespace-nowrap"
                  title="Rollen/Zertifikate"
                >
                  Rollen/Zertifikate
                </th>
              </tr>
            </thead>

            <tbody>
              {resolvedUsers
                .filter((user) => Boolean(user.entity))
                .map((user) => {
                  return (
                    <tr
                      key={user.entity!.id}
                      className={clsx(
                        "grid items-center gap-4 rounded -mx-2",
                        GRID_COLS,
                      )}
                    >
                      <td className="h-full min-h-14">
                        <Link
                          href={`/app/spynet/entity/${user.entity!.id}`}
                          className="text-sinister-red-500 hover:bg-neutral-800 block rounded px-2 h-full"
                        >
                          <span className="flex items-center h-14">
                            <span className="overflow-hidden text-ellipsis">
                              {user.entity!.handle ? (
                                <span title={user.entity!.handle}>
                                  {user.entity!.handle}
                                </span>
                              ) : (
                                <span className="text-neutral-500 italic">
                                  -
                                </span>
                              )}
                            </span>
                          </span>
                        </Link>
                      </td>

                      <td className="h-full min-h-14 flex items-center">
                        <Suspense
                          fallback={
                            <div className="bg-neutral-800 animate-pulse rounded h-8 w-20" />
                          }
                        >
                          <RolesCell
                            entity={user.entity!}
                            assignableRoles={[]}
                            className="flex-wrap"
                          />
                        </Suspense>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        ) : (
          <p>Zu den gemeldeten Teilnehmern gibt es keine Spynet-Einträge.</p>
        )}
      </section>
    </div>
  );
};
