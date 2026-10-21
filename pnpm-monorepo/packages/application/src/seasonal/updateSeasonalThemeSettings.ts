import { AuditEventType, SeasonalEventKey } from "@sam-monorepo/domain";
import * as z from "zod";
import { requireCitizen, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { findOptOutChanges } from "../optOutChanges.js";
import { withSpan } from "../withSpan.js";
import { findOwnSeasonalThemeSettings } from "./findOwnSeasonalThemeSettings.js";

/**
 * The form sends one key per switched-on event, thus a request never needs
 * more keys than the calendar has events. The limit keeps the loops of the
 * use case bounded even if the schema becomes more permissive later.
 */
const MAXIMUM_SEASONAL_THEME_SETTING_INPUTS = 20;

export const updateSeasonalThemeSettingsInputSchema = z.object({
  enabled_event_keys: z
    .array(z.enum(SeasonalEventKey))
    .max(MAXIMUM_SEASONAL_THEME_SETTING_INPUTS)
    .describe(
      "The events that show their theme. All other events are switched off.",
    ),
});

export type UpdateSeasonalThemeSettingsInput = z.output<
  typeof updateSeasonalThemeSettingsInputSchema
>;

export interface UpdateSeasonalThemeSettingsOutput {
  /** The events that show their theme again */
  readonly enabled: SeasonalEventKey[];
  /** The events that the citizen switched off */
  readonly disabled: SeasonalEventKey[];
}

/**
 * Sets which seasonal events show their theme for the actor. A checked
 * switch names its event, a cleared switch is absent. Only the events that
 * the request really changes are written and logged.
 *
 * @throws ForbiddenError for a user without a citizen
 */
export const updateSeasonalThemeSettings = (
  context: ApplicationContext,
  actor: Actor,
  input: UpdateSeasonalThemeSettingsInput,
): Promise<UpdateSeasonalThemeSettingsOutput> =>
  withSpan(context, "updateSeasonalThemeSettings", async () => {
    const citizenId = requireCitizen(actor).id;

    const switchedOffSettings =
      (await findOwnSeasonalThemeSettings(context, actor)) ?? [];

    const { enabled, disabled } = findOptOutChanges<SeasonalEventKey>(
      Object.values(SeasonalEventKey),
      new Set(input.enabled_event_keys),
      new Set(switchedOffSettings.map((setting) => setting.eventKey)),
    );

    if (enabled.length > 0 || disabled.length > 0) {
      const disabledAt = context.now();

      await context.prisma.$transaction([
        ...enabled.map((eventKey) =>
          // deleteMany instead of delete: two overlapping saves must not
          // throw when the row is already gone
          context.prisma.seasonalThemeSetting.deleteMany({
            where: { citizenId, eventKey },
          }),
        ),
        ...disabled.map((eventKey) =>
          context.prisma.seasonalThemeSetting.upsert({
            where: { citizenId_eventKey: { citizenId, eventKey } },
            update: { disabledAt },
            create: { citizenId, eventKey, disabledAt },
          }),
        ),
      ]);

      await context.audit.create([
        {
          type: AuditEventType.SEASONAL_THEME_SETTINGS_UPDATED,
          data: { citizenId, enabled, disabled },
          createdById: actor.userId,
        },
      ]);
    }

    return { enabled, disabled };
  });
