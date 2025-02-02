import clsx from "clsx";
import { FaLock } from "react-icons/fa";

type Props = Readonly<{
  className?: string;
}>;

export const RolesSkeleton = ({ className }: Props) => {
  return (
    <section
      className={clsx(
        className,
        "rounded-2xl p-4 lg:p-8 bg-neutral-800/50  flex flex-col animate-pulse min-h-[22.5rem]",
      )}
    >
      <h2 className="font-bold flex gap-2 items-center">
        <FaLock /> Rollen
      </h2>
    </section>
  );
};
