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
import type { getProfitDistributionCyclesById } from "@/modules/silc/queries";
import clsx from "clsx";
import { useId } from "react";
import { FaSpinner } from "react-icons/fa";
import { endCollectionPhase } from "../../actions/endCollectionPhase";

interface Props {
  readonly className?: string;
  readonly cycleData: NonNullable<
    Awaited<ReturnType<typeof getProfitDistributionCyclesById>>
  >;
}

export const EndCollectionPhaseButton = ({ className, cycleData }: Props) => {
  const { formAction, isPending } = useAction(endCollectionPhase);
  const id = useId();

  return (
    <form action={formAction} id={id} className={clsx(className)}>
      <input type="hidden" name="id" value={cycleData.cycle.id} />

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button2
            disabled={cycleData.currentPhase !== 1 || isPending}
            variant="secondary"
          >
            {isPending && <FaSpinner className="animate-spin" />}
            Phase beenden
          </Button2>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sammelphase beenden?</AlertDialogTitle>
            <AlertDialogDescription>
              Willst du die Sammelphase von &ldquo;{cycleData.cycle.title}
              &rdquo; beenden?
              <br />
              Es wird ein Abbild der aktuellen SILC-Konten von allen Membern
              erstellt. Im Anschluss werden die Konten auf 0 zurückgesetzt,
              womit die Sammelphase des nächsten Gewinnverteilungszeitraums
              startet.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>

            <AlertDialogAction type="submit" form={id}>
              Beenden
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
};
