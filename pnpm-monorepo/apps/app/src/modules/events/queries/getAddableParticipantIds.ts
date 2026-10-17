import { getApplicationContext } from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  findAddableParticipantIds,
  type AddableParticipantsEvent,
} from "@sam-monorepo/application";

/** See `findAddableParticipantIds()` */
export const getAddableParticipantIds = withTrace(
  "getAddableParticipantIds",
  (event: AddableParticipantsEvent, citizenIds?: readonly string[]) =>
    findAddableParticipantIds(
      getApplicationContext().prisma,
      event,
      citizenIds,
    ),
);
