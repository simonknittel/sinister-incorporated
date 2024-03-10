import { type Operation, type OperationMember } from "@prisma/client";
import clsx from "clsx";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

interface Props {
  className?: string;
  operation: Operation & {
    members: OperationMember[];
  };
}

const OperationTile = ({ className, operation }: Readonly<Props>) => {
  return (
    <article
      className={clsx(
        className,
        "block bg-neutral-800/50 backdrop-blur rounded-2xl overflow-hidden",
      )}
    >
      <div className="flex flex-col lg:flex-row lg:justify-between gap-4 p-4 lg:p-8">
        <div className="flex flex-col gap-2">
          <h2 className="font-bold text-xl">{operation.title}</h2>

          <p>
            <span className="text-neutral-500">Teilnehmer:</span>{" "}
            {operation.members.length}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Link
            href={`/operations/${operation.id}`}
            className="flex items-center justify-center gap-4 rounded uppercase h-11 border text-base border-sinister-red-500 text-sinister-red-500 hover:border-sinister-red-300 active:border-sinister-red-300 hover:text-sinister-red-300 active:text-sinister-red-300 px-6"
            prefetch={false}
          >
            Öffnen <FaArrowRight />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default OperationTile;
