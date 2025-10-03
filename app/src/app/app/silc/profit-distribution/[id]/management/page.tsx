import { requireAuthenticationPage } from "@/modules/auth/server";
import { Button2 } from "@/modules/common/components/Button2";
import { Link } from "@/modules/common/components/Link";
import { StatisticTile } from "@/modules/common/components/StatisticTile";
import { formatDate } from "@/modules/common/utils/formatDate";
import { generateMetadataWithTryCatch } from "@/modules/common/utils/generateMetadataWithTryCatch";
import { getUnleashFlag } from "@/modules/common/utils/getUnleashFlag";
import { UNLEASH_FLAG } from "@/modules/common/utils/UNLEASH_FLAG";
import { EndCollectionPhaseButton } from "@/modules/silc/components/profit-distribution/EndCollectionPhaseButton";
import { Phase } from "@/modules/silc/components/profit-distribution/Phase";
import { Phase2 } from "@/modules/silc/components/profit-distribution/Phase2";
import { getProfitDistributionCyclesById } from "@/modules/silc/queries";
import { notFound } from "next/navigation";
import { FaChevronLeft } from "react-icons/fa";

type Params = Promise<{
  id: string;
}>;

export const generateMetadata = generateMetadataWithTryCatch(
  async (props: { params: Params }) => {
    const cycleData = await getProfitDistributionCyclesById(
      (await props.params).id,
    );
    if (!cycleData) notFound();

    return {
      title: `${cycleData.cycle.title} - Gewinnausschüttung - SILC | S.A.M. - Sinister Incorporated`,
    };
  },
);

export default async function Page({
  params,
}: PageProps<"/app/silc/profit-distribution/[id]">) {
  if (!(await getUnleashFlag(UNLEASH_FLAG.EnableProfitDistribution)))
    notFound();

  const authentication = await requireAuthenticationPage(
    "/app/silc/profit-distribution/[id]",
  );
  await authentication.authorizePage("profitDistributionCycle", "manage");

  const cycleData = await getProfitDistributionCyclesById((await params).id);
  if (!cycleData) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex">
        <div className="w-9 flex-initial" />

        <h1 className="text-2xl font-bold text-center flex-1">
          {cycleData.cycle.title}
        </h1>
        {/* TODO: Implement edit button */}

        <Button2
          as={Link}
          href={`/app/silc/profit-distribution/${cycleData.cycle.id}`}
          variant="secondary"
          className="w-9 flex-initial"
          title="Zurück"
        >
          <FaChevronLeft />
        </Button2>
      </div>

      {cycleData.currentPhase >= 4 && (
        <Phase phase={4} currentPhase={cycleData.currentPhase}>
          <h2 className="font-bold text-center">Auszahlung abgeschlossen</h2>

          <div className="flex gap-[2px] border-t border-white/5 mt-4 pt-4">
            <StatisticTile label="aUEC ausgezahlt" className="flex-1">
              {/* TODO */}
              ???
            </StatisticTile>

            <StatisticTile label="aUEC nicht ausgezahlt" className="flex-1">
              {/* TODO */}
              ???
            </StatisticTile>
          </div>
        </Phase>
      )}

      {cycleData.currentPhase >= 3 && (
        <Phase phase={3} currentPhase={cycleData.currentPhase}>
          <h2 className="font-bold text-center">Auszahlung</h2>

          <div className="flex gap-[2px] border-t border-white/5 mt-4 pt-4">
            <StatisticTile label="aUEC noch auszubezahlen" className="flex-1">
              {/* TODO */}
              ???
            </StatisticTile>

            <StatisticTile label="fehlende Zustimmungen" className="flex-1">
              {cycleData.cycle.participants
                .filter(
                  (participant) =>
                    !participant.acceptedAt && !participant.cededAt,
                )
                .length.toLocaleString("de")}
            </StatisticTile>
          </div>

          <div className="flex justify-center mt-4">
            <div className="flex flex-col justify-center items-center text-sm">
              <h3 className="text-neutral-500">Endet am</h3>

              <p>{formatDate(cycleData.cycle.payoutEndedAt, "short") || "-"}</p>
              {/* TODO: Implement edit button */}
            </div>
          </div>

          <div className="flex justify-center items-center gap-2 mt-2">
            <p className="text-center text-sm">
              Du kannst diese Phase sofort beenden.
            </p>

            {/* TODO: Implement functionality incl. confirmation prompt */}
            {/* TODO: Hinweis: Es gibt noch N zugestimmten Auszahlungen, die noch nicht ausgezahlt wurden */}
            <Button2
              variant="secondary"
              disabled={cycleData.currentPhase !== 3}
            >
              Phase beenden
            </Button2>

            {/* TODO: Implement confirmation prompt */}
          </div>

          <div className="flex justify-center items-center gap-2 border-t border-white/5 pt-4 mt-4">
            TODO: Tabelle mit Membern (Handle, verdiente SILC, abgetreten
            ja/nein, zugestimmt ja/nein, ausgezahlt ja/nein)
          </div>
        </Phase>
      )}

      {cycleData.currentPhase >= 2 && <Phase2 cycleData={cycleData} />}

      <Phase phase={1} currentPhase={cycleData.currentPhase}>
        <h2 className="text-center font-bold">Sammelphase</h2>

        <div className="flex gap-[2px] border-t border-white/5 mt-4 pt-4">
          <StatisticTile label="Anzahl Teilnehmer" className="flex-1">
            {cycleData.currentPhase === 1
              ? cycleData.allSilcBalances.length.toLocaleString("de")
              : cycleData.cycle.participants.length.toLocaleString("de")}
          </StatisticTile>

          <StatisticTile label="Gesamt verdiente SILC" className="flex-1">
            {cycleData.currentPhase === 1
              ? cycleData.allSilcBalances
                  .reduce((total, citizen) => total + citizen.silcBalance, 0)
                  .toLocaleString("de")
              : cycleData.cycle.participants
                  .reduce(
                    (total, participant) =>
                      total + (participant.silcBalanceSnapshot || 0),
                    0,
                  )
                  .toLocaleString("de")}
          </StatisticTile>
        </div>

        <div className="flex justify-center mt-4">
          <div className="flex flex-col justify-center items-center text-sm">
            <h3 className="text-neutral-500">Endet am</h3>

            <p>{formatDate(cycleData.cycle.collectionEndedAt, "short")}</p>

            {/* TODO: Implement edit button */}
          </div>
        </div>

        <div className="flex justify-center items-center gap-2 mt-2">
          <p className="text-center text-sm">
            Du kannst diese Phase sofort beenden.
          </p>

          <EndCollectionPhaseButton cycleData={cycleData} />
        </div>

        <div className="flex justify-center items-center gap-2 border-t border-white/5 pt-4 mt-4">
          TODO: Tabelle mit Membern (Handle, verdiente SILC, abgetreten ja/nein)
        </div>
      </Phase>
    </div>
  );
}
