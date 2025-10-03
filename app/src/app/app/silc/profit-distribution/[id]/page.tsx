import { requireAuthenticationPage } from "@/modules/auth/server";
import { Button2 } from "@/modules/common/components/Button2";
import { CitizenLink } from "@/modules/common/components/CitizenLink";
import { Link } from "@/modules/common/components/Link";
import { StatisticTile } from "@/modules/common/components/StatisticTile";
import { formatDate } from "@/modules/common/utils/formatDate";
import { generateMetadataWithTryCatch } from "@/modules/common/utils/generateMetadataWithTryCatch";
import { getUnleashFlag } from "@/modules/common/utils/getUnleashFlag";
import { UNLEASH_FLAG } from "@/modules/common/utils/UNLEASH_FLAG";
import { Phase } from "@/modules/silc/components/profit-distribution/Phase";
import { getProfitDistributionCyclesById } from "@/modules/silc/queries";
import { PayoutState } from "@/modules/silc/utils/getMyPayoutStatus";
import clsx from "clsx";
import { notFound } from "next/navigation";
import { FaCog } from "react-icons/fa";

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
  await authentication.authorizePage("profitDistributionCycle", "read");

  const cycleData = await getProfitDistributionCyclesById((await params).id);
  if (!cycleData) notFound();

  const [hasProfitDistributionCycleManage] = await Promise.all([
    authentication.authorizePage("profitDistributionCycle", "manage"),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex">
        <div className="w-9 flex-initial" />

        <h1 className="text-2xl font-bold text-center flex-1">
          {cycleData.cycle.title}
        </h1>

        {hasProfitDistributionCycleManage && (
          <Button2
            as={Link}
            href={`/app/silc/profit-distribution/${cycleData.cycle.id}/management`}
            variant="secondary"
            className="w-9 flex-initial"
            title="Verwalten"
          >
            <FaCog />
          </Button2>
        )}
      </div>

      {cycleData.currentPhase >= 4 && (
        <Phase phase={4} currentPhase={cycleData.currentPhase}>
          <p className="text-center text-sm flex flex-col justify-center h-full">
            Auszahlung abgeschlossen
          </p>
        </Phase>
      )}

      {cycleData.currentPhase >= 3 && (
        <Phase phase={3} currentPhase={cycleData.currentPhase}>
          <h2 className="font-bold text-center">Auszahlung</h2>

          <div className="flex gap-[2px] border-t border-white/5 mt-4 pt-4">
            <StatisticTile label="Gesamter aUEC-Überschuss" className="flex-1">
              {cycleData.cycle.auecProfit || "-"}
            </StatisticTile>

            <StatisticTile label="Dein Anteil" className="flex-1">
              {cycleData.myShare}
            </StatisticTile>
          </div>

          <p className="text-neutral-500 text-sm text-center pt-2">
            Dein Anteil wird anhand deiner verdienten SILC und dem gesamten
            aUEC-Überschuss berechnet.
          </p>

          <StatisticTile label="Status deiner Auszahlung" className="mt-4">
            {cycleData.myPayoutState === PayoutState.NOT_PARTICIPATING && (
              <span>-</span>
            )}
            {cycleData.myPayoutState === PayoutState.AWAITING_ACCEPTANCE && (
              <span className="text-red-500">Zustimmung ausstehend</span>
            )}
            {cycleData.myPayoutState === PayoutState.AWAITING_PAYOUT && (
              <span className="text-blue-500">Auszahlung ausstehend</span>
            )}
            {cycleData.myPayoutState === PayoutState.DISBURSED && (
              <span className="text-green-500">Ausgezahlt</span>
            )}
            {cycleData.myPayoutState === PayoutState.EXPIRED && (
              <span className="text-red-500">Verfallen</span>
            )}
            {cycleData.myPayoutState === PayoutState.UNKNOWN && (
              <span className="text-red-500">Unbekannt</span>
            )}
            {cycleData.myPayoutState === PayoutState.PAYOUT_OVERDUE && (
              <span className="text-red-500">Überfällig</span>
            )}
          </StatisticTile>

          {cycleData.myPayoutState === PayoutState.DISBURSED && (
            <p className="text-neutral-500 text-sm text-center pt-2">
              Auszahlung geleistet durch{" "}
              <CitizenLink citizen={cycleData.myParticipant!.disbursedBy} /> am{" "}
              {formatDate(cycleData.myParticipant!.disbursedAt)}.
            </p>
          )}

          {[PayoutState.NOT_PARTICIPATING, PayoutState.DISBURSED].includes(
            cycleData.myPayoutState,
          ) === false && (
            <div className="flex flex-col justify-center items-center gap-2 border-t border-white/5 mt-4 pt-2">
              <div className="text-sm text-center flex flex-col gap-2">
                <p>
                  Um deinen Anteil ausgezahlt zu bekommen, musst du der
                  Auszahlung zustimmen.
                </p>

                <p>
                  <strong>Wichtig:</strong> Stimme der Auszahlung erst zu, wenn
                  du dir im aktuellen Star Citizen Patch bereits einen Charakter
                  erstellt hast. Solltest du noch keinen Charakter erstellt
                  haben, wird die Auszahlung scheitern und dein Anteil
                  unwiderruflich verloren gehen.
                </p>

                <p>
                  Wenn du der Auszahlung bis zum Ende dieser Phase nicht
                  zustimmst, wird dein Anteil der Organisation gutgeschrieben.
                </p>
              </div>

              {cycleData.myPayoutState === PayoutState.AWAITING_PAYOUT && (
                <>
                  <p className="text-green-500 text-sm">
                    Du hast der Auszahlung am{" "}
                    {formatDate(cycleData.myParticipant!.acceptedAt)}{" "}
                    zugestimmt.
                  </p>

                  {/* TODO: Implement functionality */}
                  <Button2
                    type="button"
                    disabled={cycleData.currentPhase !== 3}
                  >
                    Widerrufen
                  </Button2>
                </>
              )}

              {cycleData.myPayoutState === PayoutState.AWAITING_ACCEPTANCE && (
                // TODO: Implement functionality
                <Button2 type="button" disabled={cycleData.currentPhase !== 3}>
                  Auszahlung zustimmen
                </Button2>
              )}
            </div>
          )}

          <div className="flex justify-center border-t border-white/5 mt-4 pt-4">
            <div className="flex flex-col justify-center items-center text-sm">
              <h3 className="text-neutral-500">Endet am</h3>

              {cycleData.cycle.payoutEndedAt ? (
                <p>{formatDate(cycleData.cycle.payoutEndedAt, "short")}</p>
              ) : (
                <p className="text-neutral-500">-</p>
              )}
            </div>
          </div>
        </Phase>
      )}

      {cycleData.currentPhase >= 2 && (
        <Phase phase={2} currentPhase={cycleData.currentPhase}>
          <h2 className="font-bold text-center">Vorbereitung der Auszahlung</h2>

          <div className="border-t border-white/5 mt-4 pt-8 pb-4">
            <p className="text-center text-sm flex flex-col justify-center">
              Die Auszahlung wird durch Economics vorbereitet. Bitte schaue
              später nochmal vorbei.
            </p>
          </div>
        </Phase>
      )}

      <Phase phase={1} currentPhase={cycleData.currentPhase}>
        <h2 className="font-bold text-center">Sammelphase</h2>

        <div className="border-t border-white/5 mt-4 pt-4">
          <StatisticTile label="Von dir verdiente SILC">
            <span
              className={clsx({
                "text-green-500":
                  cycleData.mySilcBalance && cycleData.mySilcBalance > 0,
                "text-red-500":
                  cycleData.mySilcBalance && cycleData.mySilcBalance < 0,
              })}
            >
              {cycleData.mySilcBalance || 0}
            </span>
          </StatisticTile>
        </div>

        <div className="flex flex-col justify-center items-center gap-2 mt-4">
          <p className="text-center text-sm">
            Du kannst deinen Anteil für diesen Phase freiwillig abtreten. Dieser
            wird dann auf die anderen Member verteilt.
          </p>

          {cycleData.myParticipant?.cededAt ? (
            <>
              <p className="text-sm text-green-500">
                Du hast deinen Anteil am{" "}
                {formatDate(cycleData.myParticipant.cededAt)} abgetreten.
              </p>

              {/* TODO: Implement functionality */}
              <Button2
                variant="secondary"
                disabled={cycleData.currentPhase !== 1}
              >
                Widerrufen
              </Button2>
            </>
          ) : (
            // TODO: Implement functionality
            <Button2
              variant="secondary"
              disabled={cycleData.currentPhase !== 1}
            >
              Anteil abtreten
            </Button2>
          )}
        </div>

        <div className="flex justify-center border-t border-white/5 mt-4 pt-4">
          <div className="flex flex-col justify-center items-center text-sm">
            <h3 className="text-neutral-500">Endet am</h3>

            <p>{formatDate(cycleData.cycle.collectionEndedAt, "short")}</p>
          </div>
        </div>
      </Phase>
    </div>
  );
}
