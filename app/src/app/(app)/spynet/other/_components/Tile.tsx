import { requireAuthentication } from "~/_lib/auth/authenticateAndAuthorize";
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
import Table, { type Row } from "./Table";
import isAllowedToRead from "./isAllowedToRead";

interface Props {
  searchParams: URLSearchParams;
}

const Tile = async ({ searchParams }: Readonly<Props>) => {
  const authentication = await requireAuthentication();

  const currentPage = getCurrentPageFromSearchParams(searchParams);

  const entityLogs = await prisma.entityLog.findMany({
    where: {
      type: {
        in: [
          "handle",
          "discord-id",
          "teamspeak-id",
          "community-moniker",
          "citizen-id",
        ],
      },
    },
    include: {
      entity: true,
      attributes: {
        where: {
          key: "confirmed",
        },
        include: {
          createdBy: true,
        },
      },
      submittedBy: true,
    },
  });

  const rows = entityLogs.map((entityLog): Row => {
    const confirmed = entityLog.attributes.find(
      (attribute) => attribute.key === "confirmed",
    );

    return {
      entity: entityLog.entity,
      confirmationState: confirmed?.value,
      confirmedAt: confirmed?.createdAt,
      confirmedBy: confirmed?.createdBy,
      entityLog,
    };
  });

  const authenticatedRows = rows.filter((row) => {
    return isAllowedToRead(row.entityLog, authentication);
  });

  const filters = searchParams.get("filters")?.split(",");
  const filteredRows = authenticatedRows.filter((row) => {
    if (!filters) return true;

    let confirmation;
    if (filters.some((filter) => filter.startsWith("confirmation-"))) {
      if (
        (filters.includes("confirmation-unconfirmed") &&
          !row.confirmationState) ||
        (filters.includes("confirmation-confirmed") &&
          row.confirmationState === "confirmed") ||
        (filters.includes("confirmation-false-report") &&
          row.confirmationState === "false-report")
      ) {
        confirmation = true;
      } else {
        confirmation = false;
      }
    } else {
      confirmation = true;
    }

    let type;
    if (filters.some((filter) => filter.startsWith("type-"))) {
      if (filters.includes(`type-${row.entityLog.type}`)) {
        type = true;
      } else {
        type = false;
      }
    } else {
      type = true;
    }

    return confirmation && type;
  });

  const sortedRows = filteredRows.sort((a, b) => {
    switch (searchParams.get("sort")) {
      case "confirmed-at-asc":
        return sortAscWithAndNullLast(
          a.confirmedAt?.getTime(),
          b.confirmedAt?.getTime(),
        );
      case "confirmed-at-desc":
        return sortDescAndNullLast(
          a.confirmedAt?.getTime(),
          b.confirmedAt?.getTime(),
        );

      case "created-at-asc":
        return sortAscWithAndNullLast(
          a.entityLog.createdAt.getTime(),
          b.entityLog.createdAt.getTime(),
        );

      default:
        return sortDescAndNullLast(
          a.entityLog.createdAt.getTime(),
          b.entityLog.createdAt.getTime(),
        );
    }
  });

  const limitedRows = limitRows(sortedRows, currentPage);

  return (
    <section className="p-8 pb-10 bg-neutral-800/50 backdrop-blur mt-4 rounded-2xl overflow-auto">
      <div className="mb-8">
        <Filters rows={authenticatedRows} />
      </div>

      <Table rows={limitedRows} searchParams={searchParams} />

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
