import getVisibleRoles from "~/app/_lib/getVisibleRoles";
import { Filter } from "../../_components/Filter";
import RoleFilter from "./RoleFilter";
import UnknownsFilter from "./UnknownsFilter";

const Filters = async () => {
  const visibleRoles = await getVisibleRoles();

  return (
    <div className="flex gap-4 items-center">
      <p>Filter</p>

      <Filter name="Unbekannt">
        <UnknownsFilter />
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
