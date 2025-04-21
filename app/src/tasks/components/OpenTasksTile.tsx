import { requireAuthentication } from "@/auth/server";
import clsx from "clsx";
import { getTasks } from "../queries";
import { CreateTask } from "./CreateTask";
import { OpenTasksClient } from "./OpenTasksClient";

interface Props {
  readonly className?: string;
}

export const OpenTasksTile = async ({ className }: Props) => {
  const authentication = await requireAuthentication();
  const showCreateTask = await authentication.authorize("task", "create");

  const tasks = await getTasks();

  if (tasks.length <= 0)
    return (
      <section className={clsx("flex justify-center", className)}>
        <div className="rounded-2xl bg-neutral-800/50 p-4 lg:p-8 flex flex-col items-center gap-4">
          <p>Es gibt keine offenen Tasks.</p>
          {showCreateTask && <CreateTask cta />}
        </div>
      </section>
    );

  return <OpenTasksClient tasks={tasks} />;
};
