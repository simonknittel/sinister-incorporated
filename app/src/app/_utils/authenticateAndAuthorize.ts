import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "~/server/auth";
import { type PermissionKey } from "../(app)/roles/_utils/permissionGroups";

export async function authenticateAndAuthorize(
  permissionKeys?: PermissionKey | PermissionKey[]
) {
  const session = await getServerSession(authOptions);

  // Authenticate
  if (!session) return false;

  // Authorize
  if (permissionKeys) {
    if (session.user.role === "admin") return session;

    if (typeof permissionKeys === "string") {
      if (session.permissions.includes(permissionKeys)) return session;
    } else {
      if (
        session.permissions.some((permission) =>
          permissionKeys.includes(permission)
        )
      )
        return session;
    }

    return false;
  } else {
    return session;
  }
}

export async function authenticateAndAuthorizeApi(
  permissionKeys?: PermissionKey | PermissionKey[]
) {
  const session = await authenticateAndAuthorize(permissionKeys);
  if (session) return session;

  throw new Error("Unauthorized");
}

export async function authenticateAndAuthorizePage(
  permissionKeys?: PermissionKey | PermissionKey[]
) {
  const session = await authenticateAndAuthorize(permissionKeys);
  if (session) return session;

  redirect("/");
}
