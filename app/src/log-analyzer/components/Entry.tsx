import { RelativeDate } from "@/common/components/RelativeDate";
import { formatDate } from "@/common/utils/formatDate";
import clsx from "clsx";
import { memo } from "react";
import styles from "./Entry.module.css";
import { gridTemplateColumns } from "./LogAnalyzer";
import { RSILink } from "./RSILink";

interface IBaseEntry {
  readonly key: string;
  readonly isoDate: Date;
  readonly isNew?: boolean;
}

interface IKillEntry extends IBaseEntry {
  readonly type: "kill";
  readonly target: string;
  readonly zone: string;
  readonly killer: string;
  readonly weapon: string;
  readonly damageType: string;
}

interface ICorpseEntry extends IBaseEntry {
  readonly type: "corpse";
  readonly target: string;
}

export type IEntry = IKillEntry | ICorpseEntry;

interface Props {
  readonly className?: string;
  readonly entry: IEntry;
}

export const Entry = memo(
  function Entry({ className, entry }: Props) {
    const now = new Date();
    const showRelativeDate =
      entry.isoDate.getTime() > now.getTime() - 1000 * 60 * 60 * 24;

    return (
      <tr
        className={clsx(
          "grid gap-4 h-10 -mx-2 first:mt-2",
          { [styles.Row]: entry.isNew },
          className,
        )}
        style={{
          gridTemplateColumns,
        }}
      >
        <td className="p-2 flex items-center relative">
          {showRelativeDate ? (
            <RelativeDate date={entry.isoDate} updateInterval={10_000} />
          ) : (
            <time
              dateTime={entry.isoDate.toISOString()}
              title={formatDate(entry.isoDate) || undefined}
            >
              {formatDate(entry.isoDate)}
            </time>
          )}

          {entry.isNew && (
            <div
              className={clsx(
                "absolute left-0 top-0 bg-amber-500 text-black uppercase text-xs px-1 rounded-br-secondary",
                styles.New,
              )}
            >
              Neu
            </div>
          )}
        </td>

        <td className="truncate">
          <RSILink handle={entry.target} />
        </td>

        <td className="truncate">
          {entry.type === "kill" && <RSILink handle={entry.killer} />}
          {entry.type === "corpse" && (
            <div className="text-neutral-500 p-2 h-full flex items-center">
              Leiche entdeckt
            </div>
          )}
        </td>

        <td className="p-2 flex items-center truncate">
          {entry.type === "kill" && (
            <span className="truncate" title={entry.weapon}>
              {entry.weapon}
            </span>
          )}
        </td>

        <td className="p-2 flex items-center truncate">
          {entry.type === "kill" && (
            <span className="truncate" title={entry.damageType}>
              {entry.damageType}
            </span>
          )}
        </td>

        <td className="p-2 flex items-center truncate">
          {entry.type === "kill" && (
            <span className="truncate" title={entry.zone}>
              {entry.zone}
            </span>
          )}
        </td>
      </tr>
    );
  },
  (previousProps, nextProps) => previousProps.entry.key === nextProps.entry.key,
);
