import { type EntityLog, type EntityLogAttribute } from "@prisma/client";
import clsx from "clsx";
import { FaInfoCircle } from "react-icons/fa";
import { TbCircleDot } from "react-icons/tb";
import ConfirmLog from "./ConfirmLog";
import styles from "./Handle.module.css";

interface Props {
  discordId: EntityLog & {
    attributes: EntityLogAttribute[];
  };
}

const DiscordId = ({ discordId }: Props) => {
  const confirmed = discordId.attributes.find(
    (attribute) => attribute.key === "confirmed"
  );

  return (
    <li key={discordId.id} className="relative rounded overflow-hidden">
      <div
        className={clsx({
          "absolute w-full h-20 border-t-4 border-x-4 bg-gradient-to-t from-neutral-800 to-blue-500/10 blue-border":
            !confirmed,
          [styles.blueBorder!]: !confirmed,
        })}
      />

      {!confirmed && (
        <div className="px-4 pt-4 flex items-start gap-2 relative z-10">
          <FaInfoCircle className="text-blue-500 grow-1 shrink-0 mt-1" />
          <div className="flex gap-4">
            <p className="font-bold">
              Dieser Eintrag wurde noch nicht bestätigt.
            </p>
            <ConfirmLog log={discordId} />
          </div>
        </div>
      )}

      <div
        className={clsx("flex gap-2 relative z-10", {
          "px-4 pt-2 pb-2 opacity-20 hover:opacity-100 transition-opacity":
            !confirmed,
        })}
      >
        <div className="h-[24px] flex items-center">
          <TbCircleDot />
        </div>

        <div className="flex-1">
          <p>{discordId.content}</p>

          <p className="text-neutral-500 text-sm">
            <time dateTime={discordId.createdAt.toISOString()}>
              {discordId.createdAt.toLocaleDateString("de-DE")}
            </time>
          </p>
        </div>
      </div>
    </li>
  );
};

export default DiscordId;
