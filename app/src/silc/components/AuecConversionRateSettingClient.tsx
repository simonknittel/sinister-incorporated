"use client";

import Button from "@/common/components/Button";
import Note from "@/common/components/Note";
import { SilcSettingKey, type SilcSetting } from "@prisma/client";
import clsx from "clsx";
import { useActionState, useId } from "react";
import { FaSave, FaSpinner } from "react-icons/fa";
import { updateSilcSetting } from "../actions/updateSilcSetting";

type Props = Readonly<{
  className?: string;
  setting?: SilcSetting | null;
}>;

export const AuecConversionRateSettingClient = ({
  className,
  setting,
}: Props) => {
  const [state, formAction, isPending] = useActionState(
    updateSilcSetting,
    null,
  );
  const inputId = useId();

  return (
    <form action={formAction} className={clsx(className)}>
      <input
        type="hidden"
        name="key"
        value={SilcSettingKey.AUEC_CONVERSION_RATE}
      />

      <label className="block" htmlFor={inputId}>
        Wie viel aUEC entspricht ein SILC?
      </label>
      <input
        className="p-2 rounded bg-neutral-900 border border-neutral-800 w-full mt-2 disabled:opacity-50"
        name="value"
        required
        type="number"
        defaultValue={setting?.value || ""}
        id={inputId}
        disabled={isPending}
        min={1}
      />

      <Button type="submit" className="mt-4 ml-auto">
        {isPending ? <FaSpinner className="animate-spin" /> : <FaSave />}
        Speichern
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
