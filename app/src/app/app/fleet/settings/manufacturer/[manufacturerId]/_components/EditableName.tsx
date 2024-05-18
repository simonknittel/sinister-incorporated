"use client";

import { type Manufacturer } from "@prisma/client";
import clsx from "clsx";
import { useRef, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { FaPen, FaSave, FaSpinner } from "react-icons/fa";
import { useOutsideClick } from "../../../../../../../lib/useOutsideClick";

type Props = Readonly<{
  className?: string;
  manufacturer: Pick<Manufacturer, "id" | "name">;
}>;

export const EditableName = ({ className, manufacturer }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(manufacturer.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const outsideRef = useRef<HTMLFormElement>(null);

  useOutsideClick(outsideRef, () => {
    setIsEditing(false);
  });

  const handleClick = () => {
    setIsEditing(true);
  };

  const action = (formData: FormData) => {
    startTransition(async () => {
      try {
        const newValue = formData.get("name")?.toString();
        if (!newValue) {
          toast.error("Der Name kann nicht leer sein.");
          return;
        }

        const response = await fetch(`/api/manufacturer/${manufacturer.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            name: newValue,
          }),
        });

        if (response.ok) {
          toast.success("Erfolgreich gespeichert");
          setValue(newValue);
          setIsEditing(false);
        } else {
          /**
           * `setTimeout()` is need here because `isPending` is used for the `disabled` attribute on
           * the input element and `isPending` only reverts to false once this transition finishes.
           * This would lead to calling `focus()` too early.
           */
          setTimeout(() => {
            inputRef.current?.focus();
          }, 1);

          toast.error("Beim Speichern ist ein Fehler aufgetreten.");
        }
      } catch (error) {
        /**
         * `setTimeout()` is need here because `isPending` is used for the `disabled` attribute on
         * the input element and `isPending` only reverts to false once this transition finishes.
         * This would lead to calling `focus()` too early.
         */
        setTimeout(() => {
          inputRef.current?.focus();
        }, 1);

        toast.error("Beim Speichern ist ein Fehler aufgetreten.");
        console.error(error);
      }
    });
  };

  return (
    <div className={clsx(className)}>
      {isEditing ? (
        <form
          action={action}
          className="flex gap-2 items-center -mx-1"
          ref={outsideRef}
        >
          <input
            type="text"
            name="name"
            defaultValue={value}
            disabled={isPending}
            className={clsx("rounded bg-neutral-700 px-1 w-full", {
              "animate-pulse": isPending,
            })}
            autoFocus
            required
            ref={inputRef}
          />

          <button type="submit" disabled={isPending} className="group">
            {isPending ? (
              <FaSpinner className="text-sinister-red-500 animate-spin" />
            ) : (
              <FaSave className="text-sinister-red-500 group-hover:text-sinister-red-300" />
            )}
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className="flex gap-2 items-center group"
          title="Klicken, um den Namen zu bearbeiten"
        >
          {value}{" "}
          <FaPen className="text-sinister-red-500 group-hover:text-sinister-red-300" />
        </button>
      )}
    </div>
  );
};
