import { Link } from "@/common/components/Link";
import type { Entity, PenaltyEntry as PenaltyEntryType } from "@prisma/client";
import clsx from "clsx";
import { DeletePenaltyEntry } from "./DeletePenaltyEntry";

type Props = Readonly<{
  className?: string;
  entry: PenaltyEntryType & {
    createdBy: Entity;
  };
  showDelete?: boolean;
}>;

export const PenaltyEntry = ({ className, entry, showDelete }: Props) => {
  return (
    <article className={clsx(className)}>
      <div className="text-sm flex gap-2 border-b pb-1 items-center border-neutral-800/50 flex-wrap text-neutral-500">
        <p>
          Punkte: <span className="font-bold">{entry.points}</span>
        </p>

        <span>&bull;</span>

        <p>
          Am:{" "}
          <time dateTime={entry.createdAt.toISOString()}>
            {entry.createdAt.toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Europe/Berlin",
            })}
          </time>
        </p>

        <span>&bull;</span>

        <p>
          Von:{" "}
          <Link
            href={`/app/spynet/citizen/${entry.createdById}`}
            className="text-sinister-red-500 hover:underline"
            prefetch={false}
          >
            {entry.createdBy.handle}
          </Link>
        </p>

        <span>&bull;</span>

        <p>
          Verfällt:{" "}
          {entry.expiresAt ? (
            <time dateTime={entry.expiresAt.toISOString()}>
              {entry.expiresAt.toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Europe/Berlin",
              })}
            </time>
          ) : (
            "-"
          )}
        </p>

        {showDelete && (
          <>
            <span>&bull;</span>
            <DeletePenaltyEntry entry={entry} />
          </>
        )}
      </div>

      <div className="mt-1">
        <pre className="font-sans whitespace-pre-wrap">
          {entry.reason ? (
            entry.reason
          ) : (
            <span className="italic">Keine Begründung vorhanden</span>
          )}
        </pre>
      </div>
    </article>
  );
};
