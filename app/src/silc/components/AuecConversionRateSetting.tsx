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
    <section className={clsx("rounded-2xl bg-neutral-800/50", className)}>
      <h2 className="font-bold text-xl p-4 lg:px-8 border-b border-white/5">
        aUEC Umrechnungskurs
      </h2>

      <AuecConversionRateSettingClient
        setting={setting}
        className="p-4 lg:p-8"
      />
    </section>
  );
};
