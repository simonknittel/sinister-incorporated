import type { Prisma } from "@sam-monorepo/database/client";

/**
 * The users an admin can assume: users with a login account, thus users
 * that can sign in. The session reads the user by its id and does not need
 * the account.
 */
export const ASSUMABLE_USER_WHERE = {
  accounts: {
    some: {},
  },
} satisfies Prisma.UserWhereInput;
