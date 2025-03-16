import { Tile } from "@/common/components/Tile";
import { prisma } from "@/db";
import { SilcSettingKey } from "@prisma/client";
import clsx from "clsx";
import { AuecConversionRateSettingClient } from "./AuecConversionRateSettingClient";

type Props = Readonly<{
  className?: string;
}>;

export const AuecConversionRateSetting = async ({ className }: Props) => {
  const setting = await prisma.silcSetting.findUnique({
    where: {
      key: SilcSettingKey.AUEC_CONVERSION_RATE,
    },
  });

  return (
    <Tile heading="aUEC Umrechnungskurs" className={clsx(className)}>
      <AuecConversionRateSettingClient setting={setting} />
    </Tile>
  );
};
