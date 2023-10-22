"use client";

import {
  type EntityLog,
  type EntityLogAttribute,
  type User,
} from "@prisma/client";
import clsx from "clsx";
import { BsExclamationOctagonFill } from "react-icons/bs";
import { FaInfoCircle } from "react-icons/fa";
import { TbCircleDot } from "react-icons/tb";
import useAuthentication from "~/app/_lib/auth/useAuthentication";
import ConfirmLog from "../ConfirmLog";
import styles from "../ConfirmationGradient.module.css";
import DeleteLog from "../DeleteLog";

interface Props {
  log: EntityLog & {
    attributes: (EntityLogAttribute & { createdBy: User })[];
    submittedBy: User;
  };
}

const SingleDiscordId = ({ log }: Readonly<Props>) => {
  const authentication = useAuthentication();

  const confirmed = log.attributes.find(
    (attribute) => attribute.key === "confirmed",
  );

  return (
    <li key={log.id} className="relative rounded overflow-hidden">
      <div
        className={clsx({
          "absolute w-full h-20 border-t-2 border-x-2 bg-gradient-to-t from-neutral-800":
            !confirmed || confirmed?.value === "falseReport",
          [`${styles.blueBorder!} to-blue-500/10`]: !confirmed,
          [`${styles.redBorder!} to-red-500/10`]:
            confirmed?.value === "falseReport",
        })}
      />

      {!confirmed && (
        <div className="px-4 pt-4 flex items-start gap-2 relative z-10">
          <FaInfoCircle className="text-blue-500 grow-1 shrink-0 mt-1" />
          <div className="flex gap-4">
            <p className="font-bold">
              Dieser Eintrag ist noch nicht bestätigt.
            </p>

            {authentication &&
              authentication.authorize([
                {
                  resource: "discordId",
                  operation: "confirm",
                },
              ]) && <ConfirmLog log={log} />}
          </div>
        </div>
      )}

      {confirmed?.value === "falseReport" && (
        <div className="px-4 pt-4 flex items-start gap-2 relative z-10">
          <BsExclamationOctagonFill className="text-red-500 grow-1 shrink-0 mt-1" />
          <p className="font-bold">Falschmeldung</p>
        </div>
      )}

      <div
        className={clsx("flex gap-2 relative z-10", {
          "px-4 pt-2 pb-2 opacity-20 hover:opacity-100 transition-opacity":
            !confirmed || confirmed.value === "falseReport",
        })}
      >
        <div className="h-[20px] flex items-center">
          <TbCircleDot />
        </div>

        <div className="flex-1">
          <div className="text-sm flex gap-2 border-b pb-1 items-baseline border-neutral-700">
            <p>
              <time dateTime={log.createdAt.toISOString()}>
                {log.createdAt.toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </time>
            </p>

            <span className="text-neutral-500">&bull;</span>
            <p>Eingereicht von {log.submittedBy.name}</p>

            {confirmed && (
              <>
                <span className="text-neutral-500">&bull;</span>

                <p>Bestätigt von {confirmed.createdBy.name}</p>
              </>
            )}

            <span className="text-neutral-500">&bull;</span>

            {authentication &&
              authentication.authorize([
                {
                  resource: "discordId",
                  operation: "delete",
                },
              ]) && <DeleteLog log={log} />}
          </div>

          <p>{log.content}</p>
        </div>
      </div>
    </li>
  );
};

export default SingleDiscordId;
