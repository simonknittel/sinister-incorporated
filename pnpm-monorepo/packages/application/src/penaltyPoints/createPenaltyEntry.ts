import { AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import { requireCitizen, requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { ConflictError, NotFoundError } from "../errors.js";
import { triggerNotificationsAfterSave } from "../notifications.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import {
  PENALTY_ENTRY_SELECT,
  toPenaltyEntryOutput,
  type PenaltyEntryOutput,
} from "./penaltyEntryOutput.js";

/** The length of the text field of the form */
const MAXIMUM_REASON_LENGTH = 512;

export const createPenaltyEntryInputSchema = z.object({
  citizen_id: idSchema.describe("The citizen who gets the penalty points."),
  // The database column is a 32-bit integer
  points: z.int32().min(1),
  reason: z
    .string()
    .trim()
    .max(MAXIMUM_REASON_LENGTH)
    .optional()
    .describe("Why the citizen gets the points."),
  expires_at: z.iso
    .datetime({ offset: true })
    .optional()
    .describe(
      "When the points expire: ISO 8601 with a time zone offset, for example 2026-12-31T23:59:00+01:00. Without it, the points never expire.",
    ),
});

export interface CreatePenaltyEntryOutput {
  readonly entry: PenaltyEntryOutput;
  /**
   * False when the entry is saved, but the notifications failed. The entry
   * stands, thus the caller must not create it again.
   */
  readonly notifications_sent: boolean;
}

/** Gives penalty points to a citizen and notifies about the new entry */
export const createPenaltyEntry = (
  context: ApplicationContext,
  actor: Actor,
  input: z.infer<typeof createPenaltyEntryInputSchema>,
): Promise<CreatePenaltyEntryOutput> =>
  withSpan(context, "createPenaltyEntry", async () => {
    requirePermission(actor, "penaltyEntry", "create");
    const author = requireCitizen(actor);

    const citizen = await context.prisma.citizen.findUnique({
      where: { id: input.citizen_id },
      select: { deletedAt: true },
    });
    if (!citizen) throw new NotFoundError("The citizen does not exist");
    if (citizen.deletedAt) throw new ConflictError("The citizen is deleted");

    const expiresAt = input.expires_at ? new Date(input.expires_at) : null;

    const entry = await context.prisma.penaltyEntry.create({
      data: {
        createdBy: { connect: { id: author.id } },
        citizen: { connect: { id: input.citizen_id } },
        points: input.points,
        reason: input.reason,
        expiresAt,
      },
      select: PENALTY_ENTRY_SELECT,
    });

    await context.audit.create([
      {
        type: AuditEventType.PENALTY_ENTRY_CREATED,
        data: {
          penaltyEntryId: entry.id,
          citizenId: entry.citizen.id,
          points: input.points,
          reason: input.reason || null,
          expiresAt,
        },
        createdById: actor.userId,
      },
    ]);

    return {
      entry: toPenaltyEntryOutput(entry),
      notifications_sent: await triggerNotificationsAfterSave(context, [
        { type: "PenaltyEntryCreated", payload: { penaltyEntryId: entry.id } },
      ]),
    };
  });
