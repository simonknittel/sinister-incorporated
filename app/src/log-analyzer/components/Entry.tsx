import { RelativeDate } from "@/common/components/RelativeDate";
import clsx from "clsx";
import { memo } from "react";
import styles from "./Entry.module.css";
import { gridTemplateColumns } from "./LogAnalyzer";
import { RSILink } from "./RSILink";

export interface IEntry {
  readonly key: string;
  readonly isoDate: Date;
  readonly target: string;
  readonly zone: string;
  readonly killer: string;
  readonly weapon: string;
  readonly damageType: string;
  readonly isNew?: boolean;
}

interface Props {
  readonly className?: string;
  readonly entry: IEntry;
}

export const Entry = memo(
  function Entry({ className, entry }: Props) {
    return (
      <tr
        className={clsx(
          "grid gap-4 h-14 -mx-2 first:mt-2",
          { [styles.Row]: entry.isNew },
          className,
        )}
        style={{
          gridTemplateColumns,
        }}
      >
        <td className="p-2 flex items-center relative">
          <RelativeDate date={entry.isoDate} updateInterval={10_000} />

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
          <RSILink handle={entry.killer} />
        </td>

        <td className="p-2 flex items-center truncate">
          <span className="truncate" title={entry.weapon}>
            {entry.weapon}
          </span>
        </td>

        <td className="p-2 flex items-center truncate">
          <span className="truncate" title={entry.damageType}>
            {entry.damageType}
          </span>
        </td>

        <td className="p-2 flex items-center truncate">
          <span className="truncate" title={entry.zone}>
            {entry.zone}
          </span>
        </td>
      </tr>
    );
  },
  (previousProps, nextProps) => previousProps.entry.key === nextProps.entry.key,
);
