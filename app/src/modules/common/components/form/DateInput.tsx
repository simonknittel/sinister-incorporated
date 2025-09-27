import clsx from "clsx";
import { useId, type ComponentProps } from "react";

interface Props extends ComponentProps<"input"> {
  label: string;
  hint?: string;
}

export const DateInput = (props: Props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { type, className, label, hint, ...rest } = props;

  const _id = useId();
  const id = rest.id || _id;

  return (
    <>
      <label className={clsx("block", className)} htmlFor={id}>
        {label}
      </label>

      <input
        type="date"
        className="p-2 rounded-secondary bg-neutral-900 border border-solid border-neutral-800 w-full mt-2 focus-visible:outline outline-2 outline-interaction-700 outline-offset-4"
        id={id}
        {...rest}
      />

      {hint && <p className="text-xs mt-1 text-gray-400">{hint}</p>}
    </>
  );
};
