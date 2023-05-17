import { type Permission } from "@prisma/client";
import { type Session } from "next-auth";

export function authorize(
  permissionKeys: Permission["key"] | Permission["key"][],
  session?: Session | null
) {
  if (!session) return false;

  if (session.user.role === "admin") return true;

  if (typeof permissionKeys === "string") {
    if (session.permissions.includes(permissionKeys)) return true;
  } else {
    if (
      session.permissions.some((permission) =>
        permissionKeys.includes(permission)
      )
    )
      return true;
  }

  return false;
}

export function authorizeApi(
  permissionKeys: Permission["key"] | Permission["key"][],
  session?: Session | null
) {
  if (authorize(permissionKeys, session)) return true;
  throw new Error("Unauthorized");
}
