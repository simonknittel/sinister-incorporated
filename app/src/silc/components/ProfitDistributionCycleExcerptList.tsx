import clsx from "clsx";
import { getProfitDistributionCycles } from "../queries";
import { ProfitDistributionCycleExcerpt } from "./ProfitDistributionCycleExcerpt";

interface Props {
  readonly className?: string;
}

export const ProfitDistributionCycleExcerptList = async ({
  className,
}: Props) => {
  const profitDistributionCycles = await getProfitDistributionCycles();

  return (
    <div className={clsx("flex flex-col gap-2", className)}>
      {profitDistributionCycles.length > 0 ? (
        profitDistributionCycles.map((cycle) => (
          <ProfitDistributionCycleExcerpt key={cycle.id} cycle={cycle} />
        ))
      ) : (
        <div className="rounded-primary background-secondary p-4 text-center">
          <p>Keine Gewinnverteilungszyklen gefunden</p>
        </div>
      )}
    </div>
  );
};
