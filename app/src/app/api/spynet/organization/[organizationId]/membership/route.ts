import { authenticateApi } from "@/auth/server";
import { prisma } from "@/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import apiErrorHandler from "../../../../../../lib/apiErrorHandler";

type Params = Readonly<{
  organizationId: string;
}>;

const paramsSchema = z.object({ organizationId: z.string().cuid2() });

const postBodySchema = z.object({
  citizenId: z.string().cuid2(),
  type: z.union([z.literal("MAIN"), z.literal("AFFILIATE")]),
  redacted: z.union([z.literal("REDACTED"), z.literal(false)]),
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
    authentication.authorizeApi("organizationMembership", "create");

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
      authentication.authorize("organizationMembership", "confirm")
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
            visibility: data.redacted || "PUBLIC",
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
            visibility: data.redacted || "PUBLIC",
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
          visibility: data.redacted,
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
    return apiErrorHandler(error);
  }
}
