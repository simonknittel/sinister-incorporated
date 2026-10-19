import { ReadMarkerSubject } from "@sam-monorepo/domain";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { READ_MARKER_SUBJECT_RULES } from "./readMarkerSubjects.js";
import { buildUnreadWhere } from "./unreadWhere.js";

/**
 * The number of new items of each subject type. A subject type which the
 * actor may not read counts 0, and so does each subject type for an actor
 * without a citizen.
 */
export const countNewItemsBySubject = async (
  context: ApplicationContext,
  actor: Actor,
): Promise<Record<ReadMarkerSubject, number>> => {
  const countsBySubject = await Promise.all(
    Object.values(ReadMarkerSubject).map(async (subject) => {
      const rule = READ_MARKER_SUBJECT_RULES[subject];

      if (!actor.authorize(rule.readResource, "read"))
        return { subject, count: 0 };

      const unreadWhere = buildUnreadWhere(actor, subject);
      if (!unreadWhere) return { subject, count: 0 };

      return {
        subject,
        count: await rule.countNew(context, actor, unreadWhere),
      };
    }),
  );

  const counts: Record<ReadMarkerSubject, number> = {
    [ReadMarkerSubject.Task]: 0,
    [ReadMarkerSubject.Event]: 0,
  };
  for (const { subject, count } of countsBySubject) counts[subject] = count;

  return counts;
};
