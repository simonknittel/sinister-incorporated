import {
  type EntityLog,
  type EntityLogAttribute,
  type User,
} from "@prisma/client";
import clsx from "clsx";
import { Suspense } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { TbCircleDot } from "react-icons/tb";
import { authenticate } from "~/app/_lib/auth/authenticateAndAuthorize";
import getLatestNoteAttributes from "~/app/_lib/getLatestNoteAttributes";
import ClassificationLevelSkeleton from "../ClassificationLevelSkeleton";
import ConfirmLog from "../ConfirmLog";
import styles from "../ConfirmationGradient.module.css";
import DeleteLog from "../DeleteLog";
import ClassificationLevel from "./ClassificationLevel";
import UpdateNote from "./UpdateNote";

interface Props {
  note: EntityLog & {
    attributes: (EntityLogAttribute & { createdBy: User })[];
    submittedBy: User;
  };
}

const SingleNote = async ({ note }: Props) => {
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

  if (!confirmed || confirmed.value !== "true") {
    authorizationAttributes.push({
      key: "alsoUnconfirmed",
      value: true,
    });
  }

  return (
    <article
      key={note.id}
      className="mt-4 lg:mt-8 relative rounded overflow-hidden"
    >
      <div
        className={clsx({
          "absolute w-full h-24 border-t-2 border-x-2 bg-gradient-to-t from-neutral-900 to-blue-500/10 blue-border":
            !confirmed,
          [styles.blueBorder!]: !confirmed,
        })}
      />

      {!confirmed && (
        <div className="px-4 pt-4 flex items-start gap-2 relative z-10">
          <FaInfoCircle className="text-blue-500 grow-1 shrink-0 mt-1" />
          <div className="flex gap-4">
            <p className="font-bold">Diese Notiz ist noch nicht bestätigt.</p>

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

      <div
        className={clsx("flex gap-2 relative z-10", {
          "px-4 pt-4 opacity-20 hover:opacity-100 transition-opacity":
            !confirmed,
        })}
      >
        <div className="h-[20px] flex items-center">
          <TbCircleDot />
        </div>

        <div className="flex-1">
          <div className="text-sm flex gap-2 border-b pb-2 items-center border-neutral-800">
            <p>
              <time dateTime={note.createdAt.toISOString()}>
                {note.createdAt.toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </time>
            </p>

            <span className="text-neutral-500">&bull;</span>

            <Suspense fallback={<ClassificationLevelSkeleton />}>
              <ClassificationLevel note={note} />
            </Suspense>

            <span className="text-neutral-500">&bull;</span>
            <p>Eingereicht von {note.submittedBy.name}</p>

            {confirmed && (
              <>
                <span className="text-neutral-500">&bull;</span>
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
                  <span className="text-neutral-500">&bull;</span>
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
