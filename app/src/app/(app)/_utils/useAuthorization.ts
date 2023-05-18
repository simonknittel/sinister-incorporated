import { type Permission } from "@prisma/client";
import { useSession } from "next-auth/react";

export default function useAuthorization(
  permissionKeys?: Permission["key"] | Permission["key"][]
) {
  const { data: session } = useSession();

  if (!session) return false;

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
