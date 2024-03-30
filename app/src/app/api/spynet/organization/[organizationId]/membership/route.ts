import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApi } from "../../../../../../lib/auth/authenticateAndAuthorize";
import { prisma } from "../../../../../../server/db";
import errorHandler from "../../../../_lib/errorHandler";

type Params = Readonly<{
  organizationId: string;
}>;

const paramsSchema = z.object({ organizationId: z.string().cuid2() });

const postBodySchema = z.object({
  citizenId: z.string().cuid2(),
  type: z.union([z.literal("MAIN"), z.literal("AFFILIATE")]),
  visibility: z.union([z.literal("PUBLIC"), z.literal("REDACTED")]),
  confirmed: z.literal("CONFIRMED").optional(),
});

export async function POST(request: Request, { params }: { params: Params }) {
  try {
    /**
     * Authenticate the request
     */
    const authentication = await authenticateApi(
      "/api/spynet/organization/[organizationId]/membership",
      "POST",
    );
    authentication.authorizeApi([
      {
        resource: "organizationMembership",
        operation: "create",
      },
    ]);

    /**
     * Validate the request
     */
    const paramsData = paramsSchema.parse(params);
    const body: unknown = await request.json();
    const data = postBodySchema.parse(body);

    /**
     * Do the thing
     */
    if (
      data.confirmed === "CONFIRMED" &&
      authentication.authorize([
        { resource: "organizationMembership", operation: "confirm" },
      ])
    ) {
      await prisma.$transaction([
        prisma.activeOrganizationMembership.create({
          data: {
            organization: {
              connect: {
                id: paramsData.organizationId,
              },
            },
            citizen: {
              connect: {
                id: data.citizenId,
              },
            },
            type: data.type,
            visibility: data.visibility,
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
                id: data.citizenId,
              },
            },
            type: data.type,
            visibility: data.visibility,
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
            confirmed: "CONFIRMED",
            confirmedAt: new Date(),
            confirmedBy: {
              connect: {
                id: authentication.session.entityId!,
              },
            },
          },
        }),
      ]);
    } else {
      await prisma.organizationMembershipHistoryEntry.create({
        data: {
          organization: {
            connect: {
              id: paramsData.organizationId,
            },
          },
          citizen: {
            connect: {
              id: data.citizenId,
            },
          },
          type: data.type,
          visibility: data.visibility,
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
      });
    }

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
