"use client";

import Button from "@/common/components/Button";
import { useBeamsContext } from "@/pusher/components/BeamsContext";
import * as Popover from "@radix-ui/react-popover";
import clsx from "clsx";
import { useEffect, useState, type FormEventHandler } from "react";
import toast from "react-hot-toast";
import { FaBell } from "react-icons/fa";

type Props = Readonly<{
  className?: string;
}>;

export const NotificationsTooltip = ({ className }: Props) => {
  const { interests, setInterests } = useBeamsContext();
  const [isOpen, setIsOpen] = useState(false);
  const [newEvent, setNewEvent] = useState(
    interests.includes("newDiscordEvent") ? "true" : "false",
  );
  const [updatedEvent, setUpdatedEvent] = useState(
    interests.includes("updatedEvent") ? "true" : "false",
  );

  useEffect(() => {
    setNewEvent(interests.includes("newDiscordEvent") ? "true" : "false");
    setUpdatedEvent(
      interests.includes("updatedDiscordEvent") ? "true" : "false",
    );
  }, [interests]);

  const submitHandler: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    setInterests((currentValue) => {
      const newValue = currentValue.filter(
        (interest) =>
          ["newDiscordEvent", "updatedDiscordEvent"].includes(interest) ===
          false,
      );

      if (formData.get("newEvent") === "true") newValue.push("newDiscordEvent");
      if (formData.get("updatedEvent") === "true")
        newValue.push("updatedDiscordEvent");

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
            className="px-6 py-4 rounded bg-neutral-800"
          >
            <p>Erhalte ein Benachrichtigung bei ...</p>

            <label className="group flex gap-2 items-center cursor-pointer mt-2">
              <input
                type="checkbox"
                name="newEvent"
                value="true"
                onChange={(event) =>
                  setNewEvent(event.target.checked ? "true" : "false")
                }
                defaultChecked={newEvent === "true"}
                className="hidden peer"
              />
              <span className="w-8 h-8 bg-neutral-700 rounded block relative peer-checked:hidden">
                <span className="absolute inset-1 rounded bg-green-500/50 hidden group-hover:block" />
              </span>
              <span className="w-8 h-8 bg-neutral-700 rounded hidden relative peer-checked:block">
                <span className="absolute inset-1 rounded bg-green-500" />
              </span>
              neuen Events
            </label>

            <label className="group flex gap-2 items-center cursor-pointer mt-2">
              <input
                type="checkbox"
                name="updatedEvent"
                value="true"
                onChange={(event) =>
                  setUpdatedEvent(event.target.checked ? "true" : "false")
                }
                defaultChecked={updatedEvent === "true"}
                className="hidden peer"
              />
              <span className="w-8 h-8 bg-neutral-700 rounded block relative peer-checked:hidden">
                <span className="absolute inset-1 rounded bg-green-500/50 hidden group-hover:block" />
              </span>
              <span className="w-8 h-8 bg-neutral-700 rounded hidden relative peer-checked:block">
                <span className="absolute inset-1 rounded bg-green-500" />
              </span>
              Aktualisierungen
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
