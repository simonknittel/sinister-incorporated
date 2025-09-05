"use client";

import { Button2 } from "@/common/components/Button2";
import { useBeamsContext } from "@/pusher/components/BeamsContext";
import clsx from "clsx";
import { useEffect, useState, type FormEventHandler } from "react";
import toast from "react-hot-toast";

interface Props {
  readonly className?: string;
}

export const EventsNotifications = ({ className }: Props) => {
  const { interests, setInterests } = useBeamsContext();
  const [newEvent, setNewEvent] = useState<boolean>(false);
  const [updatedEvent, setUpdatedEvent] = useState<boolean>(false);
  const [deletedEvent, setDeletedEvent] = useState<boolean>(false);

  useEffect(() => {
    if (interests === undefined) return;
    setNewEvent(interests.includes("newDiscordEvent"));
    setUpdatedEvent(interests.includes("updatedDiscordEvent"));
    setDeletedEvent(interests.includes("deletedDiscordEvent"));
  }, [interests]);

  const submitHandler: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    setInterests((currentValue) => {
      if (currentValue === undefined) return currentValue;

      const newValue = currentValue.filter(
        (interest) =>
          [
            "newDiscordEvent",
            "updatedDiscordEvent",
            "deletedDiscordEvent",
          ].includes(interest) === false,
      );

      if (formData.get("newEvent") === "true") newValue.push("newDiscordEvent");
      if (formData.get("updatedEvent") === "true")
        newValue.push("updatedDiscordEvent");
      if (formData.get("deletedEvent") === "true")
        newValue.push("deletedDiscordEvent");

      return newValue;
    });

    toast.success("Erfolgreich gespeichert");
  };

  return (
    <form onSubmit={submitHandler} className={clsx(className)}>
      <p>Erhalte ein Benachrichtigung bei ...</p>

      <label className="group flex gap-2 items-center cursor-pointer mt-2">
        <input
          type="checkbox"
          name="newEvent"
          value="true"
          onChange={(event) => setNewEvent(event.target.checked)}
          checked={newEvent}
          className="hidden peer"
        />
        <span className="w-8 h-8 bg-neutral-700 rounded-secondary block relative peer-checked:hidden">
          <span className="absolute inset-1 rounded-secondary bg-green-500/50 hidden group-hover:block" />
        </span>
        <span className="w-8 h-8 bg-neutral-700 rounded-secondary hidden relative peer-checked:block">
          <span className="absolute inset-1 rounded-secondary bg-green-500" />
        </span>
        neuen Events
      </label>

      <label className="group flex gap-2 items-center cursor-pointer mt-2">
        <input
          type="checkbox"
          name="updatedEvent"
          value="true"
          onChange={(event) => setUpdatedEvent(event.target.checked)}
          checked={updatedEvent}
          className="hidden peer"
        />
        <span className="w-8 h-8 bg-neutral-700 rounded-secondary block relative peer-checked:hidden">
          <span className="absolute inset-1 rounded-secondary bg-green-500/50 hidden group-hover:block" />
        </span>
        <span className="w-8 h-8 bg-neutral-700 rounded-secondary hidden relative peer-checked:block">
          <span className="absolute inset-1 rounded-secondary bg-green-500" />
        </span>
        Aktualisierungen
      </label>

      <label className="group flex gap-2 items-center cursor-pointer mt-2">
        <input
          type="checkbox"
          name="deletedEvent"
          value="true"
          onChange={(event) => setDeletedEvent(event.target.checked)}
          checked={deletedEvent}
          className="hidden peer"
        />
        <span className="w-8 h-8 bg-neutral-700 rounded-secondary block relative peer-checked:hidden">
          <span className="absolute inset-1 rounded-secondary bg-green-500/50 hidden group-hover:block" />
        </span>
        <span className="w-8 h-8 bg-neutral-700 rounded-secondary hidden relative peer-checked:block">
          <span className="absolute inset-1 rounded-secondary bg-green-500" />
        </span>
        Absagen
      </label>

      <Button2 type="submit" className="ml-auto mt-2">
        Speichern
      </Button2>
    </form>
  );
};
