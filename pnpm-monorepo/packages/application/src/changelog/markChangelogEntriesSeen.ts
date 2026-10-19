import { AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import { requireCitizen, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { ConflictError } from "../errors.js";
import { ChangelogErrorMessage } from "./changelogErrors.js";

export const markChangelogEntriesSeenInputSchema = z.object({
  keys: z
    .array(z.string().max(100))
    .min(1)
    .max(100)
    .describe("The keys of the tracked changelog entries that the actor saw."),
});

export type MarkChangelogEntriesSeenInput = z.output<
  typeof markChangelogEntriesSeenInputSchema
>;

export interface MarkChangelogEntriesSeenOutput {
  /** The entries that were not marked before. Keys that no tracked entry has do not count. */
  readonly marked_count: number;
}

/**
 * Marks a batch of tracked changelog entries as seen by the actor. The app
 * calls it from the read-on-view tracking of the changelog page, hence the
 * batch input. The keys are checked against all tracked entries, without the
 * cutoff of the actor: the changelog page observes fewer entries, thus do not
 * replace the list with the list of the page. Keys of no tracked entry are
 * ignored. The audit event only records real changes: the read-on-view
 * submits keys that the actor saw before.
 *
 * @throws ForbiddenError for a user without a citizen
 * @throws ConflictError when the host has no changelog
 */
export const markChangelogEntriesSeen = async (
  context: ApplicationContext,
  actor: Actor,
  input: MarkChangelogEntriesSeenInput,
): Promise<MarkChangelogEntriesSeenOutput> => {
  const citizenId = requireCitizen(actor).id;

  if (!context.changelog)
    throw new ConflictError(ChangelogErrorMessage.NotAvailable);

  const trackedKeys = new Set(
    context.changelog.listTrackedEntries().map((entry) => entry.key),
  );
  const keysToMark = input.keys.filter((key) => trackedKeys.has(key));
  if (keysToMark.length === 0) return { marked_count: 0 };

  const { count } = await context.prisma.changelogEntrySeen.createMany({
    data: keysToMark.map((key) => ({ citizenId, key })),
    skipDuplicates: true,
  });

  if (count > 0)
    await context.audit.create([
      {
        type: AuditEventType.CHANGELOG_ENTRIES_SEEN,
        data: { citizenId, count },
        createdById: actor.userId,
      },
    ]);

  return { marked_count: count };
};
