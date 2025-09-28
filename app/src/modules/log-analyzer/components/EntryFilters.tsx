import { Button2 } from "@/modules/common/components/Button2";
import { YesNoCheckbox } from "@/modules/common/components/form/YesNoCheckbox";
import { Popover } from "@/modules/common/components/Popover";
import clsx from "clsx";
import { FaFilter } from "react-icons/fa";
import { EntryFilterKey, useEntryFilterContext } from "./EntryFilterContext";

interface Props {
  readonly className?: string;
}

export const EntryFilters = ({ className }: Props) => {
  const { entryFilters, setEntryFilters } = useEntryFilterContext();

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
        checked={!entryFilters[EntryFilterKey.HideCorpses]}
        onChange={(e) =>
          setEntryFilters(EntryFilterKey.HideCorpses, !e.target.checked)
        }
      />

      <YesNoCheckbox
        yesLabel="Spieler-Kills"
        noLabel="Spieler-Kills"
        labelClassName="text-xs flex-1"
        checked={!entryFilters[EntryFilterKey.HidePlayerKills]}
        onChange={(e) =>
          setEntryFilters(EntryFilterKey.HidePlayerKills, !e.target.checked)
        }
      />

      <YesNoCheckbox
        yesLabel="NPC-Kills"
        noLabel="NPC-Kills"
        labelClassName="text-xs flex-1"
        checked={!entryFilters[EntryFilterKey.HideNpcKills]}
        onChange={(e) =>
          setEntryFilters(EntryFilterKey.HideNpcKills, !e.target.checked)
        }
      />

      <YesNoCheckbox
        yesLabel="Shard-Beitritte"
        noLabel="Shard-Beitritte"
        labelClassName="text-sm flex-1"
        checked={!entryFilters[EntryFilterKey.HideJoinPu]}
        onChange={(e) =>
          setEntryFilters(EntryFilterKey.HideJoinPu, !e.target.checked)
        }
      />
    </Popover>
  );
};
