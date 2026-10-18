import { AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import type { ApplicationContext } from "../context.js";
import { withSpan } from "../withSpan.js";
import { markEmailConfirmed } from "./markEmailConfirmed.js";

export const confirmEmailWithTokenInputSchema = z.object({
  token: z.cuid2(),
});

export type ConfirmEmailWithTokenInput = z.infer<
  typeof confirmEmailWithTokenInputSchema
>;

export interface ConfirmEmailWithTokenOutput {
  /** False when the token is unknown, used up or expired */
  readonly confirmed: boolean;
}

/**
 * Confirms the email address of the user that owns the token. The link in
 * the email carries the token, thus the use case is public: the token is the
 * proof, and it never goes into a log or into an error.
 */
export const confirmEmailWithToken = (
  context: ApplicationContext,
  input: ConfirmEmailWithTokenInput,
): Promise<ConfirmEmailWithTokenOutput> =>
  withSpan(context, "confirmEmailWithToken", async () => {
    const now = context.now();

    const token = await context.prisma.emailConfirmationToken.findUnique({
      where: {
        token: input.token,
        expires: {
          gt: now,
        },
      },
      select: {
        userId: true,
      },
    });
    if (!token) return { confirmed: false };

    await markEmailConfirmed(context, token.userId, now);

    await context.audit.create([
      {
        type: AuditEventType.EMAIL_VERIFIED_VIA_TOKEN,
        data: {
          userId: token.userId,
        },
        createdById: token.userId,
      },
    ]);

    return { confirmed: true };
  });
