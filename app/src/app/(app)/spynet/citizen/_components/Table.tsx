import { type Entity, type Role } from "@prisma/client";
import Link from "next/link";
import { Suspense } from "react";
import { FaExternalLinkAlt, FaSortDown, FaSortUp } from "react-icons/fa";
import Actions from "~/app/_components/Actions";
import { HistoryModal } from "../../entity/[id]/_components/generic-log-type/HistoryModal";
import DeleteEntity from "./DeleteEntity";
import { LastSeenAt } from "./LastSeenAt";
import { RolesCell } from "./RolesCell";

type Row = {
  entity: Entity;
};

interface Props {
  rows: Row[];
  assignableRoles: Role[];
  showDiscordIdColumn?: boolean;
  showTeamspeakIdColumn?: boolean;
  showLastSeenAtColumn?: boolean;
  showDeleteEntityButton?: boolean;
  searchParams: URLSearchParams;
}

const Table = ({
  rows,
  assignableRoles,
  showDiscordIdColumn = false,
  showTeamspeakIdColumn = false,
  showLastSeenAtColumn = false,
  showDeleteEntityButton = false,
  searchParams,
}: Readonly<Props>) => {
  const handleSearchParams = new URLSearchParams(searchParams);
  if (searchParams.get("sort") === "handle-asc") {
    handleSearchParams.set("sort", "handle-desc");
  } else {
    handleSearchParams.set("sort", "handle-asc");
  }

  const discordIdSearchParams = new URLSearchParams(searchParams);
  if (searchParams.get("sort") === "discord-id-asc") {
    discordIdSearchParams.set("sort", "discord-id-desc");
  } else {
    discordIdSearchParams.set("sort", "discord-id-asc");
  }

  const teamspeakIdSearchParams = new URLSearchParams(searchParams);
  if (searchParams.get("sort") === "teamspeak-id-asc") {
    teamspeakIdSearchParams.set("sort", "teamspeak-id-desc");
  } else {
    teamspeakIdSearchParams.set("sort", "teamspeak-id-asc");
  }

  const createdAtSearchParams = new URLSearchParams(searchParams);
  if (
    !searchParams.has("sort") ||
    searchParams.get("sort") === "created-at-desc"
  ) {
    createdAtSearchParams.set("sort", "created-at-asc");
  } else {
    createdAtSearchParams.set("sort", "created-at-desc");
  }

  const lastSeenAtSearchParams = new URLSearchParams(searchParams);
  if (searchParams.get("sort") === "last-seen-at-desc") {
    lastSeenAtSearchParams.set("sort", "last-seen-at-asc");
  } else {
    lastSeenAtSearchParams.set("sort", "last-seen-at-desc");
  }

  let columnCount = 4;
  if (showDiscordIdColumn) columnCount++;
  if (showTeamspeakIdColumn) columnCount++;
  if (showLastSeenAtColumn) columnCount++;

  return (
    <table className="w-full min-w-[1100px]">
      <thead>
        <tr
          className="grid items-center gap-4 text-left text-neutral-500"
          style={{
            gridTemplateColumns: `repeat(${columnCount}, 1fr) 44px`, // Tailwind CSS can't detect dynamic CSS classes. Therefore we are using an inline style here.
          }}
        >
          <th>
            <Link
              href={`?${handleSearchParams.toString()}`}
              prefetch={false}
              className="flex items-center gap-2 cursor-pointer select-none hover:text-neutral-300"
            >
              Handle
              {searchParams.get("sort") === "handle-asc" && <FaSortUp />}
              {searchParams.get("sort") === "handle-desc" && <FaSortDown />}
            </Link>
          </th>

          <th className="whitespace-nowrap">Spectrum ID</th>

          {showDiscordIdColumn && (
            <th className="whitespace-nowrap">Discord ID</th>
          )}

          {showTeamspeakIdColumn && (
            <th className="whitespace-nowrap">TeamSpeak ID</th>
          )}

          <th>Rollen</th>

          <th>
            <Link
              href={`?${createdAtSearchParams.toString()}`}
              prefetch={false}
              className="flex items-center gap-2 cursor-pointer select-none hover:text-neutral-300 whitespace-nowrap"
            >
              Erstellt am
              {(!searchParams.has("sort") ||
                searchParams.get("sort") === "created-at-desc") && (
                <FaSortDown />
              )}
              {searchParams.get("sort") === "created-at-asc" && <FaSortUp />}
            </Link>
          </th>

          {showLastSeenAtColumn && (
            <th>
              <Link
                href={`?${lastSeenAtSearchParams.toString()}`}
                prefetch={false}
                className="flex items-center gap-2 cursor-pointer select-none hover:text-neutral-300 whitespace-nowrap"
              >
                Zuletzt gesehen
                {searchParams.get("sort") === "last-seen-at-asc" && (
                  <FaSortUp />
                )}
                {searchParams.get("sort") === "last-seen-at-desc" && (
                  <FaSortDown />
                )}
              </Link>
            </th>
          )}
        </tr>
      </thead>

      <tbody>
        {rows.map((row) => {
          return (
            <tr
              key={row.entity.id}
              className="grid items-center gap-4 px-2 h-14 rounded -mx-2 first:mt-2"
              style={{
                gridTemplateColumns: `repeat(${columnCount}, 1fr) 44px`, // Tailwind CSS can't detect dynamic CSS classes. Therefore we are using an inline style here.
              }}
            >
              <td className="overflow-hidden flex gap-4 items-center justify-between">
                <span className="overflow-hidden text-ellipsis">
                  {row.entity.handle ? (
                    <span title={row.entity.handle}>{row.entity.handle}</span>
                  ) : (
                    <span className="text-neutral-500 italic">Unbekannt</span>
                  )}
                </span>
                <HistoryModal
                  type="handle"
                  entity={row.entity}
                  iconOnly={true}
                />
              </td>

              <td
                className="overflow-hidden text-ellipsis"
                title={row.entity.spectrumId || undefined}
              >
                {row.entity.spectrumId}
              </td>

              {showDiscordIdColumn && (
                <td className="flex gap-4 items-center overflow-hidden justify-between">
                  <span className="overflow-hidden text-ellipsis">
                    {row.entity.discordId ? (
                      <span title={row.entity.discordId}>
                        {row.entity.discordId}
                      </span>
                    ) : (
                      <span className="text-neutral-500 italic">Unbekannt</span>
                    )}
                  </span>
                  <HistoryModal
                    type="discord-id"
                    entity={row.entity}
                    iconOnly={true}
                  />
                </td>
              )}

              {showTeamspeakIdColumn && (
                <td className="overflow-hidden flex gap-4 items-center justify-between">
                  <span className="overflow-hidden text-ellipsis">
                    {row.entity.teamspeakId ? (
                      <span title={row.entity.teamspeakId}>
                        {row.entity.teamspeakId}
                      </span>
                    ) : (
                      <span className="text-neutral-500 italic">Unbekannt</span>
                    )}
                  </span>
                  <HistoryModal
                    type="teamspeak-id"
                    entity={row.entity}
                    iconOnly={true}
                  />
                </td>
              )}

              <td className="overflow-hidden flex gap-4 items-center justify-between">
                <Suspense
                  fallback={
                    <div className="bg-neutral-800 animate-pulse rounded h-8 w-20" />
                  }
                >
                  <RolesCell
                    entity={row.entity}
                    assignableRoles={assignableRoles}
                  />
                </Suspense>
              </td>

              <td className="overflow-hidden text-ellipsis">
                {row.entity.createdAt?.toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </td>

              {showLastSeenAtColumn && (
                <td className="overflow-hidden text-ellipsis">
                  <Suspense
                    fallback={
                      <div className="bg-neutral-800 animate-pulse rounded h-6 w-20" />
                    }
                  >
                    <LastSeenAt entity={row.entity} />
                  </Suspense>
                </td>
              )}

              <td>
                <Actions>
                  <Link
                    href={`/spynet/entity/${row.entity.id}`}
                    className="text-sinister-red-500 hover:text-sinister-red-300 flex gap-2 items-center text-sm whitespace-nowrap h-8"
                  >
                    <FaExternalLinkAlt />
                    Vollständiger Eintrag
                  </Link>

                  {showDeleteEntityButton && (
                    <DeleteEntity entity={row.entity} />
                  )}
                </Actions>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default Table;
