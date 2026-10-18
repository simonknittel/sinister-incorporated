import { SilcSettingKey } from "@sam-monorepo/database/browser";
import type { ApplicationContext } from "../context.js";
import {
  auecConversionRateSchema,
  DEFAULT_AUEC_CONVERSION_RATE,
} from "./auecConversionRate.js";

/**
 * The aUEC value of one SILC. It has no permission check: the value is not
 * personal, and the pages that show it check their own permissions.
 */
export const getAuecConversionRate = async (
  context: Pick<ApplicationContext, "prisma">,
): Promise<number> => {
  const setting = await context.prisma.silcSetting.findUnique({
    where: { key: SilcSettingKey.AUEC_CONVERSION_RATE },
    select: { value: true },
  });

  return setting
    ? auecConversionRateSchema.parse(setting.value)
    : DEFAULT_AUEC_CONVERSION_RATE;
};
