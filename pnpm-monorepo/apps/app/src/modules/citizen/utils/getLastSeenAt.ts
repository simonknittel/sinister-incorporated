import { getApplicationContext, getRequestActor } from "@/modules/application";
import { getLastSeenAt as getLastSeenAtUseCase } from "@sam-monorepo/application";
import { type Citizen } from "@sam-monorepo/database/client";
import { cache } from "react";

export const getLastSeenAt = cache(async (userId: Citizen["userId"]) =>
  getLastSeenAtUseCase(getApplicationContext(), await getRequestActor(), {
    user_id: userId,
  }),
);
