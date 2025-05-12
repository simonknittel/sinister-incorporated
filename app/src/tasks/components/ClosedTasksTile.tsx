import clsx from "clsx";
import { getClosedTasks } from "../queries";
import { ClosedTasksList } from "./ClosedTasksList";

interface Props {
  readonly className?: string;
}

export const ClosedTasksTile = async ({ className }: Props) => {
  const tasks = await getClosedTasks();

  if (tasks.length <= 0)
    return (
      <section className={clsx("flex justify-center", className)}>
        <div className="rounded-2xl bg-neutral-800/50 p-4 lg:p-8 flex flex-col items-center gap-4">
          <p>Es gibt keine geschlossenen Tasks.</p>
        </div>
      </section>
    );

  return <ClosedTasksList tasks={tasks} />;
};
