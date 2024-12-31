import { requireAuthentication } from "@/auth/server";
import { getAllRoles } from "./cached/getAllRoles";

export default async function getVisibleRoles() {
  const authentication = await requireAuthentication();

  const allRoles = await getAllRoles();

  const visibleRoles = (
    await Promise.all(
      allRoles.map(async (role) => {
        return {
          role,
          include: await authentication.authorize("otherRole", "read", [
            {
              key: "roleId",
              value: role.id,
            },
          ]),
        };
      }),
    )
  )
    .filter(({ include }) => include)
    .map(({ role }) => role)
    .sort((a, b) => a.name.localeCompare(b.name));

  return visibleRoles;
}
