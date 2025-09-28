import clsx from "clsx";
import { EntryType, type IEntry } from "./Entry";
import { RSILink } from "./RSILink";

interface Props {
  readonly className?: string;
  entry: IEntry;
}

export const TargetCell = ({ className, entry }: Props) => {
  return (
    <td className={clsx("overflow-hidden", className)}>
      {entry.type === EntryType.Kill && <RSILink handle={entry.target} />}

      {entry.type === EntryType.Corpse && <RSILink handle={entry.target} />}

      {entry.type === EntryType.JoinPu && (
        <div className="px-2 h-full flex items-center">
          <span title={entry.shard} className="truncate">
            {entry.shard}
          </span>
        </div>
      )}

      {entry.type === EntryType.ContestedZoneElevator && (
        <div className="px-2 h-full flex items-center">
          <span title={entry.elevatorName} className="truncate">
            {entry.elevatorName}
          </span>
        </div>
      )}
    </td>
  );
};
