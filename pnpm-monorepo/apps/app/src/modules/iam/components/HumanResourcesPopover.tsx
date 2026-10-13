import { PopoverBaseUI } from "@/modules/common/components/PopoverBaseUI";

interface Props {
  readonly handles: readonly string[];
}

export const HumanResourcesPopover = ({ handles }: Props) => {
  return (
    <PopoverBaseUI
      title="Human Resources"
      trigger="Human Resources"
      triggerClassName="cursor-pointer underline decoration-dotted underline-offset-4 hover:text-interaction-500 focus-visible:text-interaction-500 active:text-interaction-300"
    >
      <p className="text-sm text-neutral-400">
        Wende dich an eine dieser Personen:
      </p>

      <ul className="mt-2">
        {handles.map((handle, index) => (
          <li key={`${handle}-${index}`}>{handle}</li>
        ))}
      </ul>
    </PopoverBaseUI>
  );
};
