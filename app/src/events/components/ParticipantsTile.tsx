import { RolesCell } from "@/app/app/spynet/citizen/_components/RolesCell";
import { requireAuthentication } from "@/auth/server";
import { prisma } from "@/db";
import { type getEvent } from "@/discord/getEvent";
import { getEventUsersDeduped } from "@/discord/getEventUsers";
import type { Entity } from "@prisma/client";
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
  const [authentication, discordEventUsers] = await Promise.all([
    requireAuthentication(),
    getEventUsersDeduped(event.id),
  ]);

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

  const discordCreator = resolvedUsers.find(
    (user) => user.discord.user.id === event.creator_id,
  )!;
  const discordParticipants = resolvedUsers.filter(
    (user) => user.discord.user.id !== event.creator_id,
  );
  const spynetCitizen = resolvedUsers.filter((user) => Boolean(user.entity));

  return (
    <div className={clsx("flex flex-col gap-4", className)}>
      <section className="rounded-2xl bg-neutral-800/50 p-4 lg:p-8">
        <h2 className="font-bold mb-4">
          Discord-Anmeldungen ({resolvedUsers.length})
        </h2>

        <h3 className="mb-2">Organisator</h3>
        <DiscordUser
          discord={discordCreator.discord}
          citizen={discordCreator.entity}
          isCurrentUser={
            discordCreator.entity?.id === authentication.session.entityId
          }
        />

        <h3 className="mt-4 mb-2">Teilnehmer</h3>
        {discordParticipants.length > 0 ? (
          <div className="flex gap-2 flex-wrap">
            {discordParticipants.map((user) => (
              <DiscordUser
                key={user.discord.user.id}
                discord={user.discord}
                citizen={user.entity}
                isCurrentUser={
                  user.entity?.id === authentication.session.entityId
                }
              />
            ))}
          </div>
        ) : (
          <p>Es sind keine Teilnehmer angemeldet.</p>
        )}
      </section>

      <section className="rounded-2xl bg-neutral-800/50 p-4 lg:p-8 overflow-auto">
        <h2 className="font-bold mb-4">Spynet ({spynetCitizen.length})</h2>

        {spynetCitizen.length > 0 ? (
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
                          className={clsx(
                            "hover:bg-neutral-800 block rounded px-2 h-full",
                            {
                              "text-green-500":
                                user.entity!.id ===
                                authentication.session.entityId,
                              "text-sinister-red-500":
                                user.entity!.id !==
                                authentication.session.entityId,
                            },
                          )}
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

type DiscordUserProps = Readonly<{
  discord: Awaited<ReturnType<typeof getEventUsersDeduped>>[number];
  citizen?: Entity;
  isCurrentUser?: boolean;
}>;

const DiscordUser = ({
  discord,
  citizen,
  isCurrentUser = false,
}: DiscordUserProps) => {
  const name =
    citizen?.handle ||
    discord.member.nick ||
    discord.user.global_name ||
    discord.user.username;

  return (
    <div
      className={clsx(
        "inline-flex gap-2 rounded bg-neutral-800 p-1 pr-2 items-center border",
        {
          "border-green-500": isCurrentUser,
          "border-neutral-800": !isCurrentUser,
        },
      )}
    >
      <div className="rounded overflow-hidden">
        <Image
          src={`https://cdn.discordapp.com/avatars/${discord.user.id}/${discord.member.avatar || discord.user.avatar}.png`}
          alt={`Discord-Avatar von ${name}`}
          width={32}
          height={32}
        />
      </div>

      <span>{name}</span>
    </div>
  );
};
