import {
  type Entity,
  type EntityLog,
  type EntityLogAttribute,
  type User,
} from "@prisma/client";
import { FaListAlt } from "react-icons/fa";
import { authenticateAndAuthorize } from "~/app/_utils/authenticateAndAuthorize";
import AddNote from "./AddNote";
import NoteSection from "./NoteSection";

interface Props {
  entity: Entity & {
    logs: (EntityLog & {
      attributes: (EntityLogAttribute & { createdBy: User })[];
    })[];
  };
}

const Notes = async ({ entity }: Props) => {
  const notes = entity.logs
    .filter((log) => log.type === "note")
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <section className="rounded p-4 lg:p-8 bg-neutral-900 col-span-2">
      <h2 className="font-bold flex gap-2 items-center">
        <FaListAlt /> Notizen
      </h2>

      {(await authenticateAndAuthorize("add-note")) && (
        <AddNote entity={entity} />
      )}

      {/* {(await authenticateAndAuthorize("add-note")) && (
        <AddNoteSA entity={entity} />
      )} */}

      {notes.map((log) => (
        <NoteSection key={log.id} log={log} />
      ))}

      {notes.length <= 0 && (
        <p className="text-neutral-500 italic mt-4">
          Bisher gibt es keine Notizen
        </p>
      )}
    </section>
  );
};

export default Notes;
