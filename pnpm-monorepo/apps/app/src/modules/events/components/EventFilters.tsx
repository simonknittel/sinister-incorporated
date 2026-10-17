import { RadioFilter } from "@/modules/common/components/layouts/SidebarLayout/Filters/RadioFilter";
import {
  EventListStatus,
  EventParticipationFilter,
  EventTypeFilter,
} from "@sam-monorepo/application";

export const EventFilters = () => {
  return (
    <>
      <RadioFilter
        name="status"
        label="Status"
        items={[
          { value: EventListStatus.Open, label: "Offen", default: true },
          { value: EventListStatus.New, label: "Neu" },
          { value: EventListStatus.Closed, label: "Geschlossen" },
        ]}
        resetCursorPagination
      />

      <RadioFilter
        name="participating"
        label="Zugesagt von"
        items={[
          {
            value: EventParticipationFilter.All,
            label: "Alle",
            default: true,
          },
          { value: EventParticipationFilter.Me, label: "Mir" },
        ]}
        resetCursorPagination
      />

      <RadioFilter
        name="type"
        label="Typ"
        items={[
          { value: EventTypeFilter.All, label: "Alle", default: true },
          { value: EventTypeFilter.App, label: "App" },
          { value: EventTypeFilter.Discord, label: "Discord" },
        ]}
        resetCursorPagination
      />
    </>
  );
};
