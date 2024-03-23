import clsx from "clsx";
import { FaListAlt } from "react-icons/fa";

type Props = Readonly<{
  className?: string;
}>;

export const NotesSkeleton = ({ className }: Props) => {
  return (
    <section
      className={clsx(
        className,
        "rounded-2xl p-4 lg:p-8 bg-neutral-800/50 col-span-2 animate-pulse min-h-[22.5rem]",
      )}
    >
      <h2 className="font-bold flex gap-2 items-center">
        <FaListAlt /> Notizen
      </h2>
    </section>
  );
};
