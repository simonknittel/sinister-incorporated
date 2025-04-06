import clsx from "clsx";
import { useId, type ComponentProps } from "react";

type Props = ComponentProps<"input"> & {
  label: string;
  hint?: string;
};

export const NumberInput = (props: Props) => {
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
        type="number"
        className="p-2 rounded bg-neutral-900 w-full mt-2"
        id={id}
        {...rest}
      />

      {hint && <p className="text-xs mt-1 text-gray-400">{hint}</p>}
    </>
  );
};
