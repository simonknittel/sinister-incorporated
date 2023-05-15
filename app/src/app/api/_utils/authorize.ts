import { type Session } from "next-auth";

const actions = ["create", "read", "update", "delete"] as const;
type Actions = (typeof actions)[number];

const resourceTypes = ["User", "Manufacturer", "Series", "Variant"] as const;
type ResourceTypes = (typeof resourceTypes)[number];

export function authorize<T extends Actions>(
  user: Session["user"],
  action: T,
  resourceType: ResourceTypes
) {
  if (!user) throw new Error("Unauthorized");

  if (["User", "Manufacturer", "Series", "Variant"].includes(resourceType)) {
    if (user.role !== "admin") return true;
  }

  throw new Error("Unauthorized");
}
