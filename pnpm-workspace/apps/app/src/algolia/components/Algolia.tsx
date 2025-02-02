"use client";

import { updateIndices } from "@/algolia/actions/updateIndices";
import Button from "@/common/components/Button";
import Note from "@/common/components/Note";
import clsx from "clsx";
import { useActionState } from "react";
import { FaSpinner } from "react-icons/fa";
import { TbRestore } from "react-icons/tb";

type Props = Readonly<{
  className?: string;
}>;

export const Algolia = ({ className }: Props) => {
  const [state, formAction, isPending] = useActionState(updateIndices, null);

  return (
    <form action={formAction} className={clsx(className)}>
      <Button type="submit">
        {isPending ? <FaSpinner className="animate-spin" /> : <TbRestore />}
        Update Algolia indices
      </Button>

      {state?.success && (
        <Note
          type="success"
          message={state.success}
          className={clsx("mt-4", {
            "animate-pulse": isPending,
          })}
        />
      )}

      {state?.error && (
        <Note
          type="error"
          message={state.error}
          className={clsx("mt-4", {
            "animate-pulse": isPending,
          })}
        />
      )}
    </form>
  );
};
