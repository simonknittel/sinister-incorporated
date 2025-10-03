"use client";

import { useAction } from "@/modules/actions/utils/useAction";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/modules/common/components/AlertDialog";
import { Button2 } from "@/modules/common/components/Button2";
import { DateInput } from "@/modules/common/components/form/DateInput";
import { NumberInput } from "@/modules/common/components/form/NumberInput";
import { StatisticTile } from "@/modules/common/components/StatisticTile";
import { useId, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { startPayoutPhase } from "../../actions/startPayoutPhase";
import type { getProfitDistributionCyclesById } from "../../queries";
import { Phase } from "./Phase";

interface Props {
  readonly cycleData: NonNullable<
    Awaited<ReturnType<typeof getProfitDistributionCyclesById>>
  >;
}

export const Phase2 = ({ cycleData }: Props) => {
  const { formAction, isPending } = useAction(startPayoutPhase);
  const id = useId();
  const [auecProfit, setAuecProfit] = useState(cycleData.cycle.auecProfit || 0);

  const totalSilc = cycleData.cycle.participants.reduce(
    (total, participant) => total + (participant.silcBalanceSnapshot || 0),
    0,
  );
  const auecPerSilc = totalSilc > 0 ? Math.round(auecProfit / totalSilc) : 0;

  return (
    <Phase phase={2} currentPhase={cycleData.currentPhase}>
      <form action={formAction} id={id}>
        <input type="hidden" name="id" value={cycleData.cycle.id} />

        <h2 className="text-center font-bold">Vorbereitung der Auszahlung</h2>

        <div className="flex border-t border-white/5 mt-4 pt-4">
          <div className="w-full max-w-80 mx-auto text-center">
            <NumberInput
              name="auecProfit"
              label="Gesamter aUEC-Überschuss"
              disabled={cycleData.currentPhase !== 2}
              value={auecProfit}
              onChange={(e) => setAuecProfit(e.target.valueAsNumber || 0)}
              min={0}
              step={0}
            />
          </div>

          <div className="w-full max-w-80 mx-auto text-center">
            <DateInput
              name="payoutEndedAt"
              label="Auszahlungsphase endet am"
              disabled={cycleData.currentPhase !== 2}
              defaultValue={
                cycleData.cycle.payoutEndedAt?.toISOString().split("T")[0] || ""
              }
            />
          </div>
        </div>

        <div className="flex gap-[2px] mt-4">
          <StatisticTile
            label="aUEC pro SILC (kaufmännisch gerundet)"
            className="flex-1"
          >
            {auecPerSilc.toLocaleString("de")}
          </StatisticTile>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button2
              disabled={cycleData.currentPhase !== 2 || isPending}
              variant="secondary"
              className="mx-auto mt-4"
            >
              {isPending && <FaSpinner className="animate-spin" />}
              Auszahlungsphase starten
            </Button2>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Auszahlungsphase beenden?</AlertDialogTitle>
              <AlertDialogDescription>
                Willst du die Auszahlungsphase von &ldquo;
                {cycleData.cycle.title}
                &rdquo; starten?
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>

              <AlertDialogAction type="submit" form={id}>
                Starten
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </form>
    </Phase>
  );
};
