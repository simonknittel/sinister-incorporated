import { authenticate } from "./auth/authenticateAndAuthorize";
import getAllRoles from "./cached/getAllRoles";

export default async function getVisibleRoles() {
  const authentication = await authenticate();

  const allRoles = await getAllRoles();

  const visibleRoles = allRoles.filter((role) => {
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
  });

  return visibleRoles;
}
