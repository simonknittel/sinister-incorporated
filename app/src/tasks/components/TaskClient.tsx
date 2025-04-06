"use client";

import { CitizenLink } from "@/common/components/CitizenLink";
import { EditableDateTimeInput } from "@/common/components/form/EditableDateTimeInput";
import { EditableInput } from "@/common/components/form/EditableInput";
import { EditableTextarea } from "@/common/components/form/EditableTextarea";
import {
  TaskRewardType,
  type Entity,
  type TaskAssignment,
  type Task as TaskType,
} from "@prisma/client";
import clsx from "clsx";
import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { updateTaskDescription } from "../actions/updateTaskDescription";
import { updateTaskExpiresAt } from "../actions/updateTaskExpiresAt";
import { updateTaskRewardTypeTextValue } from "../actions/updateTaskRewardTypeTextValue";
import { updateTaskTitle } from "../actions/updateTaskTitle";

type Props = Readonly<{
  className?: string;
  task: TaskType & {
    createdBy: Entity | null;
    assignments: TaskAssignment[];
  };
  showActions?: boolean;
}>;

export const TaskClient = ({ className, task, showActions }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

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
        <div className="flex flex-col gap-1 lg:gap-2 lg:flex-row flex-1 p-2">
          <div className="lg:flex-1 flex flex-col overflow-hidden">
            {isOpen && <span className="text-neutral-400 text-sm">Titel</span>}
            {showActions ? (
              <EditableInput
                rowId={task.id}
                columnName="title"
                initialValue={task.title}
                action={updateTaskTitle}
                className="font-bold"
              />
            ) : (
              <h3 className="font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                {task.title}
              </h3>
            )}
          </div>

          <div className="w-48 flex-auto flex flex-col overflow-hidden">
            {isOpen && (
              <span className="text-neutral-400 text-sm">Belohnung</span>
            )}
            {task.rewardType === TaskRewardType.TEXT &&
              (showActions ? (
                <EditableInput
                  rowId={task.id}
                  columnName="rewardTypeTextValue"
                  initialValue={task.rewardTypeTextValue || ""}
                  action={updateTaskRewardTypeTextValue}
                />
              ) : (
                <span className="font-bold overflow-hidden whitespace-nowrap text-ellipsis">
                  {task.rewardTypeTextValue}
                </span>
              ))}
          </div>
        </div>

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          type="button"
          title={isOpen ? "Details schließen" : "Details öffnen"}
          className="flex-none p-3 flex items-center justify-center border-l border-white/10 hover:bg-neutral-800 rounded"
        >
          {isOpen ? (
            <FaChevronUp className="text-sinister-red-500" />
          ) : (
            <FaChevronDown className="text-sinister-red-500" />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="bg-neutral-800/50 border-t border-white/10 rounded-b">
          <div className="flex flex-col p-2">
            <span className="text-neutral-400 text-sm">Beschreibung</span>
            {showActions ? (
              <EditableTextarea
                rowId={task.id}
                columnName="description"
                initialValue={task.description}
                action={updateTaskDescription}
              />
            ) : (
              <pre className="font-bold overflow-hidden whitespace-nowrap text-ellipsis font-[inherit]">
                {task.description || "-"}
              </pre>
            )}
          </div>

          <div className="flex gap-2">
            <div className="flex flex-col p-2 items-start">
              <span className="text-neutral-400 text-sm">Erstellt von</span>
              {task.createdBy && <CitizenLink citizen={task.createdBy} />}
            </div>

            <div className="flex flex-col p-2">
              <span className="text-neutral-400 text-sm">Erstellt am</span>
              {task.createdAt.toLocaleDateString("de-DE", {
                timeZone: "Europe/Berlin",
                weekday: "short",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>

            <div className="flex flex-col p-2">
              <span className="text-neutral-400 text-sm">Ablaufdatum</span>
              {showActions ? (
                <EditableDateTimeInput
                  rowId={task.id}
                  columnName="expiresAt"
                  initialValue={task.expiresAt}
                  action={updateTaskExpiresAt}
                />
              ) : (
                task.expiresAt?.toLocaleDateString("de-DE", {
                  timeZone: "Europe/Berlin",
                  weekday: "short",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }) || "-"
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
