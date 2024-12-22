"use client";

import { updateIndices } from "@/algolia/actions/updateIndices";
import Button from "@/common/components/Button";
import Note from "@/common/components/Note";
import clsx from "clsx";
import { useFormState, useFormStatus } from "react-dom";
import { FaSpinner } from "react-icons/fa";
import { TbRestore } from "react-icons/tb";

type Props = Readonly<{
  className?: string;
}>;

export const Algolia = ({ className }: Props) => {
  const [state, formAction] = useFormState(updateIndices, null);

  return (
    <section
      className={clsx(
        "mt-4 max-w-4xl p-4 lg:p-8 rounded-2xl bg-neutral-800/50",
        className,
      )}
    >
      <h2 className="font-bold text-xl">Algolia</h2>

      <form action={formAction} className="mt-4">
        <SubmitButton />

        {state?.success && (
          <Note
            type="success"
            message={state.success}
            className={clsx("mt-4", {
              // "animate-pulse": isPending,
            })}
          />
        )}

        {state?.error && (
          <Note
            type="error"
            message={state.error}
            className={clsx("mt-4", {
              // "animate-pulse": isPending,
            })}
          />
        )}
      </form>
    </section>
  );
};

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button type="submit">
      {pending ? <FaSpinner className="animate-spin" /> : <TbRestore />}
      Update indices
    </Button>
  );
};
