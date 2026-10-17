import type { Prisma } from "@sam-monorepo/database/client";

/**
 * The penalty entries that still count against a citizen: not deleted and
 * not expired. An entry without an expiry date never expires. Each list and
 * each sum of penalty points uses this rule.
 */
export const buildActivePenaltyEntryWhere = (
  now: Date,
): Prisma.PenaltyEntryWhereInput => ({
  deletedAt: null,
  OR: [{ expiresAt: { gte: now } }, { expiresAt: null }],
});
