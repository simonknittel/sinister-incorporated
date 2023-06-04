import getVisibleRoles from "~/app/_lib/getVisibleRoles";
import RoleFilterButton from "./RoleFilterButton";
import UnknownFilterButton from "./UnknownFilterButton";

const Filters = async () => {
  const visibleRoles = await getVisibleRoles();

  return (
    <div className="flex gap-4 items-center">
      <p>Filter</p>

      <UnknownFilterButton />

      {visibleRoles.length > 0 && <RoleFilterButton roles={visibleRoles} />}
    </div>
  );
};

export default Filters;
