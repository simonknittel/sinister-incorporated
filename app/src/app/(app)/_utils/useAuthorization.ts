import { type Permission } from "@prisma/client";
import { useSession } from "next-auth/react";

export default function useAuthorization(permissionKeys?: Permission["key"][]) {
  const { data: session } = useSession();

  if (!session) return false;

  if (permissionKeys) {
    const obj: Record<string, boolean> = {};

    for (const key of permissionKeys) {
      obj[key] =
        session.user.role === "admin"
          ? true
          : session.permissions.some((permission) => permission === key);
    }

    return {
      session,
      ...obj,
    };
  }

  return { session };
}
