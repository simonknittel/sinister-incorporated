import { Tile } from "@/common/components/Tile";
import clsx from "clsx";
import { getTasks } from "../queries";
import { CreateTask } from "./CreateTask";
import { TaskServer } from "./TaskServer";

type Props = Readonly<{
  className?: string;
}>;

export const OpenTasks = async ({ className }: Props) => {
  const tasks = await getTasks();

  if (tasks.length <= 0)
    return (
      <section className={clsx("flex justify-center", className)}>
        <div className="rounded-2xl bg-neutral-800/50 p-4 lg:p-8 flex flex-col items-center gap-4">
          <p>Es gibt keine offenen Tasks.</p>
          <CreateTask cta />
        </div>
      </section>
    );

  return (
    <Tile
      heading="Offene Tasks"
      cta={<CreateTask />}
      className={clsx(className)}
      childrenClassName="flex flex-col gap-[1px]"
      transparent
    >
      {tasks.map((task) => (
        <TaskServer key={task.id} task={task} />
      ))}
    </Tile>
  );
};
