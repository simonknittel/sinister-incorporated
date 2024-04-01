import { type Organization } from "@prisma/client";
import Link from "next/link";
import { FaExternalLinkAlt } from "react-icons/fa";
import { requireAuthentication } from "../../../../../lib/auth/authenticateAndAuthorize";

export const mapOrganizationEntries = async (
  entries: Array<Pick<Organization, "id" | "createdAt" | "name">>,
) => {
  const authentication = await requireAuthentication();

  if (!authentication.authorize("organization", "read")) return [];

  return entries.map((entry) => ({
    key: `${entry.id}-${entry.createdAt.getTime()}`,
    date: entry.createdAt,
    message: (
      <p>
        Organisation{" "}
        <Link
          href={`/app/spynet/organization/${entry.id}`}
          className="inline-flex gap-1 items-center text-sinister-red-500 hover:text-sinister-red-300"
        >
          {entry.name} <FaExternalLinkAlt className="text-xs" />
        </Link>{" "}
        erstellt
      </p>
    ),
  }));
};
