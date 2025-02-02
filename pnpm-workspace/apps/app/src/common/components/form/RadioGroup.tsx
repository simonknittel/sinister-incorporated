import * as RemixRadioGroup from "@radix-ui/react-radio-group";
import clsx from "clsx";
import { useId } from "react";

type Props = Readonly<{
  className?: string;
  name: string;
  items: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}>;

export const RadioGroup = ({
  className,
  name,
  items,
  value,
  onChange,
}: Props) => {
  const idPrefix = useId();

  return (
    <RemixRadioGroup.Root
      defaultValue="role"
      value={value}
      onValueChange={onChange}
      className={clsx("flex", className)}
      orientation="horizontal"
      aria-label="Typ"
      name={name}
    >
      {items.map((item, index) => (
        <div key={item.value}>
          <RemixRadioGroup.Item
            className="peer sr-only"
            value={item.value}
            id={`${idPrefix}_${item.value}`}
          >
            <RemixRadioGroup.Indicator />
          </RemixRadioGroup.Item>

          <label
            htmlFor={`${idPrefix}_${item.value}`}
            className={clsx(
              "border border-sinister-red-500 h-8 flex items-center justify-center px-3 gap-2 uppercase cursor-pointer text-sinister-red-500 hover:text-sinister-red-300 hover:border-sinister-red-300 peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-1 peer-aria-checked:bg-sinister-red-500 peer-aria-checked:text-white",
              {
                "rounded-l": index === 0,
                "rounded-r": index === items.length - 1,
              },
            )}
          >
            {item.label}
          </label>
        </div>
      ))}
    </RemixRadioGroup.Root>
  );
};
