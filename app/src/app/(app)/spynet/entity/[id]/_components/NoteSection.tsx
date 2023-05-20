import {
  type EntityLog,
  type EntityLogAttribute,
  type User,
} from "@prisma/client";
import clsx from "clsx";
import { FaInfoCircle } from "react-icons/fa";
import { TbCircleDot } from "react-icons/tb";
import { authenticateAndAuthorize } from "~/app/_utils/authenticateAndAuthorize";
import ChangeSecurityLevel from "./ChangeSecurityLevel";
import ConfirmLog from "./ConfirmLog";
import DeleteLog from "./DeleteLog";
import styles from "./NoteSection.module.css";

interface Props {
  log: EntityLog & {
    attributes: (EntityLogAttribute & { createdBy: User })[];
  };
}

const NoteSection = async ({ log }: Props) => {
  const confirmation = log.attributes.find(
    (attribute) => attribute.key === "confirmed"
  );

  return (
    <article
      key={log.id}
      className="mt-4 lg:mt-8 relative rounded overflow-hidden"
    >
      <div
        className={clsx({
          "absolute w-full h-24 border-t-4 border-x-4 bg-gradient-to-t from-neutral-900 to-blue-500/10 blue-border":
            !confirmation,
          [styles.blueBorder!]: !confirmation,
        })}
      />

      {!confirmation && (
        <div className="px-4 pt-4 flex items-start gap-2 relative z-10">
          <FaInfoCircle className="text-blue-500 grow-1 shrink-0 mt-1" />
          <div className="flex gap-4">
            <p className="font-bold">Diese Notiz ist noch nicht bestätigt.</p>

            {(await authenticateAndAuthorize("confirm-note")) && (
              <ConfirmLog log={log} />
            )}
          </div>
        </div>
      )}

      <div
        className={clsx("flex gap-2 relative z-10", {
          "px-4 pt-4 opacity-20 hover:opacity-100 transition-opacity":
            !confirmation,
        })}
      >
        <div className="h-[20px] flex items-center">
          <TbCircleDot />
        </div>

        <div className="flex-1">
          <div className="text-sm flex gap-2 border-b-2 pb-2 items-baseline border-neutral-800">
            <p>
              Erstellt am{" "}
              <time dateTime={log.createdAt.toISOString()}>
                {log.createdAt.toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </time>
            </p>

            <span className="text-neutral-500">&bull;</span>

            <p className="flex gap-2 items-center">
              Sicherheitsstufe Unbekannt <ChangeSecurityLevel log={log} />
            </p>

            {confirmation && (
              <>
                <span className="text-neutral-500">&bull;</span>

                <p>Bestätigt durch {confirmation.createdBy.name}</p>
              </>
            )}

            <span className="text-neutral-500">&bull;</span>

            {(await authenticateAndAuthorize("delete-note")) && (
              <DeleteLog log={log} />
            )}
          </div>

          <div className="mt-2">
            <pre className="font-sans whitespace-pre-wrap">{log.content}</pre>
          </div>
        </div>
      </div>
    </article>
  );
};

export default NoteSection;
