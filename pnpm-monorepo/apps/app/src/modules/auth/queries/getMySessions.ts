import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { listOwnSessions } from "@sam-monorepo/application";
import { cache } from "react";
import type { SessionSort, SessionStatus } from "../utils/sessionFilterParams";
import { getCurrentSessionId } from "./getCurrentSessionId";

export const getMySessions = cache(
  withTrace(
    "getMySessions",
    async (status: SessionStatus, sort: SessionSort) => {
      try {
        const [actor, currentSessionId] = await Promise.all([
          getRequestActor(),
          getCurrentSessionId(),
        ]);

        return await listOwnSessions(
          getApplicationContext(),
          actor,
          { status, sort },
          { currentSessionId },
        );
      } catch (error) {
        return throwApplicationErrorForPage(error);
      }
    },
  ),
);
