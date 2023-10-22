import { authenticate } from "~/app/_lib/auth/authenticateAndAuthorize";
import getAllClassificationLevels from "~/app/_lib/cached/getAllClassificationLevels";
import getAllNoteTypes from "~/app/_lib/cached/getAllNoteTypes";
import { getLatestConfirmedCitizenHandle } from "~/app/_lib/getLatestConfirmedCitizenAttributes";
import getLatestNoteAttributes from "~/app/_lib/getLatestNoteAttributes";
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
import isAllowedToRead from "../../entity/[id]/_components/notes/lib/isAllowedToRead";
import Filters from "./Filters";
import Table, { type Row } from "./Table";

interface Props {
  searchParams: URLSearchParams;
}

const Tile = async ({ searchParams }: Readonly<Props>) => {
  const authentication = await authenticate();

  const currentPage = getCurrentPageFromSearchParams(searchParams);

  const [entityLogs, noteTypes, classificationLevels] = await Promise.all([
    prisma.entityLog.findMany({
      where: {
        type: "note",
      },
      include: {
        entity: {
          include: {
            logs: {
              where: {
                type: {
                  in: ["handle"],
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
        },
        attributes: {
          where: {
            key: {
              in: ["noteTypeId", "classificationLevelId", "confirmed"],
            },
          },
          include: {
            createdBy: true,
          },
        },
        submittedBy: true,
      },
    }),

    getAllNoteTypes(),
    getAllClassificationLevels(),
  ]);

  const rows = entityLogs
    .filter((entityLog) => {
      const { noteTypeId, classificationLevelId } =
        getLatestNoteAttributes(entityLog);

      if (!noteTypeId || !classificationLevelId) return false;

      return (
        noteTypes.find((noteType) => noteType.id === noteTypeId.value) &&
        classificationLevels.find(
          (classificationLevel) =>
            classificationLevel.id === classificationLevelId.value,
        )
      );
    })
    .map((entityLog): Row => {
      const { noteTypeId, classificationLevelId, confirmed } =
        getLatestNoteAttributes(entityLog);

      const handle = getLatestConfirmedCitizenHandle(entityLog.entity.logs);

      return {
        entity: entityLog.entity,
        handle,
        noteType: noteTypes.find(
          (noteType) => noteType.id === noteTypeId!.value,
        )!,
        classificationLevel: classificationLevels.find(
          (classificationLevel) =>
            classificationLevel.id === classificationLevelId!.value,
        )!,
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
          row.confirmationState === "falseReport")
      ) {
        confirmation = true;
      } else {
        confirmation = false;
      }
    } else {
      confirmation = true;
    }

    let noteType;
    if (filters.some((filter) => filter.startsWith("note-type-"))) {
      for (const filter of filters) {
        if (!filter.startsWith("note-type-")) continue;
        const noteTypeId = filter.replace("note-type-", "");
        const hasNoteType = row.noteType.id === noteTypeId;
        if (hasNoteType) noteType = true;
      }

      if (!noteType) noteType = false;
    } else {
      noteType = true;
    }

    let classificationLevel;
    if (filters.some((filter) => filter.startsWith("classification-level-"))) {
      for (const filter of filters) {
        if (!filter.startsWith("classification-level-")) continue;
        const classificationLevelId = filter.replace(
          "classification-level-",
          "",
        );
        const hasClassificationLevel =
          row.classificationLevel.id === classificationLevelId;
        if (hasClassificationLevel) classificationLevel = true;
      }

      if (!classificationLevel) classificationLevel = false;
    } else {
      classificationLevel = true;
    }

    return confirmation && noteType && classificationLevel;
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
    <section className="p-8 pb-10 bg-neutral-900 mt-4 rounded overflow-auto">
      <div className="mb-8">
        <Filters rows={authenticatedRows} />
      </div>

      <Table rows={limitedRows} searchParams={searchParams} />

      <div className="flex justify-center mt-8">
        <Pagination
          totalPages={Math.ceil(entityLogs.length / PER_PAGE)}
          currentPage={currentPage}
          searchParams={searchParams}
        />
      </div>
    </section>
  );
};

export default Tile;
