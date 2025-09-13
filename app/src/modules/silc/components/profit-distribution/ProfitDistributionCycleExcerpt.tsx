import { AccordeonLink } from "@/modules/common/components/Accordeon";
import { Badge } from "@/modules/common/components/Badge";
import clsx from "clsx";
import Link from "next/link";
import type { getProfitDistributionCycles } from "../../queries";
import { PayoutState } from "../../utils/getMyPayoutStatus";

interface Props {
  readonly className?: string;
  readonly cycleData: Awaited<
    ReturnType<typeof getProfitDistributionCycles>
  >[number];
}

export const ProfitDistributionCycleExcerpt = ({
  className,
  cycleData,
}: Props) => {
  let myShareBadge;
  switch (cycleData.myPayoutState) {
    case PayoutState.NOT_PARTICIPATING:
      myShareBadge = (
        <Badge label="Status deiner Auszahlung" showLabel value="-" />
      );
      break;

    case PayoutState.AWAITING_ACCEPTANCE:
      myShareBadge = (
        <Badge
          label="Status deiner Auszahlung"
          showLabel
          value="Zustimmung von dir ausstehend"
        />
      );
      break;

    case PayoutState.AWAITING_PAYOUT:
      myShareBadge = (
        <Badge
          label="Status deiner Auszahlung"
          showLabel
          value="Auszahlung von Economics ausstehend"
        />
      );
      break;

    case PayoutState.DISBURSED:
      myShareBadge = (
        <Badge label="Status deiner Auszahlung" showLabel value="Ausgezahlt" />
      );
      break;

    case PayoutState.EXPIRED:
      myShareBadge = (
        <Badge label="Status deiner Auszahlung" showLabel value="Verfallen" />
      );
      break;

    case PayoutState.PAYOUT_OVERDUE:
      myShareBadge = (
        <Badge label="Status deiner Auszahlung" showLabel value="Überfällig" />
      );
      break;

    case PayoutState.UNKNOWN:
    default:
      myShareBadge = (
        <Badge label="Status deiner Auszahlung" showLabel value="Unbekannt" />
      );
      break;
  }

  return (
    <Link
      href={`/app/silc/profit-distribution/${cycleData.cycle.id}`}
      className={clsx(
        "background-secondary hover:bg-neutral-800 active:bg-neutral-900 rounded-secondary flex",
        className,
      )}
    >
      <div className="flex-1 p-2 flex flex-col gap-1">
        <h2 className="font-bold">{cycleData.cycle.title}</h2>

        {/* <div className="flex">
          <div className="flex flex-col justify-center py-1 text-sm">
            <h3 className="text-gray-500">Endet am</h3>
            <p>{formatDate(cycle.collectionEndedAt)}</p>
          </div>
        </div> */}

        <div className="flex flex-wrap gap-[2px] text-sm">
          {cycleData.currentPhase === 1 && (
            <>
              <Badge label="Aktuelle Phase" showLabel value="Sammelphase" />
              <Badge
                label="Von dir verdiente SILC"
                showLabel
                value={cycleData.mySilcBalance.toString()}
              />
            </>
          )}

          {cycleData.currentPhase === 2 && (
            <>
              <Badge
                label="Aktuelle Phase"
                showLabel
                value="Auszahlung wird vorbereitet"
              />
              <Badge
                label="Von dir verdiente SILC"
                showLabel
                value={cycleData.mySilcBalance.toString()}
              />
            </>
          )}

          {cycleData.currentPhase === 3 && (
            <>
              <Badge label="Aktuelle Phase" showLabel value="Auszahlung" />
              <Badge
                label="Dein aUEC-Anteil"
                showLabel
                value={cycleData.myShare}
              />
              {myShareBadge}
            </>
          )}

          {cycleData.currentPhase === 4 && (
            <>
              <Badge
                label="Aktuelle Phase"
                showLabel
                value="Auszahlung abgeschlossen"
              />
              <Badge
                label="Dein aUEC-Anteil"
                showLabel
                value={cycleData.myShare}
              />
              {myShareBadge}
            </>
          )}
        </div>
      </div>

      <AccordeonLink title="Details öffnen" className="flex-none" />
    </Link>
  );
};
