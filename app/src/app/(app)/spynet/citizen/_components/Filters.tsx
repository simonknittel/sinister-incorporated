import { requireAuthentication } from "../../../../../_lib/auth/authenticateAndAuthorize";
import getVisibleRoles from "../../../../../_lib/getVisibleRoles";
import { Filter } from "../../_components/Filter";
import RoleFilter from "./RoleFilter";
import UnknownsFilter from "./UnknownsFilter";

const Filters = async () => {
  const authentication = await requireAuthentication();

  const visibleRoles = await getVisibleRoles();

  return (
    <div className="flex gap-4 items-center">
      <p>Filter</p>

      <Filter name="Unbekannt">
        <UnknownsFilter
          showDiscordId={authentication.authorize([
            {
              resource: "discord-id",
              operation: "read",
            },
          ])}
          showTeamspeakId={authentication.authorize([
            {
              resource: "teamspeak-id",
              operation: "read",
            },
          ])}
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

export default Filters;
