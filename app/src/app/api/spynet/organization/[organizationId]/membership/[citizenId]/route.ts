import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApi } from "../../../../../../../lib/auth/authenticateAndAuthorize";
import { prisma } from "../../../../../../../server/db";
import errorHandler from "../../../../../_lib/errorHandler";

type Params = Readonly<{
  organizationId: string;
  citizenId: string;
}>;

const paramsSchema = z.object({
  organizationId: z.string().cuid2(),
  citizenId: z.string().cuid2(),
});

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    /**
     * Authenticate the request
     */
    const authentication = await authenticateApi(
      "/api/spynet/organization/[organizationId]/membership/[citizenId]",
      "DELETE",
    );
    authentication.authorizeApi("organizationMembership", "create");

    /**
     * Validate the request
     */
    const paramsData = paramsSchema.parse(params);

    /**
     * Do the thing
     */
    const organizationMembership =
      await prisma.activeOrganizationMembership.findUnique({
        where: {
          organizationId_citizenId: {
            organizationId: paramsData.organizationId,
            citizenId: paramsData.citizenId,
          },
        },
        select: {
          visibility: true,
        },
      });

    if (!organizationMembership) throw new Error("Not Found");

    await prisma.$transaction([
      prisma.activeOrganizationMembership.delete({
        where: {
          organizationId_citizenId: {
            organizationId: paramsData.organizationId,
            citizenId: paramsData.citizenId,
          },
        },
      }),

      prisma.organizationMembershipHistoryEntry.create({
        data: {
          organization: {
            connect: {
              id: paramsData.organizationId,
            },
          },
          citizen: {
            connect: {
              id: paramsData.citizenId,
            },
          },
          type: "LEFT",
          visibility: organizationMembership.visibility,
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
        },
      }),
    ]);

    /**
     * Respond
     */
    return NextResponse.json({});
  } catch (error) {
    /**
     * Respond with an error
     */
    return errorHandler(error);
  }
}
