import { prisma } from "@/db";
import { getApplicationContext, toActor } from "@/modules/application";
import type { requireAuthentication } from "@/modules/auth/server";
import { getFilterValues } from "@/modules/common/utils/filterCheckboxListParsers";
import { PER_PAGE } from "@/modules/common/utils/pagination";
import {
  getReadableCitizenLogWhere as getReadableCitizenLogWhereOfActor,
  type CitizenLogTableType,
} from "@sam-monorepo/application";
import type { Prisma } from "@sam-monorepo/database/client";
import {
  ConfirmationValue,
  toConfirmationStatus,
} from "../utils/citizenLogConfirmation";
import { CitizenLogTableSort } from "../utils/citizenLogTableSearchParams";
import { CITIZEN_LOG_TABLE_SELECT } from "./citizenLogTableSelect";

type Authentication = Awaited<ReturnType<typeof requireAuthentication>>;

export type { CitizenLogTableType } from "@sam-monorepo/application";

/**
 * The logs of the given types that the viewer may read in the Spynet tables.
 * The rule lives in the application package.
 */
export const getReadableCitizenLogWhere = async (
  types: readonly CitizenLogTableType[],
  authentication: Pick<Authentication, "session">,
) =>
  getReadableCitizenLogWhereOfActor(
    getApplicationContext(),
    await toActor(authentication.session),
    types,
  );

const isConfirmationValue = (value: string): value is ConfirmationValue =>
  Object.values<string>(ConfirmationValue).includes(value);

/**
 * The confirmation filters of the tables ("confirmation-confirmed", …) as a
 * condition. Undefined without such a filter.
 */
export const getConfirmationFilterWhere = (
  filters: readonly string[],
): Prisma.CitizenLogWhereInput | undefined => {
  const values = getFilterValues(filters, "confirmation");
  if (values.length === 0) return undefined;

  /**
   * An unknown value adds no condition, thus only unknown values give an
   * empty OR, which matches no log
   */
  return {
    OR: values
      .filter(isConfirmationValue)
      .map((value) => ({ confirmed: toConfirmationStatus(value) })),
  };
};

const getOrderBy = (
  sort: CitizenLogTableSort,
): Prisma.CitizenLogOrderByWithRelationInput[] => {
  switch (sort) {
    case CitizenLogTableSort.ConfirmedAtAscending:
      return [
        { confirmedAt: { sort: "asc", nulls: "last" } },
        { createdAt: "asc" },
        { id: "asc" },
      ];
    case CitizenLogTableSort.ConfirmedAtDescending:
      return [
        { confirmedAt: { sort: "desc", nulls: "last" } },
        { createdAt: "desc" },
        { id: "desc" },
      ];
    case CitizenLogTableSort.CreatedAtAscending:
      return [{ createdAt: "asc" }, { id: "asc" }];
    case CitizenLogTableSort.CreatedAtDescending:
      return [{ createdAt: "desc" }, { id: "desc" }];
    default:
      throw new Error(`Unknown sort: ${sort satisfies never}`);
  }
};

/** One page of a Spynet log table, filtered and sorted in the database */
export const getCitizenLogTablePage = async (
  where: Prisma.CitizenLogWhereInput,
  sort: CitizenLogTableSort,
  page: number,
) => {
  const [logs, count] = await prisma.$transaction([
    prisma.citizenLog.findMany({
      where,
      orderBy: getOrderBy(sort),
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: CITIZEN_LOG_TABLE_SELECT,
    }),
    prisma.citizenLog.count({ where }),
  ]);

  return { logs, totalPages: Math.ceil(count / PER_PAGE) };
};
