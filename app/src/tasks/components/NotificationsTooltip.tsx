"use client";

import { useAuthentication } from "@/auth/hooks/useAuthentication";
import Button from "@/common/components/Button";
import { useBeamsContext } from "@/pusher/components/BeamsContext";
import * as Popover from "@radix-ui/react-popover";
import clsx from "clsx";
import { useEffect, useMemo, useState, type FormEventHandler } from "react";
import toast from "react-hot-toast";
import { FaBell } from "react-icons/fa";

interface Props {
  readonly className?: string;
}

export const NotificationsTooltip = ({ className }: Props) => {
  const authentication = useAuthentication();
  if (!authentication || !authentication.session.entity)
    throw new Error("Unauthorized");
  const { interests, setInterests } = useBeamsContext();
  const [isOpen, setIsOpen] = useState(false);
  const taskAssignedInterest = useMemo(() => {
    if (!authentication?.session.entity) return "";
    return `task_assigned;citizen_id=${authentication.session.entity.id}`;
  }, [authentication]);
  const [taskAssigned, setTaskAssigned] = useState<boolean | undefined>(
    undefined,
  );

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
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <Button
          variant="tertiary"
          iconOnly
          className={clsx("!text-xl", className)}
        >
          <FaBell />
        </Button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content sideOffset={4}>
          <form
            onSubmit={submitHandler}
            className="px-6 py-4 rounded-secondary bg-neutral-800"
          >
            <p>Erhalte ein Benachrichtigung wenn ...</p>

            <label className="group flex gap-2 items-center cursor-pointer mt-2">
              <input
                type="checkbox"
                name={taskAssignedInterest}
                value="true"
                onChange={(event) => setTaskAssigned(event.target.checked)}
                defaultChecked={taskAssigned}
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

            <Button type="submit" className="ml-auto mt-2">
              Speichern
            </Button>

            <p className="text-neutral-500 text-xs max-w-80 mt-2">
              Unterstützt werden Google Chrome (Desktop und Android), Microsoft
              Edge (Desktop und Android) sowie Firefox (nur, wenn geöffnet).
              Safari wird nicht unterstützt.
            </p>

            <p className="text-neutral-500 text-xs max-w-80 mt-2">
              Diese Einstellungen werden pro Browser und Gerät gespeichert.
            </p>
          </form>

          <Popover.Arrow className="fill-neutral-800" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
