import { getServerSession, type Session } from "next-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { authOptions } from "../../server/auth";
import {
  requireConfirmedEmailForApi,
  requireConfirmedEmailForPage,
} from "../emailConfirmation";
import { log } from "../logging";
import { type PermissionSet } from "./PermissionSet";
import comparePermissionSets from "./comparePermissionSets";

export const authenticate = cache(async () => {
  const session = await getServerSession(authOptions);

  if (session) {
    return {
      session,
      authorize: (requiredPermissionSets?: PermissionSet[]) =>
        authorize(session, requiredPermissionSets),
    };
  } else {
    return false;
  }
});

export async function authenticatePage(requestPath?: string) {
  const authentication = await authenticate();

  if (!authentication) {
    log.info("Unauthenticated request to page", {
      requestPath,
      reason: "No session",
    });

    redirect("/");
  }

  await requireConfirmedEmailForPage(authentication.session);

  if (
    !authentication.authorize([
      {
        resource: "login",
        operation: "manage",
      },
    ])
  )
    redirect("/clearance");

  return {
    ...authentication,
    authorizePage: (requiredPermissionSets?: PermissionSet[]) => {
      const result = authentication.authorize(requiredPermissionSets);

      if (!result) {
        log.info("Unauthorized request to page", {
          requestPath,
          userId: authentication.session.user.id,
          reason: "Insufficient permissions",
        });

        redirect("/app/unauthorized");
      }

      return result;
    },
  };
}

export async function authenticateApi(
  requestPath?: string,
  requestMethod?: string,
) {
  const authentication = await authenticate();

  if (!authentication) {
    log.info("Unauthenticated request to API", {
      requestPath,
      requestMethod,
      reason: "No session",
    });

    throw new Error("Unauthenticated");
  }

  await requireConfirmedEmailForApi(authentication.session);

  if (
    !authentication.authorize([
      {
        resource: "login",
        operation: "manage",
      },
    ])
  )
    throw new Error("Unauthorized");

  return {
    ...authentication,
    authorizeApi: (requiredPermissionSets?: PermissionSet[]) => {
      const result = authentication.authorize(requiredPermissionSets);

      if (!result) {
        log.info("Unauthorized request to API", {
          requestPath,
          requestMethod,
          userId: authentication.session.user.id,
          reason: "Insufficient permissions",
        });

        throw new Error("Unauthorized");
      }

      return result;
    },
  };
}

export const requireAuthentication = cache(async () => {
  const authentication = await authenticate();

  if (!authentication) {
    throw new Error("Unauthenticated");
  }

  return authentication;
});

export function authorize(
  session?: Session | null,
  requiredPermissionSets?: PermissionSet[] | null,
) {
  /**
   * Authenticate
   */
  if (!session) return false;

  /**
   * Authorize
   */
  if (!requiredPermissionSets) return true;

  if (
    session.user.role === "admin" &&
    cookies().get("enableAdmin")?.value === "enableAdmin"
  ) {
    if (
      requiredPermissionSets.find(
        (permissionSet) => permissionSet.operation === "negate",
      )
    )
      return false;

    return true;
  }

  const result = comparePermissionSets(
    requiredPermissionSets,
    session.givenPermissionSets,
  );
  if (!result) return false;

  return true;
}
