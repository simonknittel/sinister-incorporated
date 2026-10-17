import {
  getApplicationContext,
  throwApplicationErrorForPage,
  toActor,
} from "@/modules/application";
import { requireAuthentication } from "@/modules/auth/server";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  getOrganization,
  getOrganizationInputSchema,
} from "@sam-monorepo/application";
import type { Organization } from "@sam-monorepo/database/client";
import { notFound } from "next/navigation";
import { cache } from "react";

/** The organization with its members, or the not-found page */
export const getOrganizationById = cache(
  withTrace("getOrganizationById", async (id: Organization["id"]) => {
    const { session } = await requireAuthentication();

    // The id comes from the URL: an id that is not valid names no organization
    const input = getOrganizationInputSchema.safeParse({ organization_id: id });
    if (!input.success) notFound();

    try {
      return await getOrganization(
        getApplicationContext(),
        await toActor(session),
        input.data,
      );
    } catch (error) {
      return throwApplicationErrorForPage(error);
    }
  }),
);
