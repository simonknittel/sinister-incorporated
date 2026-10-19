import { AuditEventType, SeasonalEventKey } from "@sam-monorepo/domain";
import * as z from "zod";
import { requireCitizen, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { withSpan } from "../withSpan.js";
import { findOwnSeasonalThemeSettings } from "./findOwnSeasonalThemeSettings.js";

/**
 * The form sends one key per switched-on event, thus a request never needs
 * more keys than the calendar has events. The limit keeps the loops of the
 * use case bounded even if the schema becomes more permissive later.
 */
export const MAXIMUM_SEASONAL_THEME_SETTING_INPUTS = 20;

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

interface SeasonalThemeSettingChange {
  readonly eventKey: SeasonalEventKey;
  readonly enabled: boolean;
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

    const currentSettings = await findOwnSeasonalThemeSettings(context, actor);

    // Opt-out model: the existence of a row means the event is switched off.
    const switchedOffEventKeys = new Set(
      currentSettings?.map((setting) => setting.eventKey) ?? [],
    );

    const enabledEventKeys = new Set(input.enabled_event_keys);

    const changes: SeasonalThemeSettingChange[] = Object.values(
      SeasonalEventKey,
    )
      .map((eventKey) => ({
        eventKey,
        enabled: enabledEventKeys.has(eventKey),
      }))
      .filter((change) => {
        const currentlyEnabled = !switchedOffEventKeys.has(change.eventKey);

        return change.enabled !== currentlyEnabled;
      });

    const disabledAt = context.now();

    await context.prisma.$transaction(
      changes.map((change) => {
        if (change.enabled)
          // deleteMany instead of delete so overlapping debounced submits
          // do not throw when the row is already gone
          return context.prisma.seasonalThemeSetting.deleteMany({
            where: { citizenId, eventKey: change.eventKey },
          });

        return context.prisma.seasonalThemeSetting.upsert({
          where: {
            citizenId_eventKey: { citizenId, eventKey: change.eventKey },
          },
          update: { disabledAt },
          create: { citizenId, eventKey: change.eventKey, disabledAt },
        });
      }),
    );

    const enabled = changes
      .filter((change) => change.enabled)
      .map((change) => change.eventKey);
    const disabled = changes
      .filter((change) => !change.enabled)
      .map((change) => change.eventKey);

    if (changes.length > 0)
      await context.audit.create([
        {
          type: AuditEventType.SEASONAL_THEME_SETTINGS_UPDATED,
          data: { citizenId, enabled, disabled },
          createdById: actor.userId,
        },
      ]);

    return { enabled, disabled };
  });
