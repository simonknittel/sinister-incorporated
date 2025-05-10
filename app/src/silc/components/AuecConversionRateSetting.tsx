import { Tile } from "@/common/components/Tile";
import { SilcSettingKey } from "@prisma/client";
import clsx from "clsx";
import { getSilcBalanceOfAllCitizens, getSilcSetting } from "../queries";
import { AuecConversionRateSettingClient } from "./AuecConversionRateSettingClient";

interface Props {
  readonly className?: string;
}

export const AuecConversionRateSetting = async ({ className }: Props) => {
  const [conversionRate, silcBalances] = await Promise.all([
    getSilcSetting(SilcSettingKey.AUEC_CONVERSION_RATE),
    getSilcBalanceOfAllCitizens(),
  ]);

  const totalSilc = silcBalances.reduce(
    (total, balance) => total + balance.silcBalance,
    0,
  );

  return (
    <Tile heading="aUEC Umrechnungskurs" className={clsx(className)}>
      <AuecConversionRateSettingClient
        conversionRate={conversionRate}
        totalSilc={totalSilc}
      />
    </Tile>
  );
};
