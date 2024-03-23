import { getServerSession, type Session } from "next-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { log } from "~/_lib/logging";
import { authOptions } from "~/server/auth";
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

export async function authenticatePage() {
  const authentication = await authenticate();

  if (!authentication) {
    log.info("Unauthenticated request to page", {
      // TODO: Add request path
      reason: "No session",
    });

    redirect("/");
  }

  return {
    ...authentication,
    authorizePage: (requiredPermissionSets?: PermissionSet[]) => {
      const result = authentication.authorize(requiredPermissionSets);

      if (!result) {
        log.info("Unauthorized request to page", {
          userId: authentication.session.user.id,
          reason: "Insufficient permissions",
        });
        redirect("/");
      }

      return result;
    },
  };
}

export async function authenticateApi() {
  const authentication = await authenticate();
  if (!authentication) {
    log.info("Unauthenticated request to API", {
      reason: "No session",
    });
    throw new Error("Unauthorized");
  }

  return {
    ...authentication,
    authorizeApi: (requiredPermissionSets?: PermissionSet[]) => {
      const result = authentication.authorize(requiredPermissionSets);
      if (!result) {
        log.info("Unauthorized request to API", {
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
    throw new Error("Unauthorized");
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
