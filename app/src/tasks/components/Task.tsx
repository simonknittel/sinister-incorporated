"use client";

import { useAuthentication } from "@/auth/hooks/useAuthentication";
import { AccordeonToggle } from "@/common/components/Accordeon";
import { Badge } from "@/common/components/Badge";
import { CitizenLink } from "@/common/components/CitizenLink";
import { EditableDateTimeInput } from "@/common/components/form/EditableDateTimeInput";
import { EditableInput } from "@/common/components/form/EditableInput";
import { EditableTextarea } from "@/common/components/form/EditableTextarea";
import { Tooltip } from "@/common/components/Tooltip";
import { formatDate } from "@/common/utils/formatDate";
import { SingleRole } from "@/roles/components/SingleRole";
import {
  TaskRewardType,
  TaskVisibility,
  type Entity,
  type Role,
  type TaskAssignment,
  type Task as TaskType,
  type Upload,
} from "@prisma/client";
import clsx from "clsx";
import type { ReactNode } from "react";
import { BsExclamationOctagonFill } from "react-icons/bs";
import { FaCheckSquare, FaClock, FaEye, FaInfoCircle } from "react-icons/fa";
import { TbRepeatOnce } from "react-icons/tb";
import { updateTaskDescription } from "../actions/updateTaskDescription";
import { updateTaskExpiresAt } from "../actions/updateTaskExpiresAt";
import { updateTaskRewardTypeNewSilcValue } from "../actions/updateTaskRewardTypeNewSilcValue";
import { updateTaskRewardTypeSilcValue } from "../actions/updateTaskRewardTypeSilcValue";
import { updateTaskRewardTypeTextValue } from "../actions/updateTaskRewardTypeTextValue";
import { updateTaskTitle } from "../actions/updateTaskTitle";
import { isTaskUpdatable as _isTaskUpdateable } from "../utils/isTaskUpdatable";
import {
  useIsAllowedToDeleteTask,
  useIsAllowedToManageTask,
} from "../utils/useIsAllowedToTask";
import { CancelTask } from "./CancelTask";
import { CompleteTask } from "./CompleteTask";
import { DeleteTask } from "./DeleteTask";
import { useTaskVisibility } from "./TaskVisibilityContext";
import { ToggleAssignmentForCurrentUser } from "./ToggleAssignmentForCurrentUser";
import { UpdateRequiredRoles } from "./UpdateRequiredRoles";
import { UpdateTaskAssignments } from "./UpdateTaskAssignments";
import { UpdateTaskRepeatable } from "./UpdateTaskRepeatable";

interface TaskWithIncludes extends TaskType {
  createdBy: Entity | null;
  assignments: (TaskAssignment & {
    citizen: Entity;
  })[];
  completedBy?: Entity | null;
  completionists?: Entity[];
  cancelledBy?: Entity | null;
  deletedBy?: Entity | null;
  requiredRoles: (Role & {
    icon: Upload | null;
  })[];
}

interface Props {
  readonly className?: string;
  readonly task: TaskWithIncludes;
}

