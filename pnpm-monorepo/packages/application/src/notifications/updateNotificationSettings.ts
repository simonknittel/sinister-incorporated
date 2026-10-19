import { NotificationChannel } from "@sam-monorepo/database/browser";
import {
  AuditEventType,
  getNotificationSettingInputName,
  MAXIMUM_NOTIFICATION_SETTING_INPUTS,
  NOTIFICATION_SETTING_TYPES,
  type NotificationSettingType,
} from "@sam-monorepo/domain";
import * as z from "zod";
import { requireCitizen, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { withSpan } from "../withSpan.js";

/**
 * The longest input name has 36 characters. The limit bounds the input.
 */
const MAXIMUM_SETTING_INPUT_NAME_LENGTH = 100;

export const updateNotificationSettingsInputSchema = z.object({
  /**
   * The names of the inputs that are switched on (see
   * `getNotificationSettingInputName()`). A type that is not in the list is
   * switched off for the channel.
   */
  enabled_input_names: z
    .array(z.string().max(MAXIMUM_SETTING_INPUT_NAME_LENGTH))
    .max(MAXIMUM_NOTIFICATION_SETTING_INPUTS),
});

export type UpdateNotificationSettingsInput = z.output<
  typeof updateNotificationSettingsInputSchema
>;

export interface NotificationSettingChange {
  readonly notification_type: NotificationSettingType;
  readonly channel: NotificationChannel;
}

export interface UpdateNotificationSettingsOutput {
  /** The settings that the save switched on */
  readonly enabled: NotificationSettingChange[];
  /** The settings that the save switched off */
  readonly disabled: NotificationSettingChange[];
}

interface SettingChange {
  readonly notificationType: NotificationSettingType;
  readonly channel: NotificationChannel;
  readonly enabled: boolean;
}

/**
 * Saves the notification settings of the citizen of the actor. The input
 * holds all settings that are switched on. The save writes only the
 * settings that changed.
 *
 * @throws ForbiddenError for a user without a citizen
 */
export const updateNotificationSettings = (
  context: ApplicationContext,
  actor: Actor,
  input: UpdateNotificationSettingsInput,
): Promise<UpdateNotificationSettingsOutput> =>
  withSpan(context, "updateNotificationSettings", async () => {
    const citizenId = requireCitizen(actor).id;

    const currentSettings = await context.prisma.notificationSetting.findMany({
      where: {
        citizenId,
      },
      select: {
        notificationType: true,
        channel: true,
      },
    });

    const changes: SettingChange[] = [];
    for (const channel of Object.values(NotificationChannel)) {
      for (const notificationType of NOTIFICATION_SETTING_TYPES) {
        const isEnabled = input.enabled_input_names.includes(
          getNotificationSettingInputName(channel, notificationType),
        );

        // Opt-out model: the existence of a row means the notification type
        // is disabled.
        const isCurrentlyEnabled = !currentSettings.some(
          (setting) =>
            setting.notificationType === notificationType &&
            setting.channel === channel,
        );

        if (isEnabled !== isCurrentlyEnabled)
          changes.push({ notificationType, channel, enabled: isEnabled });
      }
    }

    const enabledChanges = changes.filter((change) => change.enabled);
    const disabledChanges = changes.filter((change) => !change.enabled);

    if (changes.length > 0) {
      const now = context.now();

      await context.prisma.$transaction(
        changes.map((change) => {
          if (change.enabled)
            // deleteMany instead of delete so overlapping debounced submits
            // don't throw when the row is already gone
            return context.prisma.notificationSetting.deleteMany({
              where: {
                citizenId,
                notificationType: change.notificationType,
                channel: change.channel,
              },
            });

          return context.prisma.notificationSetting.upsert({
            where: {
              citizenId_notificationType_channel: {
                citizenId,
                notificationType: change.notificationType,
                channel: change.channel,
              },
            },
            update: {
              disabledAt: now,
            },
            create: {
              citizenId,
              notificationType: change.notificationType,
              channel: change.channel,
              disabledAt: now,
            },
          });
        }),
      );

      await context.audit.create([
        {
          type: AuditEventType.NOTIFICATION_SETTINGS_UPDATED,
          data: {
            citizenId,
            enabled: enabledChanges.map(({ notificationType, channel }) => ({
              notificationType,
              channel,
            })),
            disabled: disabledChanges.map(({ notificationType, channel }) => ({
              notificationType,
              channel,
            })),
          },
          createdById: actor.userId,
        },
      ]);
    }

    const toOutput = ({
      notificationType,
      channel,
    }: SettingChange): NotificationSettingChange => ({
      notification_type: notificationType,
      channel,
    });

    return {
      enabled: enabledChanges.map(toOutput),
      disabled: disabledChanges.map(toOutput),
    };
  });
