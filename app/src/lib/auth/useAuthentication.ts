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

    if (!requiredPermissionSets) return session;

    const enableAdmin =
      typeof document !== "undefined"
        ? document.cookie.includes("enableAdmin=enableAdmin")
        : false;

    if (session.user.role === "admin" && enableAdmin) return session;

    const result = comparePermissionSets(
      requiredPermissionSets,
      session.givenPermissionSets,
    );

    if (!result) return false;

    return session;
  }

  return { session, authorize };
}
