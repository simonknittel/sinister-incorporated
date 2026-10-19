import type {
  ApplicationContext,
  WikiCollabSession,
  WikiPageContentReplacement,
} from "../src/context.js";

interface TestCollabServerOptions {
  /** Each replacement fails like a collab server that cannot be reached */
  readonly failsReplace?: boolean;
}

/**
 * The collab server of the tests. It records the replacements that it takes
 * and the sessions, in the sequence of the calls. A session token holds the
 * page and the user, thus a test can compare it.
 */
export const createTestCollabServer = ({
  failsReplace = false,
}: TestCollabServerOptions = {}) => {
  const replacements: WikiPageContentReplacement[] = [];
  const sessions: WikiCollabSession[] = [];

  const collab: NonNullable<ApplicationContext["collab"]> = {
    replaceContent: async (replacement) => {
      if (failsReplace)
        throw new Error("The test collab server does not take content");

      replacements.push(replacement);
    },
    createSessionToken: async (session) => {
      sessions.push(session);
      return `test-session-token:${session.pageId}:${session.userId}`;
    },
  };

  return { collab, replacements, sessions };
};
