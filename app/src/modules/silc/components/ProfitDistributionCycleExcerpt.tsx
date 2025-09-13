import { requireAuthentication } from "@/modules/auth/server";
import { AccordeonLink } from "@/modules/common/components/Accordeon";
import { formatDate } from "@/modules/common/utils/formatDate";
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
        className={clsx(
          "background-secondary hover:bg-neutral-800 active:bg-neutral-900 rounded-secondary flex",
          className,
        )}
      >
        <div className="flex-1 p-2">
          <h2 className="font-bold">{cycle.title}</h2>

          <div className="flex">
            <div className="flex flex-col justify-center py-1 text-sm">
              <h3 className="text-gray-500">Endet am</h3>

              {cycle.collectionEndedAt ? (
                <p>{formatDate(cycle.collectionEndedAt)}</p>
              ) : (
                <p className="text-neutral-500">-</p>
              )}
            </div>
          </div>
        </div>

        <AccordeonLink title="Details öffnen" className="flex-none" />
      </Link>
    );
};
