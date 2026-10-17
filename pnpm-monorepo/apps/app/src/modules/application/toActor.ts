import { isAdminModeActive } from "@/modules/auth/utils/isAdminModeActive";
import { createActor, type Actor } from "@sam-monorepo/application";
import type { Session } from "next-auth";

/**
 * Maps the session to the actor of the use cases. The session already holds
 * the permissions of an assumed user, and `isAdminModeActive()` reads the
 * cookie of the admin toolbar.
 */
export const toActor = async (session: Session): Promise<Actor> =>
  createActor({
    userId: session.user.id,
    userRole: session.user.role,
    emailConfirmedAt: session.user.emailVerified,
    citizen: session.entity
      ? { id: session.entity.id, handle: session.entity.handle }
      : null,
    permissionSets: session.givenPermissionSets,
    adminMode: await isAdminModeActive(session),
  });
