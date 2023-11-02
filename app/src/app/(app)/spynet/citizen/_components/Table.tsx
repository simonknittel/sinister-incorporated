import {
  type Entity,
  type EntityLog,
  type EntityLogAttribute,
  type Role,
  type User,
} from "@prisma/client";
import Link from "next/link";
import { FaExternalLinkAlt, FaSortDown, FaSortUp } from "react-icons/fa";
import Actions from "~/app/_components/Actions";
import { HistoryModal } from "../../entity/[id]/_components/generic-log-type/HistoryModal";
import Handles from "../../entity/[id]/_components/handle/Handles";
import AddRoles from "../../entity/[id]/_components/roles/AddRoles";
import SingleRole from "../../entity/[id]/_components/roles/SingleRole";
import DeleteEntity from "./DeleteEntity";

type Row = {
  handle?: string | null;
  spectrumId: string;
  discordId?: string | null;
  teamspeakId?: string | null;
  createdAt: Date;
  lastSeenAt?: Date | null;
  entity: Entity & {
    logs: (EntityLog & {
      attributes: (EntityLogAttribute & { createdBy: User })[];
      submittedBy: User;
    })[];
  };
  roles: Role[];
};

interface Props {
  rows: Row[];
  assignableRoles: Role[];
  showDiscordIdColumn?: boolean;
  showTeamspeakIdColumn?: boolean;
  showLastSeenAtColumn?: boolean;
  showUpdateRolesButton?: boolean;
  showDeleteEntityButton?: boolean;
  searchParams: URLSearchParams;
}

const Table = ({
  rows,
  assignableRoles,
  showDiscordIdColumn = false,
  showTeamspeakIdColumn = false,
  showLastSeenAtColumn = false,
  showUpdateRolesButton = false,
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
    <table className="w-full min-w-[1600px]">
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

          <th>Spectrum ID</th>

          {showDiscordIdColumn && <th>Discord ID</th>}

          {showTeamspeakIdColumn && <th>TeamSpeak ID</th>}

          <th>Rollen</th>

          <th>
            <Link
              href={`?${createdAtSearchParams.toString()}`}
              prefetch={false}
              className="flex items-center gap-2 cursor-pointer select-none hover:text-neutral-300"
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
                className="flex items-center gap-2 cursor-pointer select-none hover:text-neutral-300"
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
              <td className="overflow-hidden text-ellipsis whitespace-nowrap flex gap-4 items-center">
                {row.handle || (
                  <span className="text-neutral-500 italic">Unbekannt</span>
                )}
                <Handles entity={row.entity} />
              </td>

              <td className="overflow-hidden text-ellipsis whitespace-nowrap flex gap-4 items-center">
                {row.spectrumId}
              </td>

              {showDiscordIdColumn && (
                <td className="overflow-hidden text-ellipsis whitespace-nowrap flex gap-4 items-center">
                  {row.discordId || (
                    <span className="text-neutral-500 italic">Unbekannt</span>
                  )}
                  <HistoryModal
                    type="discordId"
                    permissionResource="discordId"
                    entity={row.entity}
                    logs={row.entity.logs.filter(
                      (log) => log.type === "discordId",
                    )}
                  />
                </td>
              )}

              {showTeamspeakIdColumn && (
                <td className="overflow-hidden text-ellipsis whitespace-nowrap flex gap-4 items-center">
                  {row.teamspeakId || (
                    <span className="text-neutral-500 italic">Unbekannt</span>
                  )}
                  <HistoryModal
                    type="teamspeakId"
                    permissionResource="teamspeakId"
                    entity={row.entity}
                    logs={row.entity.logs.filter(
                      (log) => log.type === "teamspeakId",
                    )}
                  />
                </td>
              )}

              <td className="overflow-hidden text-ellipsis whitespace-nowrap flex gap-4 items-center">
                {row.roles.length > 0 ? (
                  <div className="flex gap-2">
                    {row.roles.map((role) => (
                      <SingleRole key={role.id} role={role} />
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-500 italic">Keine</p>
                )}

                {showUpdateRolesButton && (
                  <AddRoles
                    entity={row.entity}
                    allRoles={assignableRoles}
                    assignedRoleIds={row.roles.map((role) => role.id)}
                  />
                )}
              </td>

              <td className="overflow-hidden text-ellipsis whitespace-nowrap flex gap-4 items-center">
                {row.createdAt?.toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </td>

              {showLastSeenAtColumn && (
                <td className="overflow-hidden text-ellipsis whitespace-nowrap flex gap-4 items-center">
                  {row.lastSeenAt?.toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
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
