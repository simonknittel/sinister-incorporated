import { authenticate } from "~/app/_lib/auth/authenticateAndAuthorize";
import getAssignableRoles from "~/app/_lib/getAssignableRoles";
import getAssignedAndVisibleRoles from "~/app/_lib/getAssignedAndVisibleRoles";
import { getLatestConfirmedCitizenAttributes } from "~/app/_lib/getLatestConfirmedCitizenAttributes";
import { prisma } from "~/server/db";
import Pagination from "../../_components/Pagination";
import Filters from "./Filters";
import Table from "./Table";

interface Props {
  searchParams: URLSearchParams;
}

const Tile = async ({ searchParams }: Props) => {
  const authentication = await authenticate();

  const currentPage = getCurrentPageFromSearchParams(searchParams);
  const perPage = 50;

  const entities = await prisma.entity.findMany({
    include: {
      logs: {
        where: {
          type: {
            in: [
              "spectrum-id",
              "handle",
              "discordId",
              "teamspeakId",
              "role-added",
              "role-removed",
            ],
          },
        },
        include: {
          attributes: {
            where: {
              key: "confirmed",
            },
            include: {
              createdBy: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
          submittedBy: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  const rows = await Promise.all(
    entities.map(async (entity) => ({
      ...(await getLatestConfirmedCitizenAttributes(entity)),
      roles: await getAssignedAndVisibleRoles(entity),
      entity,
    })),
  );

  const filters = searchParams.get("filters")?.split(",");
  const filteredRows = rows.filter((row) => {
    if (!filters) return true;

    let unknown;
    if (filters.some((filter) => filter.startsWith("unknown-"))) {
      if (
        (filters.includes("unknown-handle") && !row.handle) ||
        (filters.includes("unknown-discord-id") && !row.discordId) ||
        (filters.includes("unknown-teamspeak-id") && !row.teamspeakId)
      ) {
        unknown = true;
      } else {
        unknown = false;
      }
    } else {
      unknown = true;
    }

    let role;
    if (filters.some((filter) => filter.startsWith("role-"))) {
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
        return sortAsc(a.handle, b.handle);
      case "handle-desc":
        return sortDesc(a.handle, b.handle);

      case "last-seen-at-asc":
        return sortAsc(a.lastSeenAt?.getTime(), b.lastSeenAt?.getTime());
      case "last-seen-at-desc":
        return sortDesc(a.lastSeenAt?.getTime(), b.lastSeenAt?.getTime());

      case "created-at-asc":
        return sortAsc(
          a.entity.createdAt.getTime(),
          b.entity.createdAt.getTime(),
        );

      default:
        return sortDesc(
          a.entity.createdAt.getTime(),
          b.entity.createdAt.getTime(),
        );
    }
  });

  const limitedRows = sortedRows.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  const assignableRoles = await getAssignableRoles();

  const showLastSeenAtColumn =
    authentication &&
    authentication.authorize([
      {
        resource: "lastSeen",
        operation: "read",
      },
    ]);

  const showUpdateRolesButton =
    authentication &&
    (authentication.authorize([
      {
        resource: "otherRole",
        operation: "assign",
      },
    ]) ||
      authentication.authorize([
        {
          resource: "otherRole",
          operation: "dismiss",
        },
      ]));

  const showDeleteEntityButton =
    authentication &&
    authentication.authorize([
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
        showLastSeenAtColumn={showLastSeenAtColumn}
        showUpdateRolesButton={showUpdateRolesButton}
        showDeleteEntityButton={showDeleteEntityButton}
        searchParams={searchParams}
      />

      <div className="flex justify-center mt-8">
        <Pagination
          totalPages={Math.ceil(entities.length / perPage)}
          currentPage={currentPage}
          searchParams={searchParams}
        />
      </div>
    </section>
  );
};

export default Tile;

function getCurrentPageFromSearchParams(searchParams: URLSearchParams) {
  const currentPage = parseInt(searchParams.get("page") || "1");
  return isNaN(currentPage) ? 1 : currentPage;
}

function sortAsc(a?: string | number | null, b?: string | number | null) {
  if (!a && !b) {
    return 0;
  } else if (!a) {
    return 1;
  } else if (!b) {
    return -1;
  } else {
    if (typeof a === "number" && typeof b === "number") {
      return a - b;
    } else if (typeof a === "string" && typeof b === "string") {
      return a.localeCompare(b);
    }

    return 0;
  }
}

function sortDesc(a?: string | number | null, b?: string | number | null) {
  if (!a && !b) {
    return 0;
  } else if (!a) {
    return 1;
  } else if (!b) {
    return -1;
  } else {
    if (typeof a === "number" && typeof b === "number") {
      return b - a;
    } else if (typeof a === "string" && typeof b === "string") {
      return b.localeCompare(a);
    }

    return 0;
  }
}
