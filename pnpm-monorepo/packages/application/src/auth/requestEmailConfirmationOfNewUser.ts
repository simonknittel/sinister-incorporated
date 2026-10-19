import type { ApplicationContext } from "../context.js";
import { withSpan } from "../withSpan.js";
import { sendEmailConfirmation } from "./emailConfirmationRequest.js";

export interface RequestEmailConfirmationOfNewUserInput {
  readonly userId: string;
  readonly email: string;
}

export interface RequestEmailConfirmationOfNewUserOutput {
  /** False when the user has no email address or the request failed */
  readonly requested: boolean;
}

/**
 * Sends the email with the confirmation link to a user that the sign-in
 * just created. It runs before the first session, thus without an actor,
 * and it writes no audit event. Never throws: a failure must not stop the
 * sign-in.
 */
export const requestEmailConfirmationOfNewUser = (
  context: ApplicationContext,
  input: RequestEmailConfirmationOfNewUserInput,
): Promise<RequestEmailConfirmationOfNewUserOutput> =>
  withSpan(context, "requestEmailConfirmationOfNewUser", async () => {
    // The type does not stop a provider that gives no email address
    if (!input.email) {
      context.log.warn("The new user has no email address to confirm", {
        userId: input.userId,
      });

      return { requested: false };
    }

    return { requested: await sendEmailConfirmation(context, input) };
  });
