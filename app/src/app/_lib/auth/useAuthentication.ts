"use client";

import { useSession } from "next-auth/react";
import { type PermissionSet } from "./PermissionSet";
import comparePermissionSets from "./comparePermissionSets";

export default function useAuthentication() {
  const { data: session } = useSession();

  /**
   * Authenticate
   */
  if (!session) return false;

  /**
   * Authorize
   */
  function authorize(requiredPermissionSets?: PermissionSet[]) {
    if (!session) return false;

    const disableAdmin =
      typeof document !== "undefined"
        ? document.cookie.includes("disableAdmin=disableAdmin")
        : false;

    if (session.user.role === "admin" && !disableAdmin) return session;

    if (!requiredPermissionSets) return session;

    const result = comparePermissionSets(
      requiredPermissionSets,
      session.givenPermissionSets
    );

    if (!result) return false;

    return session;
  }

  return { session, authorize };
}
