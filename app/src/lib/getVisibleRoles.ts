import { requireAuthentication } from "./auth/authenticateAndAuthorize";
import getAllRoles from "./cached/getAllRoles";

export default async function getVisibleRoles() {
  const authentication = await requireAuthentication();

  const allRoles = await getAllRoles();

  const visibleRoles = allRoles
    .filter((role) => {
      return authentication.authorize("otherRole", "read", [
        {
          key: "roleId",
          value: role.id,
        },
      ]);
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return visibleRoles;
}
