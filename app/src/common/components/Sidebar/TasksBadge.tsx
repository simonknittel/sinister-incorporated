import { getMyAssignedTasks } from "@/tasks/queries";
import clsx from "clsx";

interface Props {
  readonly isInDesktopSidebar?: boolean;
  readonly className?: string;
}

export const TasksBadge = async ({
  className,
  isInDesktopSidebar = false,
}: Props) => {
  const tasks = await getMyAssignedTasks();

  if (tasks.length === 0) return null;

  return (
    <div
      className={clsx(
        "background-tertiary rounded-full size-5 flex items-center justify-center text-xs border-me border",
        {
          "group-data-[navigation-collapsed]/navigation:absolute -right-2":
            isInDesktopSidebar,
        },
        className,
      )}
      title="Mir zugewiesenen Tasks"
    >
      {tasks.length}
    </div>
  );
};
