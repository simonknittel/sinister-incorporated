"use client";

import { useAuthentication } from "@/auth/hooks/useAuthentication";
import { Tooltip } from "@/common/components/Tooltip";
import type { ComponentProps } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { CreateTask } from "./CreateTask";
import { Task } from "./Task";
import { TaskVisibilityProvider, ToggleAll } from "./TaskVisibilityContext";

type Props = Readonly<{
  tasks: ComponentProps<typeof Task>["task"][];
}>;

export const OpenTasksList = ({ tasks }: Props) => {
  const authentication = useAuthentication();
  if (!authentication) throw new Error("Unauthorized");

  const createdBy = Object.groupBy(tasks, (task) =>
    task.createdById === authentication.session.entityId ? "me" : "others",
  );
  const groupedByVisibility = Object.groupBy(
    createdBy.others || [],
    (task) => task.visibility,
  );

  return (
    <TaskVisibilityProvider items={tasks}>
      <CreateTask cta className="mx-auto" />

      <ToggleAll className="justify-center mt-4" />

      <div className="flex flex-col gap-6">
        {createdBy.me && createdBy.me.length > 0 && (
          <section>
            <h3 className="font-thin text-2xl">Von mir erstellt</h3>

            <div className="flex flex-col gap-[1px] mt-4">
              {createdBy.me?.map((task) => <Task key={task.id} task={task} />)}
            </div>
          </section>
        )}

        {groupedByVisibility.PERSONALIZED &&
          groupedByVisibility.PERSONALIZED.length > 0 && (
            <section>
              <div className="flex gap-2 items-baseline">
                <h3 className="font-thin text-2xl">An mich personalisiert</h3>
                <Tooltip triggerChildren={<FaInfoCircle />}>
                  Diese Aufgaben wurden an dich adressiert und müssen von dir
                  erledigt werden.
                </Tooltip>
              </div>

              <div className="flex flex-col gap-[1px] mt-4">
                {groupedByVisibility.PERSONALIZED?.map((task) => (
                  <Task key={task.id} task={task} />
                ))}
              </div>
            </section>
          )}

        {groupedByVisibility.PUBLIC &&
          groupedByVisibility.PUBLIC.length > 0 && (
            <section>
              <div className="flex gap-2 items-baseline">
                <h3 className="font-thin text-2xl">Öffentlich</h3>
                <Tooltip triggerChildren={<FaInfoCircle />}>
                  Diese Aufgaben können von jedem angenommen und erfüllt werden.
                </Tooltip>
              </div>

              <div className="flex flex-col gap-[1px] mt-4">
                {groupedByVisibility.PUBLIC?.map((task) => (
                  <Task key={task.id} task={task} />
                ))}
              </div>
            </section>
          )}
      </div>
    </TaskVisibilityProvider>
  );
};
