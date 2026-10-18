import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { loadCitizenLogTableSearchParams } from "@/modules/citizen/utils/citizenLogTableSearchParams";
import { getFilterValues } from "@/modules/common/utils/filterCheckboxListParsers";
import { PER_PAGE } from "@/modules/common/utils/pagination";
import { findIdentityLogTablePage } from "@sam-monorepo/application";
import clsx from "clsx";
import type { SearchParams } from "nuqs/server";
import { CitizenLogTablePagination } from "./CitizenLogTableLinks";
import { OtherFilters } from "./OtherFilters";
import { OtherTable } from "./OtherTable";

interface Props {
  readonly className?: string;
  readonly searchParams: Promise<SearchParams>;
}

const loadOtherTable = async (searchParams: Promise<SearchParams>) => {
  const { filters, sort, page } =
    await loadCitizenLogTableSearchParams(searchParams);

  try {
    return await findIdentityLogTablePage(
      getApplicationContext(),
      await getRequestActor(),
      {
        filters: {
          types: getFilterValues(filters, "type"),
          confirmationValues: getFilterValues(filters, "confirmation"),
        },
        sort,
        page,
      },
      { pageSize: PER_PAGE },
    );
  } catch (error) {
    return throwApplicationErrorForPage(error);
  }
};

const OtherTableTile = async ({ className, searchParams }: Props) => {
  const { rows, totalPages, options } = await loadOtherTable(searchParams);

  return (
    <section
      className={clsx(
        "overflow-auto rounded-primary bg-neutral-800/50 p-6",
        className,
      )}
    >
      <div className="mb-6">
        <OtherFilters
          confirmationStates={options.confirmationStates}
          types={options.types}
        />
      </div>

      <OtherTable rows={rows} />

      <div className="mt-6 flex justify-center">
        <CitizenLogTablePagination totalPages={totalPages} />
      </div>
    </section>
  );
};

export default OtherTableTile;
