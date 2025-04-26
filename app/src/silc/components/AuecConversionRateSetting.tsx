import { Tile } from "@/common/components/Tile";
import { SilcSettingKey } from "@prisma/client";
import clsx from "clsx";
import { getSilcSetting } from "../queries";
import { AuecConversionRateSettingClient } from "./AuecConversionRateSettingClient";

interface Props {
  readonly className?: string;
}

export const AuecConversionRateSetting = async ({ className }: Props) => {
  const setting = await getSilcSetting(SilcSettingKey.AUEC_CONVERSION_RATE);

  return (
    <Tile heading="aUEC Umrechnungskurs" className={clsx(className)}>
      <AuecConversionRateSettingClient setting={setting} />
    </Tile>
  );
};
