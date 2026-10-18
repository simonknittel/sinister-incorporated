"use client";

import { CitizenLink } from "@/modules/common/components/CitizenLink";
import { ScrambleIn } from "@/modules/common/components/ScrambleIn";
import { StatisticTile } from "@/modules/common/components/StatisticTile";
import { formatDate } from "@/modules/common/utils/formatDate";
import { CyclePhase, PayoutState } from "@sam-monorepo/domain";
import type { getProfitDistributionCycleById } from "../queries/getProfitDistributionCycleById";
import { Phase } from "./Phase";
import { PhaseEndDate } from "./PhaseEndDate";
import { ToggleMyAcceptedButton } from "./ToggleMyAcceptedButton";

interface Props {
  readonly cycleData: NonNullable<
    Awaited<ReturnType<typeof getProfitDistributionCycleById>>
  >;
}

export const PhasePayout = ({ cycleData }: Props) => {
  return (
    <Phase phase={CyclePhase.Payout} currentPhase={cycleData.currentPhase}>
      <h2 className="text-center font-mono font-bold uppercase">Auszahlung</h2>

      <div className="mt-4 flex gap-0.5 border-t border-white/5 pt-4">
        <StatisticTile label="Gesamter aUEC-Überschuss" className="flex-1">
          <ScrambleIn
            text={cycleData.cycle.auecProfit?.toLocaleString("de") ?? "-"}
            characters="1234567890."
          />
        </StatisticTile>

        <StatisticTile label="Dein Anteil" className="flex-1">
          <ScrambleIn
            text={cycleData.myShare?.toLocaleString("de") ?? "-"}
            characters="1234567890."
          />
        </StatisticTile>
      </div>

      <p className="pt-2 text-center text-sm text-neutral-500">
        Dein Anteil wird anhand deiner verdienten SILC und dem gesamten
        aUEC-Überschuss berechnet.
      </p>

      <StatisticTile label="Status deiner Auszahlung" className="mt-4">
        {cycleData.myPayoutState === PayoutState.NotParticipating && (
          <span>-</span>
        )}
        {cycleData.myPayoutState === PayoutState.Ceded && (
          <span>Abgetreten</span>
        )}
        {cycleData.myPayoutState === PayoutState.AwaitingAcceptance && (
          <span className="text-red-500">Zustimmung ausstehend</span>
        )}
        {cycleData.myPayoutState === PayoutState.AwaitingPayout && (
          <span className="text-blue-500">Auszahlung ausstehend</span>
        )}
        {cycleData.myPayoutState === PayoutState.Disbursed && (
          <span className="text-green-500">Ausgezahlt</span>
        )}
        {cycleData.myPayoutState === PayoutState.Expired && (
          <span className="text-blue-500">Verfallen</span>
        )}
        {cycleData.myPayoutState === PayoutState.PayoutOverdue && (
          <span className="text-red-500">Überfällig</span>
        )}
      </StatisticTile>

      {cycleData.myPayoutState === PayoutState.Disbursed && (
        <p className="pt-2 text-center text-sm text-neutral-500">
          Auszahlung geleistet durch{" "}
          <CitizenLink citizen={cycleData.myParticipant!.disbursedBy} /> am{" "}
          {formatDate(cycleData.myParticipant!.disbursedAt)}.
        </p>
      )}

      {[PayoutState.NotParticipating, PayoutState.Disbursed].includes(
        cycleData.myPayoutState,
      ) === false && (
        <div className="mt-4 flex flex-col items-center justify-center gap-2 border-t border-white/5 pt-2">
          <div className="flex flex-col gap-2 text-center text-sm">
            <p>
              Um deinen Anteil ausgezahlt zu bekommen, musst du der Auszahlung
              zustimmen.
            </p>

            <p>
              <strong>Wichtig:</strong> Stimme der Auszahlung erst zu, wenn du
              dir im aktuellen Star Citizen Patch bereits einen Charakter
              erstellt hast. Solltest du noch keinen Charakter erstellt haben,
              wird die Auszahlung scheitern und dein Anteil unwiderruflich
              verloren gehen.
            </p>

            <p>
              Wenn du der Auszahlung bis zum Ende dieser Phase nicht zustimmst,
              wird dein Anteil verfallen und der Organisation gutgeschrieben.
            </p>
          </div>

          {cycleData.myPayoutState === PayoutState.AwaitingPayout && (
            <>
              <p className="text-sm text-green-500">
                Du hast der Auszahlung am{" "}
                {formatDate(cycleData.myParticipant!.acceptedAt)} zugestimmt.
              </p>

              <ToggleMyAcceptedButton cycleData={cycleData} />
            </>
          )}

          {cycleData.myPayoutState === PayoutState.AwaitingAcceptance && (
            <ToggleMyAcceptedButton cycleData={cycleData} />
          )}
        </div>
      )}

      <div className="mt-4 flex flex-col justify-center gap-4 border-t border-white/5 pt-4">
        <PhaseEndDate
          plannedEnd={cycleData.cycle.payoutEndsAt}
          actualEnd={cycleData.cycle.payoutEndedAt}
        />

        <p className="text-center text-sm">
          Nachdem deine Auszahlung getätigt wurde, ist dieser SINcome-Zeitraum
          für dich abgeschlossen.
        </p>
      </div>
    </Phase>
  );
};
