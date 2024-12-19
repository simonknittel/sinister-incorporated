"use client";

import { useSession } from "next-auth/react";
import { type PermissionSet } from "./PermissionSet";
import comparePermissionSets from "./comparePermissionSets";

export const useAuthentication = () => {
  const { data: session } = useSession();

  /**
   * Authenticate
   */
  if (!session) return false;

  /**
   * Authorize
   */
  function authorize(
    resource: PermissionSet["resource"],
    operation: PermissionSet["operation"],
    attributes?: PermissionSet["attributes"],
  ) {
    if (!session) return false;

    const enableAdmin =
      typeof document !== "undefined"
        ? document.cookie.includes("enableAdmin=enableAdmin")
        : false;

    if (session.user.role === "admin" && enableAdmin) return session;

    const result = comparePermissionSets(
      {
        resource,
        operation,
        attributes,
      },
      session.givenPermissionSets,
    );

    if (!result) return false;

    return session;
  }

  return { session, authorize };
};
