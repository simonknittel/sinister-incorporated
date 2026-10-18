import { RadioFilter } from "@/modules/common/components/layouts/SidebarLayout/Filters/RadioFilter";
import { SingleSelectComboboxFilter } from "@/modules/common/components/layouts/SidebarLayout/Filters/SingleSelectComboboxFilter";
import { TextSearchFilter } from "@/modules/common/components/layouts/SidebarLayout/Filters/TextSearchFilter";
import { UserBanStatus, UserSort } from "../utils/userListSearchParams";

export const UsersFilters = () => {
  return (
    <>
      <TextSearchFilter label="Handle" resetCursorPagination />

      <SingleSelectComboboxFilter
        name="sort"
        label="Sortierung"
        items={[
          { value: UserSort.CreatedAtDescending, label: "Registriert am ↓" },
          { value: UserSort.CreatedAtAscending, label: "Registriert am ↑" },
          {
            value: UserSort.EmailVerifiedDescending,
            label: "Datenschutzerklärung ↓",
          },
          {
            value: UserSort.EmailVerifiedAscending,
            label: "Datenschutzerklärung ↑",
          },
          { value: UserSort.NameAscending, label: "Handle A - Z" },
          { value: UserSort.NameDescending, label: "Handle Z - A" },
        ]}
        resetCursorPagination
      />

      <RadioFilter
        name="banned"
        label="Gesperrt"
        items={[
          { value: UserBanStatus.All, label: "Alle", default: true },
          { value: UserBanStatus.Banned, label: "Nur gesperrte" },
          { value: UserBanStatus.Active, label: "Nur aktive" },
        ]}
        resetCursorPagination
      />
    </>
  );
};
