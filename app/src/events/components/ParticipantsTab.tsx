import { requireAuthentication } from "@/auth/server";
import { RolesCell } from "@/citizen/components/RolesCell";
import { Link } from "@/common/components/Link";
import {
  sortAscWithAndNullLast,
  sortDescAndNullLast,
} from "@/common/utils/sorting";
import { getDiscordAvatar } from "@/discord/utils/getDiscordAvatar";
import { type getEvent } from "@/discord/utils/getEvent";
import type { memberSchema, userSchema } from "@/discord/utils/schemas";
import type { Entity } from "@prisma/client";
import * as Tooltip from "@radix-ui/react-tooltip";
import clsx from "clsx";
import Image from "next/image";
import { Suspense } from "react";
import {
  FaInfoCircle,
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaSortNumericDown,
  FaSortNumericUp,
} from "react-icons/fa";
import type { z } from "zod";
import { getParticipants } from "../utils/getParticipants";

const GRID_COLS = "grid-cols-[160px_160px_1fr]";

type Props = Readonly<{
  className?: string;
  event: Awaited<ReturnType<typeof getEvent>>["data"];
  urlSearchParams: URLSearchParams;
}>;

export const ParticipantsTab = async ({
  className,
  event,
  urlSearchParams,
}: Props) => {
  const authentication = await requireAuthentication();

  const { resolvedUsers, discordCreator, discordParticipants, spynetCitizen } =
    await getParticipants(event);

  const citizenSearchParams = new URLSearchParams(urlSearchParams);
  if (
    !urlSearchParams.has("sort") ||
    urlSearchParams.get("sort") === "citizen-asc"
  ) {
    citizenSearchParams.set("sort", "citizen-desc");
  } else {
    citizenSearchParams.set("sort", "citizen-asc");
  }

  const joinedAtSearchParams = new URLSearchParams(urlSearchParams);
  if (urlSearchParams.get("sort") === "joined-at-asc") {
    joinedAtSearchParams.set("sort", "joined-at-desc");
  } else {
    joinedAtSearchParams.set("sort", "joined-at-asc");
  }

  const sortedResolvedUsers = resolvedUsers
    .filter((user) => Boolean(user.entity))
    .toSorted((a, b) => {
      switch (urlSearchParams.get("sort")) {
        case "citizen-asc":
          return sortAscWithAndNullLast(a.entity!.handle, b.entity!.handle);
        case "citizen-desc":
          return sortDescAndNullLast(a.entity!.handle, b.entity!.handle);

        case "joined-at-asc":
          return sortAscWithAndNullLast(
            a.databaseEventParticipant?.createdAt?.getTime(),
            b.databaseEventParticipant?.createdAt?.getTime(),
          );
        case "joined-at-desc":
          return sortDescAndNullLast(
            a.databaseEventParticipant?.createdAt?.getTime(),
            b.databaseEventParticipant?.createdAt?.getTime(),
          );

        default:
          return sortAscWithAndNullLast(a.entity!.handle, b.entity!.handle);
      }
    });

  return (
    <div className={clsx("flex flex-col gap-4", className)}>
      <section className="rounded-2xl bg-neutral-800/50 p-4 lg:p-8">
        <h2 className="font-bold mb-4">
          Discord-Anmeldungen ({event.user_count})
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
          <table className="w-full min-w-[720px]">
            <thead>
              <tr
                className={clsx(
                  "grid items-center gap-4 text-left text-neutral-500 -mx-2",
                  GRID_COLS,
                )}
              >
                <th className="px-2">
                  <Link
                    href={`?${citizenSearchParams.toString()}`}
                    className="flex items-center gap-2 cursor-pointer select-none hover:text-neutral-300 whitespace-nowrap"
                  >
                    Citizen
                    {(!urlSearchParams.has("sort") ||
                      urlSearchParams.get("sort") === "citizen-asc") && (
                      <FaSortAlphaDown />
                    )}
                    {urlSearchParams.get("sort") === "citizen-desc" && (
                      <FaSortAlphaUp />
                    )}
                  </Link>
                </th>

                <th className="flex items-center gap-2">
                  <Link
                    href={`?${joinedAtSearchParams.toString()}`}
                    className="flex items-center gap-2 cursor-pointer select-none hover:text-neutral-300 whitespace-nowrap"
                  >
                    Zugesagt am
                    {urlSearchParams.get("sort") === "joined-at-asc" && (
                      <FaSortNumericDown />
                    )}
                    {urlSearchParams.get("sort") === "joined-at-desc" && (
                      <FaSortNumericUp />
                    )}
                  </Link>

                  <Tooltip.Provider delayDuration={300}>
                    <Tooltip.Root>
                      <Tooltip.Trigger className="text-sinister-red-500 hover:underline cursor-help">
                        <FaInfoCircle />
                      </Tooltip.Trigger>

                      <Tooltip.Content
                        className="p-2 text-sm leading-tight max-w-[640px] select-none rounded bg-neutral-600 text-white font-normal"
                        sideOffset={5}
                      >
                        Auf etwa 2 Minuten genau
                        <Tooltip.Arrow className="fill-neutral-600" />
                      </Tooltip.Content>
                    </Tooltip.Root>
                  </Tooltip.Provider>
                </th>

                <th
                  className="overflow-hidden text-ellipsis whitespace-nowrap"
                  title="Rollen/Zertifikate"
                >
                  Rollen/Zertifikate
                </th>
              </tr>
            </thead>

            <tbody>
              {sortedResolvedUsers.map((user) => {
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
                        href={`/app/spynet/citizen/${user.entity!.id}`}
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
                        prefetch={false}
                      >
                        <span className="flex items-center h-14">
                          <span className="overflow-hidden text-ellipsis">
                            {user.entity!.handle ? (
                              <span title={user.entity!.handle}>
                                {user.entity!.handle}
                              </span>
                            ) : (
                              <span className="text-neutral-500 italic">-</span>
                            )}
                          </span>
                        </span>
                      </Link>
                    </td>

                    <td className="h-full min-h-14 flex items-center">
                      {user.databaseEventParticipant?.createdAt ? (
                        <time>
                          {user.databaseEventParticipant.createdAt.toLocaleDateString(
                            "de-DE",
                            {
                              timeZone: "Europe/Berlin",
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </time>
                      ) : (
                        <span className="text-neutral-500 italic">-</span>
                      )}
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
  discord: {
    user: z.infer<typeof userSchema>;
    member?: z.infer<typeof memberSchema>;
  };
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
    discord.member?.nick ||
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
          src={`${getDiscordAvatar(discord.user, discord.member)}?size=32`}
          alt=""
          width={32}
          height={32}
        />
      </div>

      <span>{name}</span>
    </div>
  );
};
