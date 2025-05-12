import { requireAuthentication } from "@/auth/server";
import { Tooltip } from "@/common/components/Tooltip";
import type { ComponentProps } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { CreateTask } from "./CreateTask";
import { Task } from "./Task";

interface Props {
  readonly tasks: ComponentProps<typeof Task>["task"][];
}

export const OpenTasksList = async ({ tasks }: Props) => {
  const authentication = await requireAuthentication();
  const showCreateTask = await authentication.authorize("task", "create");

  const createdBy = Object.groupBy(tasks, (task) =>
    task.createdById === authentication.session.entity?.id ? "me" : "others",
  );
  const groupedByVisibility = Object.groupBy(
    createdBy.others || [],
    (task) => task.visibility,
  );
  const groupedByVisibilityAssignment = Object.groupBy(
    [
      ...(groupedByVisibility.PERSONALIZED || []),
      ...(groupedByVisibility.GROUP || []),
    ],
    (task) =>
      task.assignments?.some(
        (assignment) =>
          assignment.citizenId === authentication.session.entity?.id,
      )
        ? "personalizedToMe"
        : "personalizedToOthers",
  );

  return (
    <>
      {showCreateTask && <CreateTask cta className="mx-auto" />}

      <div className="flex flex-col gap-6">
        {createdBy.me && createdBy.me.length > 0 && (
          <section>
            <h3 className="font-thin text-2xl">Von mir erstellt</h3>

            <div className="flex flex-col gap-[1px] mt-4">
              {createdBy.me?.map((task) => <Task key={task.id} task={task} />)}
            </div>
          </section>
        )}

        {groupedByVisibilityAssignment.personalizedToMe &&
          groupedByVisibilityAssignment.personalizedToMe.length > 0 && (
            <section>
              <div className="flex gap-2 items-baseline">
                <h3 className="font-thin text-2xl">An mich personalisiert</h3>
                <Tooltip triggerChildren={<FaInfoCircle />}>
                  Diese Tasks wurden an dich adressiert und müssen von dir
                  erledigt werden.
                </Tooltip>
              </div>

              <div className="flex flex-col gap-[1px] mt-4">
                {groupedByVisibilityAssignment.personalizedToMe.map((task) => (
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
                  Diese Tasks können von jedem angenommen und erfüllt werden.
                </Tooltip>
              </div>

              <div className="flex flex-col gap-[1px] mt-4">
                {groupedByVisibility.PUBLIC.map((task) => (
                  <Task key={task.id} task={task} />
                ))}
              </div>
            </section>
          )}

        {groupedByVisibilityAssignment.personalizedToOthers &&
          groupedByVisibilityAssignment.personalizedToOthers.length > 0 && (
            <section>
              <div className="flex gap-2 items-baseline">
                <h3 className="font-thin text-2xl">An andere personalisiert</h3>
                <Tooltip triggerChildren={<FaInfoCircle />}>
                  Diese Tasks wurden an andere adressiert. Diese Auflistung ist
                  nur mit der Berechtigung <em>Tasks verwalten</em> sichtbar.
                </Tooltip>
              </div>

              <div className="flex flex-col gap-[1px] mt-4">
                {groupedByVisibilityAssignment.personalizedToOthers.map(
                  (task) => (
                    <Task key={task.id} task={task} />
                  ),
                )}
              </div>
            </section>
          )}
      </div>
    </>
  );
};
