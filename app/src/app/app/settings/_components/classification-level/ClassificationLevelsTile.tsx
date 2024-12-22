import { Actions } from "@/common/components/Actions";
import { prisma } from "@/db";
import clsx from "clsx";
import Create from "./Create";
import Delete from "./Delete";
import Update from "./Update";

interface Props {
  className?: string;
}

const ClassificationLevelsTile = async ({ className }: Readonly<Props>) => {
  const classificationLevels = await prisma.classificationLevel.findMany();

  const sortedClassificationLevels = classificationLevels.toSorted((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <section
      className={clsx(
        className,
        "max-w-4xl p-4 lg:p-8 rounded-2xl bg-neutral-800/50 ",
      )}
    >
      <h2 className="font-bold text-xl">Geheimhaltungsstufen</h2>

      <p className="mt-4 mb-4 text-sm">
        Jeder Notiz kann eine Geheimhaltungsstufe zugewiesen werden. Anhand
        dieser können Berechtigungen vergeben werden.
      </p>

      {sortedClassificationLevels.map((classificationLevel) => (
        <div
          key={classificationLevel.id}
          className="flex justify-between gap-2 py-2 items-center"
        >
          <div className="flex flex-col">
            <p className="font-bold">{classificationLevel.name}</p>
            <p className="text-neutral-500 text-sm">{classificationLevel.id}</p>
          </div>

          <div className="flex gap-4 items-center">
            <Actions>
              <Update classificationLevel={classificationLevel} />
              <Delete classificationLevel={classificationLevel} />
            </Actions>
          </div>
        </div>
      ))}

      {sortedClassificationLevels.length <= 0 && (
        <p className="text-neutral-500 italic">
          Keine Geheimhaltungsstufen vorhanden
        </p>
      )}

      <Create className="mt-4" />
    </section>
  );
};

export default ClassificationLevelsTile;
