import { requireAuthenticationPage } from "@/modules/auth/server";
import { Button2 } from "@/modules/common/components/Button2";
import { NumberInput } from "@/modules/common/components/form/NumberInput";
import { StatisticTile } from "@/modules/common/components/StatisticTile";
import { formatDate } from "@/modules/common/utils/formatDate";
import { Phase } from "@/modules/silc/components/profit-distribution/Phase";
import { getProfitDistributionCyclesById } from "@/modules/silc/queries";
import { type Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Gewinnausschüttung - SILC | S.A.M. - Sinister Incorporated",
};

export default async function Page({
  params,
}: PageProps<"/app/silc/profit-distribution/[id]">) {
  const authentication = await requireAuthenticationPage(
    "/app/silc/profit-distribution/[id]",
  );
  await authentication.authorizePage("profitDistributionCycle", "manage");

  const cycleData = await getProfitDistributionCyclesById((await params).id);
  if (!cycleData) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div className="text-2xl font-bold">
        <h1 className="text-center">{cycleData.cycle.title}</h1>
      </div>

      {cycleData.currentPhase >= 4 && (
        <Phase phase={4} currentPhase={cycleData.currentPhase}>
          <h2 className="font-bold text-center">Auszahlung abgeschlossen</h2>

          <div className="flex gap-[2px]">
            <StatisticTile label="Gesamt aUEC ausgezahlt" className="flex-1">
              ???
            </StatisticTile>

            <StatisticTile
              label="Gesamt aUEC nicht ausgezahlt"
              className="flex-1"
            >
              ???
            </StatisticTile>
          </div>
        </Phase>
      )}

      {cycleData.currentPhase >= 3 && (
        <Phase phase={3} currentPhase={cycleData.currentPhase}>
          <h2 className="font-bold text-center">Auszahlung</h2>

          <div className="flex justify-center py-2">
            <div className="flex flex-col justify-center items-center text-sm">
              <h3 className="text-neutral-500">Endet am</h3>

              <p>{formatDate(cycleData.cycle.collectionEndedAt, "short")}</p>
            </div>
          </div>

          <div className="flex justify-center items-center gap-2 border-t border-white/5 pt-4">
            <p className="text-center text-sm">
              Du kannst diese Phase sofort beenden.
            </p>

            <Button2
              variant="secondary"
              disabled={cycleData.currentPhase !== 3}
            >
              Phase beenden
            </Button2>
          </div>

          <div className="flex justify-center items-center gap-2 border-t border-white/5 pt-4 mt-4">
            TODO: Tabelle mit Membern (Handle, verdiente SILC, abgetreten
            ja/nein, zugestimmt ja/nein, ausgezahlt ja/nein)
          </div>
        </Phase>
      )}

      {cycleData.currentPhase >= 2 && (
        <Phase phase={2} currentPhase={cycleData.currentPhase}>
          <h2 className="text-center font-bold">Vorbereitung der Auszahlung</h2>

          <div className="max-w-80 mx-auto text-center mt-4">
            <NumberInput
              name="auecProfit"
              label="Gesamter aUEC-Überschuss"
              disabled={cycleData.currentPhase !== 2}
            />
          </div>

          <div className="flex gap-[2px] mt-4">
            <StatisticTile label="aUEC pro Member" className="flex-1">
              ???
            </StatisticTile>
          </div>

          <Button2
            variant="primary"
            disabled={cycleData.currentPhase !== 2}
            className="mt-4 mx-auto"
          >
            Auszahlungsphase starten
          </Button2>
        </Phase>
      )}

      <Phase phase={1} currentPhase={cycleData.currentPhase}>
        <h2 className="sr-only">Sammelphase</h2>

        <div className="flex gap-[2px]">
          <StatisticTile label="Anzahl Teilnehmer" className="flex-1">
            ???
          </StatisticTile>

          <StatisticTile label="Gesamt verdiente SILC" className="flex-1">
            ???
          </StatisticTile>
        </div>

        <div className="flex justify-center py-2">
          <div className="flex flex-col justify-center items-center text-sm">
            <h3 className="text-neutral-500">Endet am</h3>

            <p>{formatDate(cycleData.cycle.collectionEndedAt, "short")}</p>
          </div>
        </div>

        <div className="flex justify-center items-center gap-2 border-t border-white/5 pt-4">
          <p className="text-center text-sm">
            Du kannst diese Phase sofort beenden.
          </p>

          <Button2 variant="secondary" disabled={cycleData.currentPhase !== 1}>
            Phase beenden
          </Button2>
        </div>

        <div className="flex justify-center items-center gap-2 border-t border-white/5 pt-4 mt-4">
          TODO: Tabelle mit Membern (Handle, verdiente SILC, abgetreten ja/nein)
        </div>
      </Phase>
    </div>
  );
}
