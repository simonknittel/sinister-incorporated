import clsx from "clsx";
import { prisma } from "~/server/db";
import Create from "./Create";
import Delete from "./Delete";
import Update from "./Update";

interface Props {
  className?: string;
}

const ClassificationLevelsTile = async ({ className }: Props) => {
  const classificationLevels = await prisma.classificationLevel.findMany();

  const sortedClassificationLevels = classificationLevels.sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <section
      className={clsx(className, "max-w-4xl p-4 lg:p-8 rounded bg-neutral-900")}
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
          <div className="flex gap-2 items-baseline">
            <p className="font-bold">{classificationLevel.name}</p>
            <p className="text-neutral-500 text-sm">{classificationLevel.id}</p>
          </div>

          <div className="flex gap-4 items-center">
            <Update classificationLevel={classificationLevel} />
            <Delete classificationLevel={classificationLevel} />
          </div>
        </div>
      ))}

      <Create className="mt-4" />
    </section>
  );
};

export default ClassificationLevelsTile;
