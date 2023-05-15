import {
  type EntityLog,
  type EntityLogAttribute,
  type User,
} from "@prisma/client";
import clsx from "clsx";
import { FaInfoCircle } from "react-icons/fa";
import { TbCircleDot } from "react-icons/tb";
import ConfirmLog from "./ConfirmLog";
import styles from "./Handle.module.css";

interface Props {
  log: EntityLog & {
    attributes: (EntityLogAttribute & { createdBy: User })[];
  };
}

const Handle = ({ log }: Props) => {
  const confirmation = log.attributes.find(
    (attribute) => attribute.key === "confirmed"
  );

  return (
    <li key={log.id} className="relative rounded overflow-hidden">
      <div
        className={clsx({
          "absolute w-full h-20 border-t-4 border-x-4 bg-gradient-to-t from-neutral-800 to-blue-500/10 blue-border":
            !confirmation,
          [styles.blueBorder!]: !confirmation,
        })}
      />

      {!confirmation && (
        <div className="px-4 pt-4 flex items-start gap-2 relative z-10">
          <FaInfoCircle className="text-blue-500 grow-1 shrink-0 mt-1" />
          <div className="flex gap-4">
            <p className="font-bold">
              Dieser Eintrag ist noch nicht bestätigt.
            </p>
            <ConfirmLog log={log} />
          </div>
        </div>
      )}

      <div
        className={clsx("flex gap-2 relative z-10", {
          "px-4 pt-2 pb-2 opacity-20 hover:opacity-100 transition-opacity":
            !confirmation,
        })}
      >
        <div className="h-[20px] flex items-center">
          <TbCircleDot />
        </div>

        <div className="flex-1">
          <div className="text-sm flex gap-2 border-b-2 pb-1 items-baseline border-neutral-900">
            <p>
              <time dateTime={log.createdAt.toISOString()}>
                {log.createdAt.toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </time>
            </p>

            {confirmation && (
              <>
                <span className="text-neutral-500">&bull;</span>

                <p>Bestätigt durch {confirmation.createdBy.name}</p>
              </>
            )}
          </div>

          <p className="mt-1">{log.content}</p>
        </div>
      </div>
    </li>
  );
};

export default Handle;
