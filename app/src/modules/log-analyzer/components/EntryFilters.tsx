import { Button2 } from "@/modules/common/components/Button2";
import { YesNoCheckbox } from "@/modules/common/components/form/YesNoCheckbox";
import { Popover } from "@/modules/common/components/Popover";
import clsx from "clsx";
import { FaFilter } from "react-icons/fa";
import { useEntryFilterContext } from "./EntryFilterContext";

interface Props {
  readonly className?: string;
}

export const EntryFilters = ({ className }: Props) => {
  const {
    isHideCorpsesEnabled,
    setIsHideCorpsesEnabled,
    isHideNpcsEnabled,
    setIsHideNpcsEnabled,
  } = useEntryFilterContext();

  return (
    <Popover
      trigger={
        <Button2 variant="secondary" className={clsx(className)}>
          <FaFilter />
          Filter
        </Button2>
      }
      childrenClassName="flex flex-col gap-1 w-80"
      enableHover
    >
      <YesNoCheckbox
        yesLabel="Leichen"
        noLabel="Leichen"
        labelClassName="text-sm flex-1"
        checked={!isHideCorpsesEnabled}
        onChange={(e) => setIsHideCorpsesEnabled(!e.target.checked)}
      />

      <YesNoCheckbox
        yesLabel="NPC-Kills"
        noLabel="NPC-Kills"
        labelClassName="text-xs flex-1"
        checked={!isHideNpcsEnabled}
        onChange={(e) => setIsHideNpcsEnabled(!e.target.checked)}
      />
    </Popover>
  );
};
