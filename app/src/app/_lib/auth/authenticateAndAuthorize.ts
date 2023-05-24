import { getServerSession, type Session } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "~/server/auth";
import comparePermissionSets from "./comparePermissionSets";
import { type PermissionSet } from "./PermissionSet";

export async function authenticate() {
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
}

export async function authenticatePage() {
  const authentication = await authenticate();
  if (!authentication) redirect("/");

  return {
    ...authentication,
    authorizePage: (requiredPermissionSets?: PermissionSet[]) => {
      const result = authentication.authorize(requiredPermissionSets);
      if (!result) redirect("/");
      return result;
    },
  };
}

export async function authenticateApi() {
  const authentication = await authenticate();
  if (!authentication) throw new Error("Unauthorized");

  return {
    ...authentication,
    authorizeApi: (requiredPermissionSets?: PermissionSet[]) => {
      const result = authentication.authorize(requiredPermissionSets);
      if (!result) throw new Error("Unauthorized");
      return result;
    },
  };
}

export function authorize(
  session?: Session | null,
  requiredPermissionSets?: PermissionSet[] | null
) {
  /**
   * Authenticate
   */
  if (!session) return false;

  /**
   * Authorize
   */
  if (session.user.role === "admin") return true;

  if (!requiredPermissionSets) return true;

  const result = comparePermissionSets(
    requiredPermissionSets,
    session.givenPermissionSets
  );

  if (!result) return false;

  return true;
}
