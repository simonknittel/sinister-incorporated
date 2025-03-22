import { requireAuthentication } from "@/auth/server";
import { RolesCell } from "@/citizen/components/RolesCell";
import { Link } from "@/common/components/Link";
import { Tooltip } from "@/common/components/Tooltip";
import {
  sortAscWithAndNullLast,
  sortDescAndNullLast,
} from "@/common/utils/sorting";
import type { Entity, Event, EventDiscordParticipant } from "@prisma/client";
import clsx from "clsx";
import { Suspense } from "react";
import {
  FaInfoCircle,
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaSortNumericDown,
  FaSortNumericUp,
} from "react-icons/fa";
import { getParticipants } from "../utils/getParticipants";
import { isAllowedToManageEvent } from "../utils/isAllowedToManageEvent";
import { CreateManagers } from "./CreateManagers";
import { DeleteManager } from "./DeleteManager";

const GRID_COLS = "grid-cols-[160px_160px_1fr]";

type Props = Readonly<{
  className?: string;
  event: Event & {
    discordParticipants: EventDiscordParticipant[];
    managers: Entity[];
  };
  urlSearchParams: URLSearchParams;
}>;

export const ParticipantsTab = async ({
  className,
  event,
  urlSearchParams,
}: Props) => {
  const authentication = await requireAuthentication();
  const showCreateManagersButton = await isAllowedToManageEvent(event);
  const showDeleteManagerButton = showCreateManagersButton;

  const resolvedParticipants = await getParticipants(event);

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

  const sortedResolvedParticipants = resolvedParticipants.toSorted((a, b) => {
    switch (urlSearchParams.get("sort")) {
      case "citizen-asc":
        return sortAscWithAndNullLast(a.citizen.handle, b.citizen.handle);
      case "citizen-desc":
        return sortDescAndNullLast(a.citizen.handle, b.citizen.handle);

      case "joined-at-asc":
        return sortAscWithAndNullLast(
          a.participant.createdAt?.getTime(),
          b.participant.createdAt?.getTime(),
        );
      case "joined-at-desc":
        return sortDescAndNullLast(
          a.participant.createdAt?.getTime(),
          b.participant.createdAt?.getTime(),
        );

      default:
        return sortAscWithAndNullLast(a.citizen.handle, b.citizen.handle);
    }
  });

  const resolvedCreatorParticipant = resolvedParticipants.find(
    (resolvedParticipant) =>
      resolvedParticipant.citizen.discordId === event.discordCreatorId,
  )!;

  return (
    <div className={clsx("flex flex-col gap-4", className)}>
      <section className="rounded-2xl bg-neutral-800/50 p-4 lg:p-8">
        <h2 className="font-bold mb-2 text-lg">Organisator</h2>
        <Link
          href={`/app/spynet/citizen/${resolvedCreatorParticipant.citizen.id}`}
          className={clsx("mt-2 hover:underline self-start", {
            "text-green-500":
              resolvedCreatorParticipant.citizen.id ===
              authentication.session.entityId,
            "text-sinister-red-500":
              resolvedCreatorParticipant.citizen.id !==
              authentication.session.entityId,
          })}
          prefetch={false}
        >
          {resolvedCreatorParticipant.citizen.handle ||
            resolvedCreatorParticipant.citizen.id}
        </Link>

        <div className="flex items-center gap-2 mt-4 mb-2">
          <h2 className="font-bold text-lg">Manager</h2>
          {showCreateManagersButton && <CreateManagers event={event} />}
        </div>
        {event.managers.length > 0 ? (
          <div className="flex gap-x-3 gap-y-1 flex-wrap">
            {event.managers
              .toSorted((a, b) =>
                (a.handle || a.id).localeCompare(b.handle || b.id),
              )
              .map((manager) => {
                if (showDeleteManagerButton) {
                  return (
                    <div
                      key={manager.id}
                      className="rounded bg-neutral-700/50 flex"
                    >
                      <Link
                        href={`/app/spynet/citizen/${manager.id}`}
                        className={clsx("hover:underline px-2 py-1", {
                          "text-green-500":
                            manager.id === authentication.session.entityId,
                          "text-sinister-red-500":
                            manager.id !== authentication.session.entityId,
                        })}
                        prefetch={false}
                      >
                        {manager.handle || manager.id}
                      </Link>

                      <DeleteManager
                        eventId={event.id}
                        managerId={manager.id}
                      />
                    </div>
                  );
                }

                return (
                  <Link
                    key={manager.id}
                    href={`/app/spynet/citizen/${manager.id}`}
                    className={clsx("hover:underline", {
                      "text-green-500":
                        manager.id === authentication.session.entityId,
                      "text-sinister-red-500":
                        manager.id !== authentication.session.entityId,
                    })}
                    prefetch={false}
                  >
                    {manager.handle || manager.id}
                  </Link>
                );
              })}
          </div>
        ) : (
          <span className="text-neutral-500">-</span>
        )}
      </section>

      <section className="rounded-2xl bg-neutral-800/50 p-4 lg:p-8 overflow-auto">
        <h2 className="font-bold mb-4 flex items-center gap-2 text-lg">
          Teilnehmer ({sortedResolvedParticipants.length})
          <Tooltip triggerChildren={<FaInfoCircle />}>
            Es werden nur Discord-Anmeldungen mit einem Spynet-Eintrag
            angezeigt.
          </Tooltip>
        </h2>

        {sortedResolvedParticipants.length > 0 ? (
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

                  <Tooltip triggerChildren={<FaInfoCircle />}>
                    Auf etwa 2 Minuten genau
                  </Tooltip>
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
              {sortedResolvedParticipants.map((resolvedParticipant) => {
                return (
                  <tr
                    key={resolvedParticipant.citizen.id}
                    className={clsx(
                      "grid items-center gap-4 rounded -mx-2",
                      GRID_COLS,
                    )}
                  >
                    <td className="h-full min-h-14">
                      <Link
                        href={`/app/spynet/citizen/${resolvedParticipant.citizen.id}`}
                        className={clsx(
                          "hover:bg-neutral-800 block rounded px-2 h-full",
                          {
                            "text-green-500":
                              resolvedParticipant.citizen.id ===
                              authentication.session.entityId,
                            "text-sinister-red-500":
                              resolvedParticipant.citizen.id !==
                              authentication.session.entityId,
                          },
                        )}
                        prefetch={false}
                      >
                        <span className="flex items-center h-14">
                          <span className="overflow-hidden text-ellipsis">
                            {resolvedParticipant.citizen.handle ? (
                              <span title={resolvedParticipant.citizen.handle}>
                                {resolvedParticipant.citizen.handle}
                              </span>
                            ) : (
                              <span className="text-neutral-500 italic">-</span>
                            )}
                          </span>
                        </span>
                      </Link>
                    </td>

                    <td className="h-full min-h-14 flex items-center">
                      {resolvedParticipant.participant.createdAt ? (
                        <time>
                          {resolvedParticipant.participant.createdAt.toLocaleDateString(
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
                          entity={resolvedParticipant.citizen}
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
