"use client";

import { Button2 } from "@/modules/common/components/Button2";
import type { getProfitDistributionCyclesById } from "@/modules/silc/queries";
import clsx from "clsx";

interface Props {
  readonly className?: string;
  readonly cycleData: NonNullable<
    Awaited<ReturnType<typeof getProfitDistributionCyclesById>>
  >;
}

export const EndCollectionPhaseButton = ({ className, cycleData }: Props) => {
  {
    /* TODO: Implement functionality incl. confirmation prompt */
  }

  return (
    <Button2
      variant="secondary"
      disabled={cycleData.currentPhase !== 1}
      className={clsx(className)}
    >
      Phase beenden
    </Button2>
  );
};
