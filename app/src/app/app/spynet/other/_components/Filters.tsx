import { entityLogTypeTranslations } from "@/common/utils/entityLogTypeTranslations";
import type { EntityLogType } from "@/types";
import { Filter } from "../../_components/Filter";
import ConfirmationStateFilter from "./ConfirmationStateFilter";
import { EntityLogTypeFilter } from "./EntityLogTypeFilter";
import { type Row } from "./Table";

type Props = Readonly<{
  rows: Row[];
}>;

export const Filters = ({ rows }: Props) => {
  const confirmationStates = new Set<string>();
  const entityLogTypes = new Map<EntityLogType, string>();

  for (const row of rows) {
    if (row.confirmationState) {
      confirmationStates.add(row.confirmationState);
    } else {
      confirmationStates.add("unconfirmed");
    }

    if (row.entityLog.type) {
      entityLogTypes.set(
        row.entityLog.type as EntityLogType,
        entityLogTypeTranslations[row.entityLog.type],
      );
    }
  }
  return (
    <div className="flex gap-4 items-center">
      <p>Filter</p>

      {confirmationStates.size > 0 && (
        <Filter name="Bestätigungsstatus">
          <ConfirmationStateFilter
            confirmationStates={Array.from(confirmationStates)}
          />
        </Filter>
      )}

      {entityLogTypes.size > 0 && (
        <Filter name="Merkmal">
          <EntityLogTypeFilter entityLogTypes={entityLogTypes} />
        </Filter>
      )}
    </div>
  );
};
