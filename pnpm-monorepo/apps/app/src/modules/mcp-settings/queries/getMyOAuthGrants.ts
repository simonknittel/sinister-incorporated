import { getApplicationContext, toActor } from "@/modules/application";
import { requireAuthentication } from "@/modules/auth/server";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { listOwnGrants } from "@sam-monorepo/application";
import { forbidden } from "next/navigation";
import { cache } from "react";

export const getMyOAuthGrants = cache(
  withTrace("getMyOAuthGrants", async () => {
    const authentication = await requireAuthentication();
    // Only the user sees the own clients, not an admin who assumes the user
    if (authentication.session.assumedByAdminId) forbidden();

    return listOwnGrants(
      getApplicationContext(),
      await toActor(authentication.session),
    );
  }),
);
