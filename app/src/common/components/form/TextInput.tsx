import clsx from "clsx";
import { useId, type ComponentProps, type ReactNode } from "react";

interface Props extends ComponentProps<"input"> {
  label: ReactNode;
  hint?: ReactNode;
}

export const TextInput = (props: Props) => {
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
        type="text"
        className="p-2 rounded-secondary bg-neutral-900 w-full mt-2"
        id={id}
        {...rest}
      />

      {hint && <p className="text-xs mt-1 text-gray-400">{hint}</p>}
    </>
  );
};
