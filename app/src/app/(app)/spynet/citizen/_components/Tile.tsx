import { authenticate } from "~/app/_lib/auth/authenticateAndAuthorize";
import getAssignableRoles from "~/app/_lib/getAssignableRoles";
import getLatestConfirmedCitizenAttributes from "~/app/_lib/getLatestConfirmedCitizenAttributes";
import getRoles from "~/app/_lib/getRoles";
import { prisma } from "~/server/db";
import Pagination from "./Pagination";
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
        include: {
          attributes: {
            include: {
              createdBy: true,
            },
            orderBy: {
              createdAt: "desc",
            },
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
    entities.map(async (entity) => {
      return {
        ...(await getLatestConfirmedCitizenAttributes(entity)),
        roles: await getRoles(entity),
        entity,
      };
    })
  );

  const sortedRows = rows.sort((a, b) => {
    switch (searchParams.get("sort")) {
      case "handle-asc":
        return sortAsc(a.handle, b.handle);
      case "handle-desc":
        return sortDesc(a.handle, b.handle);

      case "spectrum-id-asc":
        return sortAsc(a.spectrumId, b.spectrumId);
      case "spectrum-id-desc":
        return sortDesc(a.spectrumId, b.spectrumId);

      case "discord-id-asc":
        return sortAsc(a.discordId, b.discordId);
      case "discord-id-desc":
        return sortDesc(a.discordId, b.discordId);

      case "teamspeak-id-asc":
        return sortAsc(a.teamspeakId, b.teamspeakId);
      case "teamspeak-id-desc":
        return sortDesc(a.teamspeakId, b.teamspeakId);

      case "last-seen-at-asc":
        return sortAsc(a.lastSeenAt?.getTime(), b.lastSeenAt?.getTime());
      case "last-seen-at-desc":
        return sortDesc(a.lastSeenAt?.getTime(), b.lastSeenAt?.getTime());

      case "created-at-asc":
        return sortAsc(
          a.entity.createdAt.getTime(),
          b.entity.createdAt.getTime()
        );

      default:
        return sortDesc(
          a.entity.createdAt.getTime(),
          b.entity.createdAt.getTime()
        );
    }
  });

  const limitedRows = sortedRows.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
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
    return -1;
  } else if (!b) {
    return 1;
  } else {
    if (typeof a === "number" && typeof b === "number") {
      return b - a;
    } else if (typeof a === "string" && typeof b === "string") {
      return b.localeCompare(a);
    }

    return 0;
  }
}
