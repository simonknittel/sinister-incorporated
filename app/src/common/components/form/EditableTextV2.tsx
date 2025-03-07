import clsx from "clsx";
import { useRef, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { FaPen, FaSave, FaSpinner } from "react-icons/fa";
import { useOutsideClick } from "../../utils/useOutsideClick";

type Props = Readonly<{
  className?: string;
  action: (formData: FormData) => Promise<
    | {
        success: string;
      }
    | { error: string; errorDetails?: unknown }
  >;
  initialValue: string;
}>;

export const EditableTextV2 = ({ className, action, initialValue }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const outsideRef = useRef<HTMLFormElement>(null);

  useOutsideClick(outsideRef, () => {
    setIsEditing(false);
  });

  const handleClick = () => {
    setIsEditing(true);
  };

  const formAction = (formData: FormData) => {
    startTransition(async () => {
      try {
        const response = await action(formData);

        if ("error" in response) {
          /**
           * `setTimeout()` is need here because `isPending` is used for the
           * `disabled` attribute on the input element and `isPending` only
           * reverts to false once this transition finishes. This would lead to
           * calling `focus()` too early.
           */
          setTimeout(() => {
            inputRef.current?.focus();
          }, 1);

          toast.error(response.error);
          console.error(response);
          return;
        }

        toast.success(response.success);
        setValue(formData.get("value")?.toString() || "");
        setIsEditing(false);
      } catch (error) {
        /**
         * `setTimeout()` is need here because `isPending` is used for the
         * `disabled` attribute on the input element and `isPending` only
         * reverts to false once this transition finishes. This would lead to
         * calling `focus()` too early.
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
    <span className={clsx(className)}>
      {isEditing ? (
        <form
          action={formAction}
          className="flex gap-2 items-center mx-1"
          ref={outsideRef}
        >
          <input
            type="text"
            name="value"
            defaultValue={value}
            disabled={isPending}
            className={clsx("rounded bg-neutral-700 px-1 w-full", {
              "animate-pulse": isPending,
            })}
            autoFocus
            required
            ref={inputRef}
          />

          <button disabled={isPending} className="group" title="Speichern">
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
          title="Klicken, um zu bearbeiten"
        >
          {value}{" "}
          <FaPen className="text-sinister-red-500 group-hover:text-sinister-red-300 text-sm" />
        </button>
      )}
    </span>
  );
};
