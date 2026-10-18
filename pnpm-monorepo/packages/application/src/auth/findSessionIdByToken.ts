import * as z from "zod";
import type { ApplicationContext } from "../context.js";

/** A real session token is much shorter; the limit only bounds the input */
const MAXIMUM_SESSION_TOKEN_LENGTH = 256;

export const findSessionIdByTokenInputSchema = z.object({
  session_token: z.string().min(1).max(MAXIMUM_SESSION_TOKEN_LENGTH),
});

export type FindSessionIdByTokenInput = z.infer<
  typeof findSessionIdByTokenInputSchema
>;

/**
 * Resolves the session token to the id of its session, or to null when no
 * session has the token. The token is a secret: the use case gives the id
 * only, thus the token stays out of everything downstream, and it never goes
 * into a log or into an error. The use case has no actor, because the caller
 * needs the session to build the actor. See the exceptions in the README of
 * the package.
 */
export const findSessionIdByToken = async (
  context: ApplicationContext,
  input: FindSessionIdByTokenInput,
): Promise<string | null> => {
  const session = await context.prisma.session.findUnique({
    where: {
      sessionToken: input.session_token,
    },
    select: {
      id: true,
    },
  });

  return session?.id ?? null;
};
