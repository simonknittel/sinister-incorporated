import { z } from "zod";

const postBodySchema = z.object({
  login: z.object({
    manage: z.boolean(),
  }),
  role: z.object({
    manage: z.boolean(),
  }),
  otherRole: z.array(
    z.object({
      roleId: z.string(),
      operation: z.union([
        z.literal("manage"),
        z.literal("read"),
        z.literal("assign"),
        z.literal("dismiss"),
      ]),
    })
  ),
  classificationLevel: z.object({
    manage: z.boolean(),
  }),
  event: z.object({
    read: z.boolean(),
  }),
  operation: z.object({
    manage: z.boolean(),
  }),
  user: z.object({
    read: z.boolean(),
  }),
  orgFleet: z.object({
    read: z.boolean(),
  }),
  ship: z.object({
    manage: z.boolean(),
  }),
  eventFleet: z.object({
    read: z.boolean(),
  }),
  lastSeen: z.object({
    read: z.boolean(),
  }),
  manufacturersSeriesAndVariants: z.object({
    manage: z.boolean(),
  }),
  noteType: z.object({
    manage: z.boolean(),
  }),
  handle: z.object({
    create: z.boolean(),
    delete: z.boolean(),
    confirm: z.boolean(),
  }),
  teamspeakId: z.object({
    create: z.boolean(),
    delete: z.boolean(),
    confirm: z.boolean(),
  }),
  discordId: z.object({
    create: z.boolean(),
    delete: z.boolean(),
    confirm: z.boolean(),
  }),
  citizen: z.object({
    create: z.boolean(),
    read: z.boolean(),
    delete: z.boolean(),
  }),
  note: z
    .array(
      z.object({
        noteTypeId: z.string(),
        classificationLevelId: z.string(),
        alsoUnconfirmed: z.boolean(),
        operation: z.union([
          z.literal("manage"),
          z.literal("create"),
          z.literal("read"),
          z.literal("update"),
          z.literal("delete"),
          z.literal("confirm"),
          z.literal("readRedacted"),
        ]),
      })
    )
    .optional(),
});

export default postBodySchema;
