import { authenticate } from "@/modules/auth/server";
import { buildUnreadWhere, type UnreadWhere } from "@sam-monorepo/application";
import type { ReadMarkerSubject } from "@sam-monorepo/domain";
import { cache } from "react";

/**
 * The items of the subject type which are unread for the viewer, see
 * `buildUnreadWhere()`. Always combine it with the "open" predicate of the
 * subject.
 *
 * `null` when nothing can be new for the viewer, because the session has no
 * citizen.
 */
export const getUnreadWhere = cache(
  async (subject: ReadMarkerSubject): Promise<UnreadWhere | null> => {
    const authentication = await authenticate();
    if (!authentication) return null;

    return buildUnreadWhere(
      {
        citizen: authentication.session.entity,
        emailConfirmedAt: authentication.session.user.emailVerified,
      },
      subject,
    );
  },
);
