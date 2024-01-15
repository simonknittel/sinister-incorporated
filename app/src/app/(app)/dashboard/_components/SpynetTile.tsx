import { type Entity } from "@prisma/client";
import clsx from "clsx";
import Link from "next/link";
import Button from "~/app/_components/Button";

interface Props {
  className?: string;
  entity?: Entity;
}

export const SpynetTile = ({ className, entity }: Readonly<Props>) => {
  if (!entity)
    return (
      <section className={clsx(className, "rounded p-4 lg:p-8 bg-neutral-900")}>
        <h2 className="font-bold">Mein Spynet</h2>
        <p className="text-neutral-500 italic mt-4">Kein Spynet-Eintrag</p>
      </section>
    );

  return (
    <section className={clsx(className, "rounded p-4 lg:p-8 bg-neutral-900")}>
      <h2 className="font-bold mb-4">Mein Spynet</h2>

      <Link href={`/spynet/entity/${entity.id}`}>
        <Button>Zum Eintrag</Button>
      </Link>
    </section>
  );
};
