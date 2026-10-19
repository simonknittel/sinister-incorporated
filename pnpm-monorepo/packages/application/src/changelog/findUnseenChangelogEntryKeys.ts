import { getLocalDateKey, ORGANIZATION_TIMEZONE } from "@sam-monorepo/domain";
import type { Actor } from "../actor.js";
import type { ApplicationContext, TrackedChangelogEntry } from "../context.js";

/**
 * Entries published before a citizen joined are not new to them, so only
 * entries of the confirmation day itself and later are tracked. Citizens
 * without a confirmed email (admins bypassing the confirmation) have no
 * cutoff and see every tracked entry as new.
 */
const findTrackedKeysSince = (
  trackedEntries: readonly TrackedChangelogEntry[],
  emailConfirmedAt: Date | null,
): string[] => {
  const cutoffDate = emailConfirmedAt
    ? getLocalDateKey(emailConfirmedAt, ORGANIZATION_TIMEZONE)
    : null;

  return trackedEntries
    .filter((entry) => !cutoffDate || entry.date >= cutoffDate)
    .map((entry) => entry.key);
};

/**
 * The keys of the tracked changelog entries that the actor did not see yet,
 * in the order of the tracked entries. Empty for an actor without a citizen,
 * and when the host has no changelog.
 */
export const findUnseenChangelogEntryKeys = async (
  context: ApplicationContext,
  actor: Actor,
): Promise<string[]> => {
  const citizenId = actor.citizen?.id;
  if (!citizenId || !context.changelog) return [];

  const trackedKeys = findTrackedKeysSince(
    context.changelog.listTrackedEntries(),
    actor.emailConfirmedAt,
  );
  if (trackedKeys.length === 0) return [];

  const seenEntries = await context.prisma.changelogEntrySeen.findMany({
    where: { citizenId, key: { in: trackedKeys } },
    select: { key: true },
  });

  const seenKeys = new Set(seenEntries.map((seenEntry) => seenEntry.key));

  return trackedKeys.filter((key) => !seenKeys.has(key));
};
