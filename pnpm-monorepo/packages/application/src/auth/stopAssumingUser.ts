import { AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import type { ApplicationContext } from "../context.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";

export const stopAssumingUserInputSchema = z.object({
  admin_user_id: idSchema.describe("The admin behind the session."),
  assumed_user_id: idSchema.describe("The user that the admin assumes."),
  assumed_user_name: z.string().nullable(),
});

export type StopAssumingUserInput = z.infer<typeof stopAssumingUserInputSchema>;

/**
 * Writes the end of an assume to the audit log. The admin is the creator of
 * the event. The caller checks that an admin is behind the session: the
 * actor during an assume is the assumed user, thus the use case has no
 * actor. See the exceptions in the README of the package.
 */
export const stopAssumingUser = (
  context: ApplicationContext,
  input: StopAssumingUserInput,
): Promise<void> =>
  withSpan(context, "stopAssumingUser", async () => {
    await context.audit.create([
      {
        type: AuditEventType.ASSUME_USER_ENDED,
        data: {
          assumedUserId: input.assumed_user_id,
          assumedUserName: input.assumed_user_name,
        },
        createdById: input.admin_user_id,
      },
    ]);
  });
