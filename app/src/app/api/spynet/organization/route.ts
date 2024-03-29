import { NextResponse } from "next/server";
import { z } from "zod";
import { saveObject } from "../../../../lib/algolia";
import { authenticateApi } from "../../../../lib/auth/authenticateAndAuthorize";
import { getUnleashFlag } from "../../../../lib/getUnleashFlag";
import { prisma } from "../../../../server/db";
import errorHandler from "../../_lib/errorHandler";

const postBodySchema = z.object({
  spectrumId: z.string().trim().min(1),
  name: z.string().trim().min(1),
});

export async function POST(request: Request) {
  try {
    if (!(await getUnleashFlag("EnableOrganizations")))
      throw new Error("Not Found");

    /**
     * Authenticate the request
     */
    const authentication = await authenticateApi(
      "/api/spynet/organization",
      "POST",
    );
    authentication.authorizeApi([
      {
        resource: "organization",
        operation: "create",
      },
    ]);

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

    const createdOrganization = await prisma.organization.create({
      data: {
        spectrumId: data.spectrumId,
        name: data.name,
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
            confirmed: "CONFIRMED",
            confirmedAt: new Date(),
            confirmedBy: {
              connect: {
                id: authentication.session.entityId!,
              },
            },
          },
        },
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
    return errorHandler(error);
  }
}
