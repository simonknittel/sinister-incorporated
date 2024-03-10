import clsx from "clsx";
import { Wip } from "../../../_components/Wip";

type Props = Readonly<{
  className?: string;
}>;

export const EventsTile = ({ className }: Props) => {
  return (
    <section
      className={clsx(
        className,
        "rounded-2xl p-4 lg:p-8 bg-neutral-800/50 backdrop-blur min-h-64 flex flex-col",
      )}
      style={{ gridArea: "events" }}
    >
      <h2 className="font-bold mb-4">Anstehende Events und Operationen</h2>

      <div className="flex-1 flex flex-col items-center">
        <Wip />
      </div>
    </section>
  );
};
