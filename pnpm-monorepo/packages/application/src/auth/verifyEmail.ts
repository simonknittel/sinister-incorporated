import { AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import { markEmailConfirmed } from "./markEmailConfirmed.js";

export const verifyEmailInputSchema = z.object({
  user_id: idSchema,
});

export type VerifyEmailInput = z.infer<typeof verifyEmailInputSchema>;

export interface VerifyEmailOutput {
  readonly user_id: string;
  /** ISO 8601 */
  readonly email_verified_at: string;
}

/**
 * Confirms the email address of a user without the confirmation link, for
 * example when the email does not reach the user. A user manager does it.
 */
export const verifyEmail = (
  context: ApplicationContext,
  actor: Actor,
  input: VerifyEmailInput,
): Promise<VerifyEmailOutput> =>
  withSpan(context, "verifyEmail", async () => {
    requirePermission(actor, "user", "manage");

    const now = context.now();
    await markEmailConfirmed(context.prisma, input.user_id, now);

    await context.audit.create([
      {
        type: AuditEventType.EMAIL_VERIFIED,
        data: {
          userId: input.user_id,
        },
        createdById: actor.userId,
      },
    ]);

    return {
      user_id: input.user_id,
      email_verified_at: now.toISOString(),
    };
  });
