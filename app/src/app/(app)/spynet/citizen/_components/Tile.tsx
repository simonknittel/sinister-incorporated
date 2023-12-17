import { requireAuthentication } from "~/_lib/auth/authenticateAndAuthorize";
import { getAssignableRoles } from "~/app/_lib/getAssignableRoles";
import { getAssignedAndVisibleRoles } from "~/app/_lib/getAssignedAndVisibleRoles";
import { getLastSeenAt } from "~/app/_lib/getLastSeenAt";
import { prisma } from "~/server/db";
import Pagination from "../../_components/Pagination";
import {
  PER_PAGE,
  getCurrentPageFromSearchParams,
  limitRows,
} from "../../_lib/pagination";
import {
  sortAscWithAndNullLast,
  sortDescAndNullLast,
} from "../../_lib/sorting";
import Filters from "./Filters";
import Table from "./Table";

interface Props {
  searchParams: URLSearchParams;
}

const Tile = async ({ searchParams }: Readonly<Props>) => {
  const authentication = await requireAuthentication();

  const currentPage = getCurrentPageFromSearchParams(searchParams);

  const entities = await prisma.entity.findMany();

  const filters = searchParams.get("filters")?.split(",");

  const rows = await Promise.all(
    entities.map(async (entity) => ({
      lastSeenAt: ["last-seen-at-asc", "last-seen-at-desc"].includes(
        searchParams.get("sort") || "",
      )
        ? await getLastSeenAt(entity)
        : undefined,
      roles: filters?.some((filter) => filter.startsWith("role-"))
        ? await getAssignedAndVisibleRoles(entity)
        : undefined,
      entity,
    })),
  );

  const filteredRows = rows.filter((row) => {
    if (!filters) return true;

    let unknown;
    if (filters.some((filter) => filter.startsWith("unknown-"))) {
      if (
        (filters.includes("unknown-handle") && !row.entity.handle) ||
        (filters.includes("unknown-discord-id") && !row.entity.discordId) ||
        (filters.includes("unknown-teamspeak-id") && !row.entity.teamspeakId)
      ) {
        unknown = true;
      } else {
        unknown = false;
      }
    } else {
      unknown = true;
    }

    let role;
    if (filters.some((filter) => filter.startsWith("role-")) && row.roles) {
      for (const filter of filters) {
        if (!filter.startsWith("role-")) continue;
        const roleId = filter.replace("role-", "");
        const hasRole = row.roles.map((role) => role.id).includes(roleId);
        if (hasRole) role = true;
      }

      if (!role) role = false;
    } else {
      role = true;
    }

    return unknown && role;
  });

  const sortedRows = filteredRows.sort((a, b) => {
    switch (searchParams.get("sort")) {
      case "handle-asc":
        return sortAscWithAndNullLast(a.entity.handle, b.entity.handle);
      case "handle-desc":
        return sortDescAndNullLast(a.entity.handle, b.entity.handle);

      case "last-seen-at-asc":
        return sortAscWithAndNullLast(
          a.lastSeenAt?.getTime(),
          b.lastSeenAt?.getTime(),
        );
      case "last-seen-at-desc":
        return sortDescAndNullLast(
          a.lastSeenAt?.getTime(),
          b.lastSeenAt?.getTime(),
        );

      case "created-at-asc":
        return sortAscWithAndNullLast(
          a.entity.createdAt.getTime(),
          b.entity.createdAt.getTime(),
        );

      default:
        return sortDescAndNullLast(
          a.entity.createdAt.getTime(),
          b.entity.createdAt.getTime(),
        );
    }
  });

  const limitedRows = limitRows(sortedRows, currentPage);

  const assignableRoles = await getAssignableRoles();

  const showLastSeenAtColumn = authentication.authorize([
    {
      resource: "lastSeen",
      operation: "read",
    },
  ]);

  const showTeamspeakIdAtColumn = authentication.authorize([
    {
      resource: "teamspeak-id",
      operation: "read",
    },
  ]);

  const showDiscordIdAtColumn = authentication.authorize([
    {
      resource: "discord-id",
      operation: "read",
    },
  ]);

  const showDeleteEntityButton = authentication.authorize([
    {
      resource: "citizen",
      operation: "delete",
    },
  ]);

  return (
    <section className="p-8 pb-10 bg-neutral-900 mt-4 rounded overflow-auto">
      <div className="mb-8">
        <Filters />
      </div>

      <Table
        rows={limitedRows}
        assignableRoles={assignableRoles}
        showDiscordIdColumn={showDiscordIdAtColumn}
        showTeamspeakIdColumn={showTeamspeakIdAtColumn}
        showLastSeenAtColumn={showLastSeenAtColumn}
        showDeleteEntityButton={showDeleteEntityButton}
        searchParams={searchParams}
      />

      <div className="flex justify-center mt-8">
        <Pagination
          totalPages={Math.ceil(sortedRows.length / PER_PAGE)}
          currentPage={currentPage}
          searchParams={searchParams}
        />
      </div>
    </section>
  );
};

export default Tile;
