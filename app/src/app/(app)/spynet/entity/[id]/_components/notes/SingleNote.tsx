import {
  type EntityLog,
  type EntityLogAttribute,
  type User,
} from "@prisma/client";
import clsx from "clsx";
import { Suspense } from "react";
import { BsExclamationOctagonFill } from "react-icons/bs";
import { FaInfoCircle } from "react-icons/fa";
import { TbCircleDot } from "react-icons/tb";
import { authenticate } from "~/_lib/auth/authenticateAndAuthorize";
import getLatestNoteAttributes from "~/app/_lib/getLatestNoteAttributes";
import ConfirmLog from "../ConfirmLog";
import styles from "../ConfirmationGradient.module.css";
import DeleteLog from "../DeleteLog";
import ClassificationLevel from "./ClassificationLevel";
import ClassificationLevelSkeleton from "./ClassificationLevelSkeleton";
import UpdateNote from "./UpdateNote";

interface Props {
  note: EntityLog & {
    attributes: (EntityLogAttribute & { createdBy: User })[];
    submittedBy: User;
  };
}

const SingleNote = async ({ note }: Readonly<Props>) => {
  const authentication = await authenticate();

  const { noteTypeId, classificationLevelId, confirmed } =
    getLatestNoteAttributes(note);

  const authorizationAttributes = [];

  if (noteTypeId) {
    authorizationAttributes.push({
      key: "noteTypeId",
      value: noteTypeId.value,
    });
  }

  if (classificationLevelId) {
    authorizationAttributes.push({
      key: "classificationLevelId",
      value: classificationLevelId.value,
    });
  }

  if (!confirmed || confirmed.value !== "confirmed") {
    authorizationAttributes.push({
      key: "alsoUnconfirmed",
      value: true,
    });
  }

  return (
    <article className="mt-4 lg:mt-8 relative rounded overflow-hidden">
      <div
        className={clsx({
          "absolute w-full h-24 border-t-2 border-x-2 bg-gradient-to-t from-neutral-900":
            !confirmed || confirmed?.value === "false-report",
          [`${styles.blueBorder!} to-blue-500/10`]: !confirmed,
          [`${styles.redBorder!} to-red-500/10`]:
            confirmed?.value === "false-report",
        })}
      />

      {!confirmed && (
        <div className="px-4 pt-4 flex gap-2 relative z-10 items-start">
          <FaInfoCircle className="text-blue-500 grow-1 shrink-0 mt-[2px]" />
          <div className="flex gap-2 lg:gap-4 flex-wrap">
            <p className="font-bold text-sm">
              Diese Notiz ist noch nicht bestätigt.
            </p>

            {authentication &&
              authentication.authorize([
                {
                  resource: "note",
                  operation: "confirm",
                  attributes: authorizationAttributes,
                },
              ]) && <ConfirmLog log={note} />}
          </div>
        </div>
      )}

      {confirmed?.value === "false-report" && (
        <div className="px-4 pt-4 flex items-start gap-2 relative z-10">
          <BsExclamationOctagonFill className="text-red-500 grow-1 shrink-0 mt-1" />
          <p className="font-bold">Falschmeldung</p>
        </div>
      )}

      <div
        className={clsx("flex gap-2 relative z-10", {
          "px-4 pt-4 opacity-20 hover:opacity-100 transition-opacity":
            !confirmed || confirmed.value === "false-report",
        })}
      >
        <div className="h-[20px] flex items-center">
          <TbCircleDot />
        </div>

        <div className="flex-1">
          <div className="text-sm flex gap-2 border-b pb-2 items-center border-neutral-800 flex-wrap text-neutral-500">
            <p>
              <time dateTime={note.createdAt.toISOString()}>
                {note.createdAt.toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </time>
            </p>

            <span>&bull;</span>

            <Suspense fallback={<ClassificationLevelSkeleton />}>
              <ClassificationLevel note={note} />
            </Suspense>

            <span>&bull;</span>
            <p>Eingereicht von {note.submittedBy.name}</p>

            {confirmed && (
              <>
                <span>&bull;</span>
                <p>Bestätigt von {confirmed.createdBy.name}</p>
              </>
            )}

            {authentication &&
              authentication.authorize([
                {
                  resource: "note",
                  operation: "update",
                  attributes: authorizationAttributes,
                },
              ]) && (
                <Suspense>
                  <UpdateNote note={note} />
                </Suspense>
              )}

            {authentication &&
              authentication.authorize([
                {
                  resource: "note",
                  operation: "delete",
                  attributes: authorizationAttributes,
                },
              ]) && (
                <>
                  <span>&bull;</span>
                  <DeleteLog log={note} />
                </>
              )}
          </div>

          <div className="mt-2">
            <pre className="font-sans whitespace-pre-wrap">{note.content}</pre>
          </div>
        </div>
      </div>
    </article>
  );
};

export default SingleNote;
