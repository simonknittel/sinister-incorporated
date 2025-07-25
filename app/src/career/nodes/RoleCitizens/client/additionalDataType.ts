import type { getCitizensGroupedByVisibleRoles } from "@/citizen/queries";
import type {
  getMyAssignedRoles,
  getVisibleRoles,
} from "@/roles/utils/getRoles";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type AdditionalDataType = {
  roles: Awaited<ReturnType<typeof getVisibleRoles>>;
  assignedRoles: Awaited<ReturnType<typeof getMyAssignedRoles>>;
  citizensGroupedByVisibleRoles: Awaited<
    ReturnType<typeof getCitizensGroupedByVisibleRoles>
  >;
};
