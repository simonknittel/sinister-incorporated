import { authenticate } from "../../_lib/auth/authenticateAndAuthorize";
import getAllRoles from "./cached/getAllRoles";

export default async function getVisibleRoles() {
  const authentication = await authenticate();

  const allRoles = await getAllRoles();

  const visibleRoles = allRoles
    .filter((role) => {
      return (
        authentication &&
        authentication.authorize([
          {
            resource: "otherRole",
            operation: "read",
            attributes: [
              {
                key: "roleId",
                value: role.id,
              },
            ],
          },
        ])
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return visibleRoles;
}
