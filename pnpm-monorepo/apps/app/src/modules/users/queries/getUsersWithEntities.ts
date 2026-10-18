import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  findUserListPage,
  type UserListInput,
} from "@sam-monorepo/application";

export const getUsersWithEntities = withTrace(
  "getUsersWithEntities",
  async (input: UserListInput) => {
    try {
      return await findUserListPage(
        getApplicationContext(),
        await getRequestActor(),
        input,
      );
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }
  },
);
