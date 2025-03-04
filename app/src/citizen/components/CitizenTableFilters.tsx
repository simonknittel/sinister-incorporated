import { requireAuthentication } from "@/auth/server";
import { getVisibleRoles } from "@/roles/utils/getRoles";
import { Filter } from "@/spynet/components/Filter";
import { RoleFilter } from "./RoleFilter";
import { UnknownsFilter } from "./UnknownsFilter";

export const CitizenTableFilters = async () => {
  const authentication = await requireAuthentication();
  const showDiscordId = await authentication.authorize("discord-id", "read");
  const showTeamspeakId = await authentication.authorize(
    "teamspeak-id",
    "read",
  );

  const visibleRoles = await getVisibleRoles();

  return (
    <div className="flex gap-4 items-center">
      <Filter name="Unbekannt">
        <UnknownsFilter
          showDiscordId={showDiscordId}
          showTeamspeakId={showTeamspeakId}
        />
      </Filter>

      {visibleRoles.length > 0 && (
        <Filter name="Rollen">
          <RoleFilter roles={visibleRoles} />
        </Filter>
      )}
    </div>
  );
};
