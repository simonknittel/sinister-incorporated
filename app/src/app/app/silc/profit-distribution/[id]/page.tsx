import { requireAuthenticationPage } from "@/modules/auth/server";
import { Button2 } from "@/modules/common/components/Button2";
import { CitizenLink } from "@/modules/common/components/CitizenLink";
import { formatDate } from "@/modules/common/utils/formatDate";
import { getProfitDistributionCyclesById } from "@/modules/silc/queries";
import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { FaArrowDown } from "react-icons/fa";

export const metadata: Metadata = {
  title: "Gewinnausschüttung - SILC | S.A.M. - Sinister Incorporated",
};

export default async function Page({
  params,
}: PageProps<"/app/silc/profit-distribution/[id]">) {
  const authentication = await requireAuthenticationPage(
    "/app/silc/profit-distribution/[id]",
  );
  await authentication.authorizePage("profitDistributionCycle", "read");
  // const profitDistributionCycleManage = await authentication.authorize(
  //   "profitDistributionCycle",
  //   "manage",
  // );

  const cycle = await getProfitDistributionCyclesById((await params).id);
  if (!cycle) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div className="text-2xl font-bold">
        <h1 className="text-center">{cycle.title}</h1>
      </div>

      <section className="flex">
        <div
          className="flex-none w-8 text-xs whitespace-nowrap flex items-center justify-center rounded-l-primary bg-neutral-700 text-white"
          style={{
            writingMode: "sideways-lr",
          }}
        >
          Vorherigen Zeitraum
        </div>

        <div className="flex-1 p-4 background-secondary rounded-r-primary">
          <h2 className="sr-only">Sammelzeitraum</h2>

          <div className="flex-1 rounded-primary bg-neutral-800/50 p-4 flex flex-col items-center">
            <span className="font-black text-4xl">120</span>
            <p className="text-neutral-500">Von mir verdiente SILC</p>
          </div>

          <div className="flex justify-center py-2">
            <div className="flex flex-col justify-center items-center text-sm">
              <h3 className="text-neutral-500">Geendet am</h3>

              {cycle.collectionEndedAt ? (
                <p>{formatDate(cycle.collectionEndedAt)}</p>
              ) : (
                <p className="text-neutral-500">-</p>
              )}
            </div>
          </div>

          <div className="flex justify-center items-center gap-2 border-t border-white/5 pt-4">
            <p className="text-center text-sm">
              Du kannst deinen Anteil für diesen Zeitraum freiwillig abtreten.
              Dieser wird dann auf die anderen Member verteilt.
            </p>

            <Button2 variant="secondary" disabled>
              Anteil abtreten
            </Button2>
          </div>
        </div>
      </section>

      <div className="my-4 flex justify-center">
        <FaArrowDown className="text-4xl text-neutral-700" />
      </div>

      <section className="flex">
        <div
          className="flex-none w-8 text-xs whitespace-nowrap flex items-center justify-center rounded-l-primary bg-green-500 text-black"
          style={{
            writingMode: "sideways-lr",
          }}
        >
          Aktueller Zeitraum
        </div>

        <div className="flex-1 p-4 background-secondary rounded-r-primary">
          <h2 className="font-bold text-center">Auszahlung</h2>

          <div className="flex gap-[2px] mt-4">
            <div className="flex-1 rounded-primary bg-neutral-800/50 p-4 flex flex-col items-center">
              <span className="font-black text-4xl">350.000.000</span>
              <p className="text-neutral-500">Gesamter aUEC-Überschuss</p>
            </div>

            <div className="flex-1 rounded-primary bg-neutral-800/50 p-4 flex flex-col items-center">
              <span className="font-black text-4xl">15.000.000</span>
              <p className="text-neutral-500">Dein Anteil</p>
            </div>
          </div>

          <p className="text-neutral-500 text-sm text-center pt-2">
            Dein Anteil wird anhand deiner verdienten SILC berechnet.
          </p>

          <div className="flex-1 rounded-primary bg-neutral-800/50 p-4 flex flex-col items-center mt-4">
            <span className="font-black text-4xl">Geleistet</span>
            <p className="text-neutral-500">Status der Auszahlung</p>
          </div>

          <p className="text-neutral-500 text-sm text-center pt-2">
            Auszahlung geleistet durch{" "}
            <CitizenLink citizen={cycle.createdBy!} /> am{" "}
            {formatDate(new Date())}.
          </p>

          <div className="flex flex-col justify-center items-center gap-2 border-t border-white/5 mt-4 pt-2">
            <div className="text-sm text-center flex flex-col gap-2">
              <p>
                Um deinen Anteil ausgezahlt zu bekommen, musst du die Auszahlung
                akzeptieren.
              </p>

              <p>
                <strong>Wichtig:</strong> Akzeptiere die Auszahlung erst, wenn
                du dir im aktuellen Star Citizen Patch bereits einen Charakter
                erstellt hast. Solltest du noch keinen Charakter erstellt haben,
                wird die Auszahlung scheitern und dein Anteil unwiderruflich
                verloren gehen.
              </p>

              <p>
                Wenn du der Auszahlung bis zum Ende des Zeitraums nicht
                akzeptierst, wird dein Anteil der Organisation gutgeschrieben.
              </p>
            </div>

            <Button2>Auszahlung akzeptieren</Button2>
          </div>

          <div className="flex justify-center border-t border-white/5 mt-4 pt-2">
            <div className="flex flex-col justify-center items-center text-sm">
              <h3 className="text-neutral-500">Endet am</h3>

              {cycle.collectionEndedAt ? (
                <p>{formatDate(cycle.collectionEndedAt)}</p>
              ) : (
                <p className="text-neutral-500">-</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* {profitDistributionCycleManage && <Tile heading="Aktionen">Löschen</Tile>} */}
    </div>
  );
}