export const Task = ({ className, task }: Props) => {
  const { openItems, open, close } = useTaskVisibility();
  const isOpen = openItems.includes(task.id);
  const handleToggleOpen = () => {
    if (isOpen) {
      close(task.id);
    } else {
      open(task.id);
    }
  };

  const isAllowedToManageTask = useIsAllowedToManageTask(task);
  const isAllowedToDeleteTask = useIsAllowedToDeleteTask();
  const isTaskUpdatable = _isTaskUpdateable(task);

  const authentication = useAuthentication();
  if (!authentication) throw new Error("Unauthorized");

  const isCurrentUserAssigned = task.assignments.some(
    (assignment) => assignment.citizenId === authentication.session.entity?.id,
  );

  const badges: ReactNode[] = [];
  if (task.expiresAt) {
    badges.push(
      <Badge
        key="expiresAt"
        label="Ablaufdatum"
        value={formatDate(task.expiresAt)!}
        icon={<FaClock />}
        className="text-sm"
      />,
    );
    if (
      task.expiresAt < new Date() &&
      task.completionists &&
      task.completionists.length <= 0
    ) {
      badges.push(
        <Badge
          key="status"
          label="Status"
          value="Abgelaufen"
          icon={<BsExclamationOctagonFill />}
          className="text-sm text-red-500"
        />,
      );
    }
  }
  if (task.repeatable && task.repeatable > 1) {
    badges.push(
      <Badge
        key="repeatable"
        label="Wiederholbar"
        value={`${task.repeatable}x`}
        icon={<TbRepeatOnce />}
      />,
    );
  }
  switch (task.visibility) {
    case TaskVisibility.PUBLIC:
      badges.push(
        <Badge
          key="visibility"
          label="Sichtbarkeit"
          value="Öffentlich"
          icon={<FaEye />}
          className="text-sm"
        />,
      );
      break;
    case TaskVisibility.PERSONALIZED:
      badges.push(
        <Badge
          key="visibility"
          label="Sichtbarkeit"
          value="Personalisiert"
          icon={<FaEye />}
          className="text-sm"
        />,
      );
      break;
    case TaskVisibility.GROUP:
      badges.push(
        <Badge
          key="visibility"
          label="Sichtbarkeit"
          value="Gruppe"
          icon={<FaEye />}
          className="text-sm"
        />,
      );
      break;
  }
  if (task.completionists && task.completionists.length > 0) {
    badges.push(
      <Badge
        key="status"
        label="Status"
        value="Erfüllt"
        icon={<FaCheckSquare />}
        className="text-sm text-green-500"
      />,
    );
  }
  if (task.cancelledAt) {
    badges.push(
      <Badge
        key="status"
        label="Status"
        value="Abgebrochen"
        icon={<FaInfoCircle />}
        className="text-sm text-blue-500"
      />,
    );
  }
  if (task.deletedAt) {
    badges.push(
      <Badge
        key="deleted"
        label="Gelöscht"
        value="Gelöscht"
        icon={<FaInfoCircle />}
        className="text-sm text-blue-500"
      />,
    );
  }

  return (
    <article
      className={clsx(
        {
          "mb-4": isOpen,
        },
        className,
      )}
    >
      <div className="bg-neutral-800/50 rounded flex">
        <div className="flex-1">
          <div className="flex flex-col gap-1 xl:grid xl:grid-cols-[1fr_256px_256px] xl:gap-2 p-2">
            <div className="flex flex-col overflow-hidden">
              {isOpen && (
                <span className="text-neutral-400 text-sm">Titel</span>
              )}
              {isTaskUpdatable && isAllowedToManageTask ? (
                <EditableInput
                  rowId={task.id}
                  columnName="title"
                  initialValue={task.title}
                  action={updateTaskTitle}
                  className="font-bold"
                />
              ) : (
                <h3
                  className={clsx("font-bold", {
                    "overflow-hidden whitespace-nowrap text-ellipsis": !isOpen,
                  })}
                  title={task.title}
                >
                  {task.title}
                </h3>
              )}
            </div>

            <div className="flex flex-col overflow-hidden">
              {isOpen && (
                <span className="text-neutral-400 text-sm">Belohnung</span>
              )}
              {task.rewardType === TaskRewardType.TEXT &&
                (isTaskUpdatable && isAllowedToManageTask ? (
                  <EditableInput
                    rowId={task.id}
                    columnName="rewardTypeTextValue"
                    initialValue={task.rewardTypeTextValue || ""}
                    action={updateTaskRewardTypeTextValue}
                  />
                ) : (
                  <span
                    className={clsx({
                      "overflow-hidden whitespace-nowrap text-ellipsis":
                        !isOpen,
                    })}
                    title={task.rewardTypeTextValue || "-"}
                  >
                    {task.rewardTypeTextValue || "-"}
                  </span>
                ))}
              {task.rewardType === TaskRewardType.SILC &&
                (isTaskUpdatable && isAllowedToManageTask ? (
                  <div className="flex gap-2">
                    <EditableInput
                      type="number"
                      rowId={task.id}
                      columnName="rewardTypeSilcValue"
                      initialValue={task.rewardTypeSilcValue || 1}
                      action={updateTaskRewardTypeSilcValue}
                      className="flex-initial"
                    />
                    <span className="flex-none">SILC (Tausch)</span>
                  </div>
                ) : (
                  <span className="overflow-hidden whitespace-nowrap text-ellipsis">
                    {task.rewardTypeSilcValue} SILC (Tausch)
                  </span>
                ))}
              {task.rewardType === TaskRewardType.NEW_SILC &&
                (isTaskUpdatable && isAllowedToManageTask ? (
                  <div className="flex gap-2">
                    <EditableInput
                      type="number"
                      rowId={task.id}
                      columnName="rewardTypeNewSilcValue"
                      initialValue={task.rewardTypeNewSilcValue || 1}
                      action={updateTaskRewardTypeNewSilcValue}
                      className="flex-initial"
                    />
                    <span className="flex-none">SILC</span>
                  </div>
                ) : (
                  <span className="overflow-hidden whitespace-nowrap text-ellipsis">
                    {task.rewardTypeNewSilcValue} SILC
                  </span>
                ))}
            </div>

            <div className="flex flex-col overflow-hidden">
              {isOpen && (
                <span className="text-neutral-400 text-sm">
                  Angenommen von
                  {task.assignmentLimit
                    ? ` (max. ${task.assignmentLimit})`
                    : null}
                </span>
              )}
              <div className="flex gap-3 items-center">
                {task.assignments.length > 0 ? (
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {task.assignments.map((assignment) => (
                      <CitizenLink
                        key={assignment.id}
                        citizen={assignment.citizen}
                      />
                    ))}
                  </div>
                ) : (
                  "-"
                )}
                {isTaskUpdatable &&
                  isAllowedToManageTask &&
                  task.visibility === TaskVisibility.PUBLIC && (
                    <UpdateTaskAssignments task={task} className="flex-none" />
                  )}
              </div>
            </div>
          </div>

          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1 px-2 pb-2">{badges}</div>
          )}
        </div>

        <AccordeonToggle onClick={handleToggleOpen} isOpen={isOpen} />
      </div>

      {isOpen && (
        <div className="bg-neutral-800/50 border-t border-white/10 rounded-b">
          <div className="flex flex-col p-2">
            <span className="text-neutral-400 text-sm">Beschreibung</span>
            {isTaskUpdatable && isAllowedToManageTask ? (
              <EditableTextarea
                rowId={task.id}
                columnName="description"
                initialValue={task.description}
                action={updateTaskDescription}
              />
            ) : (
              <pre className="overflow-hidden whitespace-nowrap text-ellipsis font-[inherit]">
                {task.description || "-"}
              </pre>
            )}
          </div>

          <div className="flex gap-2">
            <div className="flex flex-col items-start p-2">
              <span className="text-neutral-400 text-sm flex items-center gap-1">
                Wiederholungen
                <Tooltip triggerChildren={<FaInfoCircle />}>
                  Wie häufig kann dieser Task abgeschlossen werden?
                </Tooltip>
              </span>
              <div className="flex gap-2 items-center">
                {task.repeatable}x
                {isTaskUpdatable && isAllowedToManageTask && (
                  <UpdateTaskRepeatable task={task} />
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex flex-col p-2 items-start">
              <span className="text-neutral-400 text-sm">Erstellt von</span>
              {task.createdBy && <CitizenLink citizen={task.createdBy} />}
            </div>

            <div className="flex flex-col p-2">
              <span className="text-neutral-400 text-sm">Erstellt am</span>
              {formatDate(task.createdAt)}
            </div>

            <div className="flex flex-col p-2">
              <span className="text-neutral-400 text-sm">Ablaufdatum</span>
              {isTaskUpdatable && isAllowedToManageTask ? (
                <EditableDateTimeInput
                  rowId={task.id}
                  columnName="expiresAt"
                  initialValue={task.expiresAt}
                  action={updateTaskExpiresAt}
                />
              ) : (
                formatDate(task.expiresAt) || "-"
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {task.completedBy && (
              <>
                <div className="flex flex-col items-start p-2">
                  <span className="text-neutral-400 text-sm">
                    Abgeschlossen von
                  </span>
                  <div className="flex gap-2 items-center">
                    <CitizenLink citizen={task.completedBy} />
                  </div>
                </div>

                <div className="flex flex-col items-start p-2">
                  <span className="text-neutral-400 text-sm">
                    Abgeschlossen am
                  </span>
                  <div className="flex gap-2 items-center">
                    {formatDate(task.completedAt)}
                  </div>
                </div>
              </>
            )}
            {task.cancelledBy && (
              <>
                <div className="flex flex-col items-start p-2">
                  <span className="text-neutral-400 text-sm">
                    Abgebrochen von
                  </span>
                  <div className="flex gap-2 items-center">
                    <CitizenLink citizen={task.cancelledBy} />
                  </div>
                </div>
                <div className="flex flex-col items-start p-2">
                  <span className="text-neutral-400 text-sm">
                    Abgebrochen am
                  </span>
                  <div className="flex gap-2 items-center">
                    {formatDate(task.cancelledAt)}
                  </div>
                </div>
              </>
            )}
            {task.deletedBy && (
              <>
                <div className="flex flex-col items-start p-2">
                  <span className="text-neutral-400 text-sm">Gelöscht von</span>
                  <div className="flex gap-2 items-center">
                    <CitizenLink citizen={task.deletedBy} />
                  </div>
                </div>
                <div className="flex flex-col items-start p-2">
                  <span className="text-neutral-400 text-sm">Gelöscht am</span>
                  <div className="flex gap-2 items-center">
                    {formatDate(task.deletedAt)}
                  </div>
                </div>
              </>
            )}
            {task.completionists && task.completionists.length > 0 && (
              <div className="flex flex-col items-start p-2">
                <span className="text-neutral-400 text-sm">Erfüllt durch</span>

                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {task.completionists.map((completionist) => (
                    <CitizenLink
                      key={completionist.id}
                      citizen={completionist}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {task.visibility === TaskVisibility.PUBLIC && (
            <div className="flex flex-col items-start p-2">
              <span className="text-neutral-400 text-sm">
                Erforderliche Rolle(n)
              </span>

              <div className="flex gap-2 items-center">
                {task.requiredRoles.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {task.requiredRoles.map((role) => (
                      <SingleRole key={role.id} role={role} showPlaceholder />
                    ))}
                  </div>
                ) : (
                  "-"
                )}

                {isTaskUpdatable && isAllowedToManageTask && (
                  <UpdateRequiredRoles task={task} className="flex-none" />
                )}
              </div>
            </div>
          )}

          {((isTaskUpdatable && task.visibility === TaskVisibility.PUBLIC) ||
            (isTaskUpdatable && isAllowedToManageTask) ||
            isAllowedToDeleteTask) && (
            <div
              className={clsx(
                "flex justify-between items-center border-t border-white/10 px-2 h-16",
                {
                  "flex-row-reverse":
                    isTaskUpdatable &&
                    task.visibility === TaskVisibility.PUBLIC,
                },
              )}
            >
              {isTaskUpdatable && task.visibility === TaskVisibility.PUBLIC && (
                <ToggleAssignmentForCurrentUser
                  task={task}
                  isCurrentUserAssigned={isCurrentUserAssigned}
                />
              )}

              {isAllowedToManageTask && (
                <div className="flex flex-row-reverse items-center justify-center gap-2">
                  {isTaskUpdatable && (
                    <>
                      <CompleteTask task={task} className="flex-none" />
                      <CancelTask task={task} className="flex-none" />
                    </>
                  )}
                  {isAllowedToDeleteTask && (
                    <DeleteTask task={task} className="flex-none" />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
};
