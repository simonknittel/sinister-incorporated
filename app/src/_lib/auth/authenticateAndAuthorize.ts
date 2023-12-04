import { getServerSession, type Session } from "next-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { log } from "~/_lib/logging";
import { authOptions } from "~/server/auth";
import comparePermissionSets from "./comparePermissionSets";
import { type PermissionSet } from "./PermissionSet";

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
    log.info("Unauthenticated request to API", {});
    throw new Error("Unauthorized");
  }

  return {
    ...authentication,
    authorizeApi: (requiredPermissionSets?: PermissionSet[]) => {
      const result = authentication.authorize(requiredPermissionSets);
      if (!result) {
        log.info("Unauthorized request to API", {
          userId: authentication.session.user.id,
        });
        throw new Error("Unauthorized");
      }
      return result;
    },
  };
}

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
    cookies().get("disableAdmin")?.value !== "disableAdmin"
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
