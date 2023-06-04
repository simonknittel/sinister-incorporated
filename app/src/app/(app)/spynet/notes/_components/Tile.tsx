import { authenticate } from "~/app/_lib/auth/authenticateAndAuthorize";
import getAllClassificationLevels from "~/app/_lib/cached/getAllClassificationLevels";
import getAllNoteTypes from "~/app/_lib/cached/getAllNoteTypes";
import getLatestNoteAttributes from "~/app/_lib/getLatestNoteAttributes";
import { prisma } from "~/server/db";
import Pagination from "../../_components/Pagination";
import Filters from "./Filters";
import Table, { type Row } from "./Table";

interface Props {
  searchParams: URLSearchParams;
}

const Tile = async ({ searchParams }: Props) => {
  const authentication = await authenticate();

  const currentPage = getCurrentPageFromSearchParams(searchParams);
  const perPage = 50;

  const [entityLogs, noteTypes, classificationLevels] = await Promise.all([
    prisma.entityLog.findMany({
      where: {
        type: "note",
      },
      include: {
        entity: true,
        attributes: {
          where: {
            key: "confirmed",
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    }),

    getAllNoteTypes(),
    getAllClassificationLevels(),
  ]);

  const rows: Row[] = await Promise.all(
    entityLogs.map((entityLog) => ({
      ...getLatestNoteAttributes(entityLog),
      entityLog,
    }))
  );

  const filters = searchParams.get("filters")?.split(",");
  const filteredRows = rows.filter((row) => {
    if (!filters) return true;

    if (filters.includes("confirmation-unconfirmed") && row.confirmationState)
      return true;
    if (
      filters.includes("confirmation-confirmed") &&
      row.confirmationState === "confirmed"
    )
      return true;
    if (
      filters.includes("confirmation-false-report") &&
      row.confirmationState === "falseReport"
    )
      return true;

    for (const filter of filters) {
      if (!filter.startsWith("note-type-")) continue;
      const noteTypeId = filter.replace("note-type-", "");
      const hasNoteType = row.noteType.id === noteTypeId;
      if (hasNoteType) return true;
    }

    for (const filter of filters) {
      if (!filter.startsWith("classification-level-")) continue;
      const classificationLevelId = filter.replace("classification-level-", "");
      const hasClassificationLevel =
        row.classificationLevel.id === classificationLevelId;
      if (hasClassificationLevel) return true;
    }

    return false;
  });

  const sortedRows = filteredRows.sort((a, b) => {
    switch (searchParams.get("sort")) {
      case "confirmed-at-asc":
        return sortAsc(a.confirmedAt?.getTime(), b.confirmedAt?.getTime());
      case "confirmed-at-desc":
        return sortDesc(a.confirmedAt?.getTime(), b.confirmedAt?.getTime());

      case "created-at-asc":
        return sortAsc(
          a.entityLog.createdAt.getTime(),
          b.entityLog.createdAt.getTime()
        );

      default:
        return sortDesc(
          a.entityLog.createdAt.getTime(),
          b.entityLog.createdAt.getTime()
        );
    }
  });

  const limitedRows = sortedRows.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  return (
    <section className="p-8 pb-10 bg-neutral-900 mt-4 rounded overflow-auto">
      <div className="mb-8">
        <Filters />
      </div>

      <Table rows={limitedRows} searchParams={searchParams} />

      <div className="flex justify-center mt-8">
        <Pagination
          totalPages={Math.ceil(entityLogs.length / perPage)}
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
