import clsx from "clsx";
import Actions from "~/app/_components/Actions";
import { prisma } from "~/server/db";
import Create from "./Create";
import Delete from "./Delete";
import Update from "./Update";

interface Props {
  className?: string;
}

const NoteTypesTile = async ({ className }: Readonly<Props>) => {
  const noteTypes = await prisma.noteType.findMany();

  const sortedNoteTypes = noteTypes.sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <section
      className={clsx(
        className,
        "max-w-4xl p-4 lg:p-8 rounded-2xl bg-neutral-900/50 backdrop-blur",
      )}
    >
      <h2 className="font-bold text-xl">Notizarten</h2>

      <p className="mt-4 mb-4 text-sm">
        Jeder Notiz kann eine Art zugewiesen werden. Anhand dieser können
        Berechtigungen vergeben werden.
      </p>

      {sortedNoteTypes.map((noteType) => (
        <div
          key={noteType.id}
          className="flex justify-between gap-2 py-2 items-center"
        >
          <div className="flex flex-col">
            <p className="font-bold">{noteType.name}</p>
            <p className="text-neutral-500 text-sm">{noteType.id}</p>
          </div>

          <div className="flex gap-4 items-center">
            <Actions>
              <Update noteType={noteType} />
              <Delete noteType={noteType} />
            </Actions>
          </div>
        </div>
      ))}

      {sortedNoteTypes.length <= 0 && (
        <p className="text-neutral-500 italic">Keine Notizarten vorhanden</p>
      )}

      <Create className="mt-4" />
    </section>
  );
};

export default NoteTypesTile;
