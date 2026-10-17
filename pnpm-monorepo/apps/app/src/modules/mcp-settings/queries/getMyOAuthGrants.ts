import { getApplicationContext, toActor } from "@/modules/application";
import { requireAuthentication } from "@/modules/auth/server";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { listOwnGrants } from "@sam-monorepo/application";
import { cache } from "react";

export const getMyOAuthGrants = cache(
  withTrace("getMyOAuthGrants", async () => {
    const authentication = await requireAuthentication();

    return listOwnGrants(
      getApplicationContext(),
      await toActor(authentication.session),
    );
  }),
);
