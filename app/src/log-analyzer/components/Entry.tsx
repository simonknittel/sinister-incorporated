import { useAuthentication } from "@/auth/hooks/useAuthentication";
import { Link } from "@/common/components/Link";
import { formatDate } from "@/common/utils/formatDate";
import clsx from "clsx";
import { FaExternalLinkAlt } from "react-icons/fa";
import styles from "./Entry.module.css";
import { gridTemplateColumns } from "./LogAnalyzer";

export interface IEntry {
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

export const Entry = ({ className, entry }: Props) => {
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
        {formatDate(entry.isoDate)}

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
        <span className="truncate">{entry.weapon}</span>
      </td>

      <td className="p-2 flex items-center truncate">
        <span className="truncate">{entry.damageType}</span>
      </td>

      <td className="p-2 flex items-center truncate">
        <span className="truncate">{entry.zone}</span>
      </td>
    </tr>
  );
};

interface RSILinkProps {
  readonly handle: string;
}

const RSILink = ({ handle }: RSILinkProps) => {
  const authentication = useAuthentication();

  if (handle.includes("_"))
    return (
      <span className="text-neutral-500 flex items-center h-full p-2">
        <span className="truncate">{handle}</span>
      </span>
    );

  const isMe =
    authentication && authentication.session.entity?.handle === handle;

  if (isMe)
    return (
      <span className="text-me flex items-center h-full p-2">
        <span className="truncate">{handle}</span>
      </span>
    );

  return (
    <Link
      href={`https://robertsspaceindustries.com/citizens/${handle}`}
      className="hover:background-secondary focus-visible:background-secondary rounded-secondary flex items-center gap-2 h-full p-2 text-rsi-blue-200"
      rel="noreferrer"
      target="_blank"
    >
      <span className="truncate">{handle}</span>
      <FaExternalLinkAlt className="text-xs opacity-50 flex-none" />
    </Link>
  );
};
