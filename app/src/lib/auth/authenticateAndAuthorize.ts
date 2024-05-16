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

  if (!session) return false;

  return {
    session,
    authorize: (
      resource: PermissionSet["resource"],
      operation: PermissionSet["operation"],
      attributes?: PermissionSet["attributes"],
    ) => authorize(session, resource, operation, attributes),
  };
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

  if (!authentication.authorize("login", "manage")) redirect("/clearance");

  return {
    ...authentication,
    authorizePage: (
      resource: PermissionSet["resource"],
      operation: PermissionSet["operation"],
      attributes?: PermissionSet["attributes"],
    ) => {
      const result = authentication.authorize(resource, operation, attributes);

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

  if (!authentication.authorize("login", "manage"))
    throw new Error("Unauthorized");

  return {
    ...authentication,
    authorizeApi: (
      resource: PermissionSet["resource"],
      operation: PermissionSet["operation"],
      attributes?: PermissionSet["attributes"],
    ) => {
      const result = authentication.authorize(resource, operation, attributes);

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
  session: Session,
  resource: PermissionSet["resource"],
  operation: PermissionSet["operation"],
  attributes?: PermissionSet["attributes"],
) {
  if (
    session.user.role === "admin" &&
    cookies().get("enableAdmin")?.value === "enableAdmin"
  ) {
    return operation !== "negate";
  }

  const result = comparePermissionSets(
    {
      resource,
      operation,
      attributes,
    },
    session.givenPermissionSets,
  );
  if (!result) return false;

  return true;
}
