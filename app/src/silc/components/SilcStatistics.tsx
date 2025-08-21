import { SilcSettingKey } from "@prisma/client";
import clsx from "clsx";
import { getSilcBalanceOfAllCitizens, getSilcSetting } from "../queries";

interface Props {
  readonly className?: string;
}

export const SilcStatistics = async ({ className }: Props) => {
  const [silcBalances, auecConversionRateSetting] = await Promise.all([
    getSilcBalanceOfAllCitizens(),
    getSilcSetting(SilcSettingKey.AUEC_CONVERSION_RATE),
  ]);

  const totalSilc = silcBalances.reduce(
    (total, balance) => total + balance.silcBalance,
    0,
  );
  const totalAuec =
    totalSilc * Number.parseInt(auecConversionRateSetting?.value || "1", 10);

  return (
    <section className={clsx("flex flex-wrap gap-[2px]", className)}>
      <div className="flex-1 rounded-primary bg-neutral-800/50 p-4 flex flex-col items-center">
        <span className="font-black text-4xl">{totalSilc}</span>
        <p className="text-neutral-500">SILC im Umlauf</p>
      </div>

      <div className="flex-1 rounded-primary bg-neutral-800/50 p-4 flex flex-col items-center">
        <span className="font-black text-4xl">
          {totalAuec.toLocaleString("de-de")}
        </span>
        <p className="text-neutral-500">aUEC im Umlauf</p>
      </div>
    </section>
  );
};
