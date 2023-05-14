import { type EntityLog } from "@prisma/client";
import clsx from "clsx";
import { FaInfoCircle } from "react-icons/fa";
import { TbCircleDot } from "react-icons/tb";
import ConfirmNote from "./ConfirmNote";
import styles from "./NoteSection.module.css";

interface Props {
  log: EntityLog;
}

const NoteSection = ({ log }: Props) => {
  return (
    <article
      key={log.id}
      className="mt-4 lg:mt-8 relative rounded overflow-hidden"
    >
      <div
        className={clsx({
          "absolute w-full h-24 border-t-4 border-x-4 bg-gradient-to-t from-neutral-900 to-blue-500/10 blue-border":
            !log.confirmed,
          [styles.blueBorder!]: !log.confirmed,
        })}
      />

      {!log.confirmed && (
        <div className="px-4 pt-4 flex items-start gap-2 relative z-10">
          <FaInfoCircle className="text-blue-500 grow-1 shrink-0 mt-1" />
          <div className="flex gap-4">
            <p className="font-bold">Diese Notiz wurde noch nicht bestätigt.</p>
            <ConfirmNote log={log} />
          </div>
        </div>
      )}

      <div
        className={clsx("flex gap-2 relative z-10", {
          "px-4 pt-4 opacity-20 hover:opacity-100 transition-opacity":
            !log.confirmed,
        })}
      >
        <div className="h-[24px] flex items-center">
          <TbCircleDot />
        </div>

        <div className="flex-1">
          <div>
            <pre className="font-sans whitespace-pre-wrap">{log.content}</pre>
          </div>

          <time
            className="text-neutral-500"
            dateTime={log.createdAt.toISOString()}
          >
            {log.createdAt.toLocaleDateString("de-DE")}
          </time>
        </div>
      </div>
    </article>
  );
};

export default NoteSection;
