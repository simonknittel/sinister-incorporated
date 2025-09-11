import { getMyAssignedTasks } from "@/modules/tasks/queries";
import clsx from "clsx";

interface Props {
  readonly className?: string;
}

export const TasksBadge = async ({ className }: Props) => {
  const tasks = await getMyAssignedTasks();

  if (tasks.length === 0) return null;

  return (
    <div
      className={clsx(
        "background-tertiary rounded-full size-5 flex items-center justify-center text-xs border-me border",
        className,
      )}
      title="Mir zugewiesenen Tasks"
    >
      {tasks.length}
    </div>
  );
};
