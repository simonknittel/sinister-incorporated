import { RadioFilter } from "@/modules/common/components/layouts/SidebarLayout/Filters/RadioFilter";
import { ShipChangeFilter } from "@sam-monorepo/application";

export const ShipChangesFilters = () => {
  return (
    <>
      <RadioFilter
        name="changeType"
        label="Typ"
        items={[
          { value: ShipChangeFilter.Both, label: "Alle", default: true },
          { value: ShipChangeFilter.Creation, label: "Erstellt" },
          { value: ShipChangeFilter.Deletion, label: "Gelöscht" },
        ]}
        resetCursorPagination
      />
    </>
  );
};
