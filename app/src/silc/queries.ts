import { requireAuthentication } from "@/auth/server";
import { prisma } from "@/db";
import { withTrace } from "@/tracing/utils/withTrace";
import type { Entity, SilcSettingKey } from "@prisma/client";
import { forbidden } from "next/navigation";
import { cache } from "react";

export const getSilcBalanceOfCurrentCitizen = cache(
  withTrace("getSilcBalanceOfCurrentCitizen", async () => {
    const authentication = await requireAuthentication();
    if (!authentication.session.entity) forbidden();
    if (
      !(await authentication.authorize("silcBalanceOfCurrentCitizen", "read"))
    )
      forbidden();

    const entity = await prisma.entity.findUniqueOrThrow({
      where: {
        id: authentication.session.entity.id,
      },
      select: {
        silcBalance: true,
      },
    });

    return entity.silcBalance;
  }),
);

export const getSilcBalanceOfAllCitizens = cache(
  withTrace("getSilcBalanceOfAllCitizens", async () => {
    const authentication = await requireAuthentication();
    if (!(await authentication.authorize("silcBalanceOfOtherCitizen", "read")))
      forbidden();

    return await prisma.entity.findMany({
      where: {
        totalEarnedSilc: {
          not: {
            equals: 0,
          },
        },
      },
      select: {
        id: true,
        handle: true,
        silcBalance: true,
        totalEarnedSilc: true,
      },
      orderBy: {
        silcBalance: "desc",
      },
    });
  }),
);

export const getSilcTransactionsOfAllCitizens = cache(
  withTrace("getSilcTransactionsOfAllCitizens", async () => {
    const authentication = await requireAuthentication();
    if (
      !(await authentication.authorize("silcTransactionOfOtherCitizen", "read"))
    )
      forbidden();

    return await prisma.silcTransaction.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        receiver: {
          select: {
            id: true,
            handle: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            handle: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            handle: true,
          },
        },
      },
    });
  }),
);

export const getSilcTransactionsOfCitizen = cache(
  withTrace("getSilcTransactionsOfCitizen", async (citizenId: Entity["id"]) => {
    const authentication = await requireAuthentication();
    if (!authentication.session.entity) forbidden();
    if (
      !(await authentication.authorize(
        "silcTransactionOfOtherCitizen",
        "read",
      )) &&
      !(
        citizenId === authentication.session.entity.id &&
        (await authentication.authorize(
          "silcTransactionOfCurrentCitizen",
          "read",
        ))
      )
    )
      forbidden();

    return prisma.silcTransaction.findMany({
      where: {
        receiverId: citizenId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        receiver: {
          select: {
            id: true,
            handle: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            handle: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            handle: true,
          },
        },
      },
    });
  }),
);

export const getSilcSetting = cache(
  withTrace("getSilcSetting", async (key: SilcSettingKey) => {
    return prisma.silcSetting.findUnique({
      where: {
        key,
      },
    });
  }),
);
