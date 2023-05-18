import { type Permission } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "~/server/auth";

export async function authenticateAndAuthorize(
  permissionKeys?: Permission["key"] | Permission["key"][]
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
  permissionKeys?: Permission["key"] | Permission["key"][]
) {
  const session = await authenticateAndAuthorize(permissionKeys);
  if (session) return session;

  throw new Error("Unauthorized");
}

export async function authenticateAndAuthorizePage(
  permissionKeys?: Permission["key"] | Permission["key"][]
) {
  const session = await authenticateAndAuthorize(permissionKeys);
  if (session) return session;

  redirect("/");
}
