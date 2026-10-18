import type { Prisma } from "@sam-monorepo/database/client";
import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";

export enum UserSort {
  CreatedAtDesc = "createdAt-desc",
  CreatedAtAsc = "createdAt-asc",
  EmailVerifiedDesc = "emailVerified-desc",
  EmailVerifiedAsc = "emailVerified-asc",
  NameAsc = "name-asc",
  NameDesc = "name-desc",
}

export enum UserBanStatus {
  All = "all",
  Banned = "banned",
  Active = "active",
}

const USERS_PAGE_SIZE = 50;

/** Longer than any handle; the search comes from the URL */
const MAX_HANDLE_QUERY_LENGTH = 100;

/** The largest offset that the database accepts (32-bit integer) */
const MAX_OFFSET = 2_147_483_647;

const USER_LIST_SELECT = {
  id: true,
  name: true,
  image: true,
  createdAt: true,
  emailVerified: true,
  bannedAt: true,
  bannedReason: true,
  role: true,
  bannedBy: {
    select: {
      id: true,
      handle: true,
      deletedAt: true,
    },
  },
  accounts: {
    select: {
      providerAccountId: true,
    },
    take: 1,
  },
  citizen: {
    select: {
      id: true,
    },
  },
} as const satisfies Prisma.UserSelect;

type UserListRow = Prisma.UserGetPayload<{ select: typeof USER_LIST_SELECT }>;

export interface UserListInput {
  readonly sort: UserSort;
  readonly banStatus: UserBanStatus;
  readonly handleQuery: string | null;
  /** The `nextCursor` or the `prevCursor` of a page */
  readonly cursor: string | null;
}

export interface UserListEntry {
  readonly user: Omit<UserListRow, "accounts" | "citizen">;
  readonly discordId: string | null;
  readonly entity: { readonly id: string } | undefined;
}

export interface UserListPage {
  readonly users: UserListEntry[];
  readonly nextCursor: string | null;
  readonly prevCursor: string | null;
}

const getOrderBy = (sort: UserSort): Prisma.UserOrderByWithRelationInput[] => {
  switch (sort) {
    case UserSort.CreatedAtDesc:
      return [{ createdAt: { sort: "desc", nulls: "last" } }, { id: "desc" }];

    case UserSort.CreatedAtAsc:
      return [{ createdAt: { sort: "asc", nulls: "last" } }, { id: "asc" }];

    case UserSort.EmailVerifiedDesc:
      return [
        { emailVerified: { sort: "desc", nulls: "last" } },
        { id: "desc" },
      ];

    case UserSort.EmailVerifiedAsc:
      return [{ emailVerified: { sort: "asc", nulls: "last" } }, { id: "asc" }];

    case UserSort.NameAsc:
      return [{ name: { sort: "asc", nulls: "last" } }, { id: "asc" }];

    case UserSort.NameDesc:
      return [{ name: { sort: "desc", nulls: "last" } }, { id: "desc" }];

    default:
      throw new Error(`Unknown sort: ${sort satisfies never}`);
  }
};

const getBanStatusWhere = (banStatus: UserBanStatus): Prisma.UserWhereInput => {
  switch (banStatus) {
    case UserBanStatus.All:
      return {};

    case UserBanStatus.Banned:
      return { bannedAt: { not: null } };

    case UserBanStatus.Active:
      return { bannedAt: null };

    default:
      throw new Error(`Unknown ban status: ${banStatus satisfies never}`);
  }
};

/** The handle belongs to the citizen of the user */
const getHandleWhere = (handleQuery: string): Prisma.UserWhereInput => ({
  citizen: {
    handle: { contains: handleQuery, mode: "insensitive" },
  },
});

/**
 * The cursor of the user list is the offset of the first row of the page.
 * Unlike a keyset cursor, an offset works with each sort order without
 * additional conditions for the null values of the nullable sort columns.
 * The list is small, thus the database skips the rows before the offset
 * quickly. Cursors come from the URL, thus a malformed one gives the first
 * page.
 */
const parseOffset = (cursor: string | null) => {
  const offset = Number(cursor);
  return Number.isSafeInteger(offset) && offset > 0 && offset <= MAX_OFFSET
    ? offset
    : 0;
};

/**
 * The rows of one page of the user list of the app, with the filters, the
 * order and the offset cursor. Requires `user;read`.
 */
export const findUserListPage = async (
  context: ApplicationContext,
  actor: Actor,
  { sort, banStatus, handleQuery, cursor }: UserListInput,
): Promise<UserListPage> => {
  requirePermission(actor, "user", "read");

  const offset = parseOffset(cursor);

  const rows = await context.prisma.user.findMany({
    where: {
      ...getBanStatusWhere(banStatus),
      ...(handleQuery
        ? getHandleWhere(handleQuery.slice(0, MAX_HANDLE_QUERY_LENGTH))
        : {}),
    },
    orderBy: getOrderBy(sort),
    skip: offset,
    take: USERS_PAGE_SIZE + 1,
    select: USER_LIST_SELECT,
  });

  const hasNextPage = rows.length > USERS_PAGE_SIZE;
  const pageRows = rows.slice(0, USERS_PAGE_SIZE);

  const users = pageRows.map(({ accounts, citizen, ...user }) => ({
    user,
    discordId: accounts[0]?.providerAccountId ?? null,
    entity: citizen ?? undefined,
  }));

  return {
    users,
    nextCursor: hasNextPage ? String(offset + USERS_PAGE_SIZE) : null,
    prevCursor:
      offset > 0 ? String(Math.max(0, offset - USERS_PAGE_SIZE)) : null,
  };
};
