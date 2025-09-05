"use client";

import { useAuthentication } from "@/auth/hooks/useAuthentication";
import { Button2 } from "@/common/components/Button2";
import { useBeamsContext } from "@/pusher/components/BeamsContext";
import clsx from "clsx";
import { useEffect, useMemo, useState, type FormEventHandler } from "react";
import toast from "react-hot-toast";

interface Props {
  readonly className?: string;
}

export const TasksNotifications = ({ className }: Props) => {
  const authentication = useAuthentication();
  if (!authentication || !authentication.session.entity)
    throw new Error("Unauthorized");
  const { interests, setInterests } = useBeamsContext();
  const taskAssignedInterest = useMemo(() => {
    if (!authentication?.session.entity) return "";
    return `task_assigned;citizen_id=${authentication.session.entity.id}`;
  }, [authentication]);
  const [taskAssigned, setTaskAssigned] = useState<boolean>(false);

  useEffect(() => {
    if (interests === undefined) return;
    setTaskAssigned(interests.includes(taskAssignedInterest));
  }, [interests, taskAssignedInterest]);

  const submitHandler: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    setInterests((currentValue) => {
      if (currentValue === undefined) return currentValue;

      const newValue = currentValue.filter(
        (interest) => [taskAssignedInterest].includes(interest) === false,
      );

      if (formData.get(taskAssignedInterest) === "true")
        newValue.push(taskAssignedInterest);

      return newValue;
    });

    toast.success("Erfolgreich gespeichert");
  };

  return (
    <form onSubmit={submitHandler} className={clsx(className)}>
      <p>Erhalte ein Benachrichtigung wenn ...</p>

      <label className="group flex gap-2 items-center cursor-pointer mt-2">
        <input
          type="checkbox"
          name={taskAssignedInterest}
          value="true"
          onChange={(event) => setTaskAssigned(event.target.checked)}
          checked={taskAssigned}
          className="hidden peer"
        />
        <span className="w-8 h-8 bg-neutral-700 rounded-secondary block relative peer-checked:hidden">
          <span className="absolute inset-1 rounded-secondary bg-green-500/50 hidden group-hover:block" />
        </span>
        <span className="w-8 h-8 bg-neutral-700 rounded-secondary hidden relative peer-checked:block">
          <span className="absolute inset-1 rounded-secondary bg-green-500" />
        </span>
        mir ein Task zugewiesen wird.
      </label>

      <Button2 type="submit" className="ml-auto mt-2">
        Speichern
      </Button2>
    </form>
  );
};
