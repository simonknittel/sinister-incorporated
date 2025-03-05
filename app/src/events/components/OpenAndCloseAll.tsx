import clsx from "clsx";
import { useLineup } from "./LineupContext";

type Props = Readonly<{
  className?: string;
}>;

export const OpenAndCloseAll = ({ className }: Props) => {
  const { openAll, closeAll } = useLineup();

  return (
    <div className={clsx("flex gap-2", className)}>
      <button
        onClick={openAll}
        className="text-sinister-red-500 hover:text-sinister-red-300 focus-visible:text-sinister-red-300 hover:underline focus-visible:underline"
      >
        Alle öffnen
      </button>
      /
      <button
        onClick={closeAll}
        className="text-sinister-red-500 hover:text-sinister-red-300 focus-visible:text-sinister-red-300 hover:underline focus-visible:underline"
      >
        schließen
      </button>
    </div>
  );
};
