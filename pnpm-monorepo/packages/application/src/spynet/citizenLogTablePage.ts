import type { Prisma } from "@sam-monorepo/database/client";
import {
  CitizenLogTableSort,
  ConfirmationValue,
  toConfirmationStatus,
} from "@sam-monorepo/domain";
import { CITIZEN_REFERENCE_SELECT } from "../citizenReference.js";
import type { ApplicationContext } from "../context.js";

/**
 * One log row of the note and identity tables. Both tables serialize their
 * rows into client components, thus the citizen is joined as {id, handle}
 * and the authors by name alone. A full `User` row here would put the email
 * address of each user in a browser payload: the global `omit` covers the
 * OAuth tokens, not the email.
 */
export const CITIZEN_LOG_TABLE_SELECT = {
  id: true,
  citizenId: true,
  type: true,
  content: true,
  createdAt: true,
  confirmed: true,
  confirmedAt: true,
  confirmedBy: { select: { name: true } },
  noteTypeId: true,
  noteType: { select: { id: true, name: true } },
  classificationLevelId: true,
  classificationLevel: { select: { id: true, name: true } },
  citizen: { select: CITIZEN_REFERENCE_SELECT },
  submittedBy: { select: { name: true } },
} as const satisfies Prisma.CitizenLogSelect;

export type CitizenLogTableRow = Prisma.CitizenLogGetPayload<{
  select: typeof CITIZEN_LOG_TABLE_SELECT;
}>;

/** The app-only options of the Spynet log tables */
export interface CitizenLogTablePageOptions {
  readonly pageSize: number;
}

/** The sort and the page of a Spynet log table, from the URL of the app */
export interface CitizenLogTablePageRequest {
  readonly sort: CitizenLogTableSort;
  /** From 1. A page after the last one has no rows. */
  readonly page: number;
}

/** One page of a Spynet log table */
export interface CitizenLogTablePage {
  readonly rows: CitizenLogTableRow[];
  readonly totalPages: number;
}

const isConfirmationValue = (value: string): value is ConfirmationValue =>
  Object.values<string>(ConfirmationValue).includes(value);

/**
 * The confirmation filters of the tables ("confirmation-confirmed", …) as a
 * condition, from the raw values of the URL. Without a filter, the condition
 * matches each log.
 */
export const getConfirmationFilterWhere = (
  confirmationValues: readonly string[],
): Prisma.CitizenLogWhereInput => {
  if (confirmationValues.length === 0) return {};

  /**
   * An unknown value adds no condition, thus only unknown values give an
   * empty OR, which matches no log
   */
  return {
    OR: confirmationValues
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
export const loadCitizenLogTablePage = async (
  context: Pick<ApplicationContext, "prisma">,
  where: Prisma.CitizenLogWhereInput,
  { sort, page }: CitizenLogTablePageRequest,
  { pageSize }: CitizenLogTablePageOptions,
): Promise<CitizenLogTablePage> => {
  const [rows, count] = await context.prisma.$transaction([
    context.prisma.citizenLog.findMany({
      where,
      orderBy: getOrderBy(sort),
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: CITIZEN_LOG_TABLE_SELECT,
    }),
    context.prisma.citizenLog.count({ where }),
  ]);

  return { rows, totalPages: Math.ceil(count / pageSize) };
};
