import { prisma } from "@/db";
import { SilcSettingKey } from "@prisma/client";
import clsx from "clsx";
import { getSilcBalanceOfAllCitizens } from "../queries";

type Props = Readonly<{
  className?: string;
}>;

export const SilcStatistics = async ({ className }: Props) => {
  const [silcBalances, auecConversionRateSetting] = await Promise.all([
    getSilcBalanceOfAllCitizens(),
    prisma.silcSetting.findUnique({
      where: {
        key: SilcSettingKey.AUEC_CONVERSION_RATE,
      },
    }),
  ]);

  const totalSilc = silcBalances.reduce(
    (total, balance) => total + balance.silcBalance,
    0,
  );
  const totalAuec =
    totalSilc * Number.parseInt(auecConversionRateSetting?.value || "1", 10);

  return (
    <section
      className={clsx(
        "rounded-2xl bg-neutral-800/50 flex justify-around p-4 lg:p-8",
        className,
      )}
    >
      <div className="flex flex-col items-center">
        <span className="font-black text-4xl">{totalSilc}</span>
        <p className="text-neutral-500">SILC im Umlauf</p>
      </div>

      <div className="flex flex-col items-center">
        <span className="font-black text-4xl">
          {totalAuec.toLocaleString("de-de")}
        </span>
        <p className="text-neutral-500">aUEC im Umlauf</p>
      </div>
    </section>
  );
};
