import { requireAuthentication } from "@/modules/auth/server";
import type { ProfitDistributionCycle } from "@prisma/client";
import clsx from "clsx";
import Link from "next/link";

interface Props {
  readonly className?: string;
  readonly cycle: ProfitDistributionCycle;
}

export const ProfitDistributionCycleExcerpt = async ({
  className,
  cycle,
}: Props) => {
  const authentication = await requireAuthentication();

  if (await authentication.authorize("profitDistributionCycle", "manage"))
    return (
      <Link
        href={`/app/silc/profit-distribution/${cycle.id}`}
        className={clsx(className)}
      >
        <h2>{cycle.title}</h2>
      </Link>
    );
};
