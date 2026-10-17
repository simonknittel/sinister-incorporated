import { getApplicationContext, getRequestActor } from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { listOwnGrants } from "@sam-monorepo/application";
import { cache } from "react";

export const getMyOAuthGrants = cache(
  withTrace("getMyOAuthGrants", async () => {
    return listOwnGrants(getApplicationContext(), await getRequestActor());
  }),
);
