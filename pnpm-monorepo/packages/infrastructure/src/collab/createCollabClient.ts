import type {
  ApplicationContext,
  WikiCollabSession,
  WikiPageContentReplacement,
} from "@sam-monorepo/application";
import type {
  WikiCollabReplaceTokenPayload,
  WikiCollabSessionTokenPayload,
} from "@sam-monorepo/wiki-editor";
import { SignJWT } from "jose";

/**
 * The lifetime of each token. The collab provider asks for a new session
 * token on each reconnect, and a replace token is used at once.
 */
const TOKEN_LIFETIME = "60s";

const TOKEN_ALGORITHM = "HS256";

export interface CollabClientOptions {
  /** The WebSocket URL of the collab server (`ws:` or `wss:`) */
  readonly url: string;
  /** The HS256 secret that the host shares with the collab server */
  readonly jwtSecret: string;
  /** The maximum time of one replace request */
  readonly replaceTimeoutMilliseconds: number;
}

/**
 * The collab server of the wiki editor (`apps/collab`). The client signs the
 * tokens that the server verifies. The explicit `scope` claim keeps the two
 * token kinds apart: a session token never authorizes a replace.
 */
export const createCollabClient = ({
  url,
  jwtSecret,
  replaceTimeoutMilliseconds,
}: CollabClientOptions): NonNullable<ApplicationContext["collab"]> => {
  const key = new TextEncoder().encode(jwtSecret);

  return {
    /**
     * Always through the internal endpoint of the collab server, thus the
     * connected editors get the new content. A direct write to the database
     * would fork a live editing session.
     */
    replaceContent: async ({
      pageId,
      content,
      updatedByEntityId,
    }: WikiPageContentReplacement) => {
      const replaceUrl = new URL("/replace", url);
      replaceUrl.protocol = replaceUrl.protocol === "ws:" ? "http:" : "https:";

      const token = await new SignJWT({
        scope: "replace",
        pageId,
        entityId: updatedByEntityId,
      } satisfies WikiCollabReplaceTokenPayload)
        .setProtectedHeader({ alg: TOKEN_ALGORITHM })
        .setIssuedAt()
        .setExpirationTime(TOKEN_LIFETIME)
        .sign(key);

      const response = await fetch(replaceUrl, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ content }),
        signal: AbortSignal.timeout(replaceTimeoutMilliseconds),
      });
      /**
       * The client uses only the status. It cancels the body, thus the
       * connection does not wait for a read of the body.
       */
      await response.body?.cancel();
      if (!response.ok)
        throw new Error(
          `Collab replace request failed with status ${response.status}`,
        );
    },

    createSessionToken: ({
      userId,
      pageId,
      entityId,
      canEdit,
    }: WikiCollabSession) =>
      new SignJWT({
        scope: "session",
        pageId,
        entityId,
        canEdit,
      } satisfies Omit<WikiCollabSessionTokenPayload, "sub">)
        .setProtectedHeader({ alg: TOKEN_ALGORITHM })
        .setSubject(userId)
        .setIssuedAt()
        .setExpirationTime(TOKEN_LIFETIME)
        .sign(key),
  };
};
