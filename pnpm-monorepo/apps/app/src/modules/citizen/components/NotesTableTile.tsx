import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { loadCitizenLogTableSearchParams } from "@/modules/citizen/utils/citizenLogTableSearchParams";
import { getFilterValues } from "@/modules/common/utils/filterCheckboxListParsers";
import { PER_PAGE } from "@/modules/common/utils/pagination";
import { getAllClassificationLevels } from "@/modules/spynet/queries/getAllClassificationLevels";
import { getAllNoteTypes } from "@/modules/spynet/queries/getAllNoteTypes";
import { findNoteTablePage } from "@sam-monorepo/application";
import clsx from "clsx";
import type { SearchParams } from "nuqs/server";
import { CitizenLogTablePagination } from "./CitizenLogTableLinks";
import { NotesTable } from "./NotesTable";
import { NotesTableFilters } from "./NotesTableFilters";

interface Props {
  readonly className?: string;
  readonly searchParams: Promise<SearchParams>;
}

const loadNotesTable = async (searchParams: Promise<SearchParams>) => {
  const { filters, sort, page } =
    await loadCitizenLogTableSearchParams(searchParams);

  try {
    return await Promise.all([
      findNoteTablePage(
        getApplicationContext(),
        await getRequestActor(),
        {
          filters: {
            noteTypeIds: getFilterValues(filters, "note-type"),
            classificationLevelIds: getFilterValues(
              filters,
              "classification-level",
            ),
            confirmationValues: getFilterValues(filters, "confirmation"),
          },
          sort,
          page,
        },
        { pageSize: PER_PAGE },
      ),
      getAllNoteTypes(),
      getAllClassificationLevels(),
    ]);
  } catch (error) {
    return throwApplicationErrorForPage(error);
  }
};

export const NotesTableTile = async ({ className, searchParams }: Props) => {
  const [{ rows, totalPages, options }, noteTypes, classificationLevels] =
    await loadNotesTable(searchParams);

  const optionNoteTypeIds = new Set(options.noteTypeIds);
  const optionClassificationLevelIds = new Set(options.classificationLevelIds);

  return (
    <section
      className={clsx(
        "overflow-auto rounded-primary bg-neutral-800/50 p-6",
        className,
      )}
    >
      <div className="mb-6">
        <NotesTableFilters
          noteTypes={noteTypes.filter((noteType) =>
            optionNoteTypeIds.has(noteType.id),
          )}
          classificationLevels={classificationLevels.filter(
            (classificationLevel) =>
              optionClassificationLevelIds.has(classificationLevel.id),
          )}
          confirmationStates={options.confirmationStates}
        />
      </div>

      <NotesTable rows={rows} />

      <div className="mt-6 flex justify-center">
        <CitizenLogTablePagination totalPages={totalPages} />
      </div>
    </section>
  );
};
