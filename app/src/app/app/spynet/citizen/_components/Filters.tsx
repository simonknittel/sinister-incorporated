import { requireAuthentication } from "@/auth/server";
import getVisibleRoles from "@/common/utils/getVisibleRoles";
import { Filter } from "../../_components/Filter";
import RoleFilter from "./RoleFilter";
import { UnknownsFilter } from "./UnknownsFilter";

export const Filters = async () => {
  const authentication = await requireAuthentication();

  const visibleRoles = await getVisibleRoles();

  return (
    <div className="flex gap-4 items-center">
      <p>Filter</p>

      <Filter name="Unbekannt">
        <UnknownsFilter
          showDiscordId={authentication.authorize("discord-id", "read")}
          showTeamspeakId={authentication.authorize("teamspeak-id", "read")}
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
