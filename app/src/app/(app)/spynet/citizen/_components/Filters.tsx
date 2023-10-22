import getVisibleRoles from "~/app/_lib/getVisibleRoles";
import RoleFilter from "./RoleFilter";
import UnknownsFilter from "./UnknownsFilter";

const Filters = async () => {
  const visibleRoles = await getVisibleRoles();

  return (
    <div className="flex gap-4 items-center">
      <p>Filter</p>

      <UnknownsFilter />

      {visibleRoles.length > 0 && <RoleFilter roles={visibleRoles} />}
    </div>
  );
};

export default Filters;
