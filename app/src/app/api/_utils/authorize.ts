import { type Permission } from "@prisma/client";
import { type Session } from "next-auth";

export function authorize(session: Session, permissionKey: Permission["key"]) {
  if (!session) throw new Error("Unauthorized");

  if (session.user.role === "admin") return true;

  if (session.permissions.includes(permissionKey)) return true;

  throw new Error("Unauthorized");
}
