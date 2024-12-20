import { saveObject } from "@/algolia";
import { authenticateApi } from "@/auth/server";
import { prisma } from "@/db";
import { log } from "@/logging";
import { ConfirmationStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { serializeError } from "serialize-error";
import { z } from "zod";
import apiErrorHandler from "../../../../lib/apiErrorHandler";
import { scrapeOrganizationLogo } from "../../../../lib/scrapeOrganizationLogo";

const postBodySchema = z.object({
  spectrumId: z.string().trim().min(1),
  name: z.string().trim().min(1),
});

export async function POST(request: Request) {
  try {
    /**
     * Authenticate the request
     */
    const authentication = await authenticateApi(
      "/api/spynet/organization",
      "POST",
    );
    authentication.authorizeApi("organization", "create");

    /**
     * Validate the request
     */
    const body: unknown = await request.json();
    const data = postBodySchema.parse(body);

    /**
     * Do the thing
     */
    const existingOrganization = await prisma.organization.findFirst({
      where: {
        spectrumId: data.spectrumId,
      },
    });
    if (existingOrganization) throw new Error("Duplicate");

    let logo: string | undefined;
    try {
      logo = await scrapeOrganizationLogo(data.spectrumId);
    } catch (error) {
      await log.error("Failed to scrape organization logo", {
        spectrumId: data.spectrumId,
        error: serializeError(error),
      });
    }

    const createdOrganization = await prisma.organization.create({
      data: {
        spectrumId: data.spectrumId,
        name: data.name,
        logo,
        createdBy: {
          connect: {
            /**
             * We can use `!` here since at this point it's guaranteed that the user has an entity attached.
             * This is because permissions are attached to the entity and above we check for permissions. If the
             * user wouldn't have an entity, they also wouldn't have permissions and the request would have been
             * rejected above.
             * The only exception is with the `adminEnabled` cookie.
             */
            id: authentication.session.entityId!,
          },
        },
        attributeHistoryEntries: {
          create: {
            createdBy: {
              connect: {
                id: authentication.session.entityId!,
              },
            },
            attributeKey: "name",
            newValue: data.name,
            confirmed: ConfirmationStatus.CONFIRMED,
            confirmedAt: new Date(),
            confirmedBy: {
              connect: {
                id: authentication.session.entityId!,
              },
            },
          },
        },
      },
      select: {
        id: true,
        spectrumId: true,
        name: true,
      },
    });

    /**
     * Add new organization to Algolia
     */
    await saveObject(createdOrganization.id, {
      type: "organization",
      spectrumId: createdOrganization.spectrumId,
      names: [createdOrganization.name],
    });

    /**
     * Respond
     */
    return NextResponse.json(createdOrganization);
  } catch (error) {
    /**
     * Respond with an error
     */
    return apiErrorHandler(error);
  }
}
