import clsx from "clsx";
import { getMyAssignedTasks } from "../queries";
import { NotificationsTooltip } from "./NotificationsTooltip";
import { Task } from "./Task";

interface Props {
  readonly className?: string;
}

export const TasksDashboardTile = async ({ className }: Props) => {
  const myAssignedTasks = await getMyAssignedTasks();

  if (myAssignedTasks.length <= 0) return null;

  return (
    <section className={clsx(className)}>
      <div className="flex items-center gap-2">
        <h2 className="font-thin text-2xl self-start">Meine Tasks</h2>
        <NotificationsTooltip />
      </div>

      <div className="mt-4 flex flex-col gap-[1px]">
        {myAssignedTasks.map((task) => (
          <Task key={task.id} task={task} />
        ))}
      </div>
    </section>
  );
};
