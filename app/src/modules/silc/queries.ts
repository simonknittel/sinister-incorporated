import { prisma } from "@/db";
import { requireAuthentication } from "@/modules/auth/server";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import type {
  Entity,
  ProfitDistributionCycle,
  SilcSettingKey,
} from "@prisma/client";
import { forbidden } from "next/navigation";
import { cache } from "react";
import { getCurrentPhase } from "./utils/getCurrentPhase";
import { getMyPayoutState } from "./utils/getMyPayoutStatus";

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

    return await getSilcTransactionsOfAllCitizensWithoutAuthorization();
  }),
);

export const getSilcTransactionsOfAllCitizensWithoutAuthorization = cache(
  withTrace(
    "getSilcTransactionsOfAllCitizensWithoutAuthorization",
    async () => {
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
    },
  ),
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

export const getRoleSalaries = cache(
  withTrace("getRoleSalaries", async () => {
    return prisma.silcRoleSalary.findMany();
  }),
);

export const getMonthlySalaryOfCurrentCitizen = cache(
  withTrace("monthlySalaryOfCurrentCitizen", async () => {
    const authentication = await requireAuthentication();
    if (!authentication.session.entity) return null;
    if (
      !(await authentication.authorize("silcBalanceOfCurrentCitizen", "read"))
    )
      forbidden();

    const roleSalaries = await prisma.silcRoleSalary.findMany({
      where: {
        roleId: {
          in: authentication.session.entity.roles?.split(",") || [],
        },
      },
    });

    return roleSalaries.reduce((total, salary) => total + salary.value, 0);
  }),
);

export const getProfitDistributionCycles = cache(
  withTrace("getProfitDistributionCycles", async (status = "open") => {
    const authentication = await requireAuthentication();
    if (!(await authentication.authorize("profitDistributionCycle", "read")))
      forbidden();

    // TODO: Only return past and current cycle for users without the manage permission
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cycles = await prisma.profitDistributionCycle.findMany({
      where: {
        ...(status === "open"
          ? {
              OR: [{ payoutEndedAt: null }, { payoutEndedAt: { gt: today } }],
            }
          : {
              payoutEndedAt: {
                lt: today,
              },
            }),
      },
      orderBy: {
        collectionEndedAt: "desc",
      },
      include: {
        participants: true,
      },
    });

    return Promise.all(
      cycles.map(async (cycle) => {
        const currentPhase = getCurrentPhase(cycle);

        const myParticipant = cycle.participants.find(
          (participant) =>
            participant.citizenId === authentication.session.entity!.id,
        );

        const mySilcBalance =
          currentPhase === 1
            ? await getSilcBalanceOfCurrentCitizen()
            : myParticipant?.silcBalanceSnapshot || 0;

        const myShare = "-"; // TODO: Calculate based on auecProfit and myParticipant.silcBalanceSnapshot

        const myPayoutState = getMyPayoutState(cycle, myParticipant);

        // TODO: Remove cycle.participants if the user doesn't have the manage permission

        return {
          cycle,
          currentPhase,
          myParticipant,
          mySilcBalance,
          myShare,
          myPayoutState,
        };
      }),
    );
  }),
);

export const getProfitDistributionCyclesById = cache(
  withTrace(
    "getProfitDistributionCyclesById",
    async (id: ProfitDistributionCycle["id"]) => {
      const authentication = await requireAuthentication();
      if (!(await authentication.authorize("profitDistributionCycle", "read")))
        forbidden();

      const cycle = await prisma.profitDistributionCycle.findUnique({
        where: {
          id,
        },
        include: {
          participants: {
            include: {
              disbursedBy: {
                select: {
                  id: true,
                  handle: true,
                },
              },
            },
          },
        },
      });

      if (!cycle) return null;

      const currentPhase = getCurrentPhase(cycle);

      const myParticipant = cycle.participants.find(
        (participant) =>
          participant.citizenId === authentication.session.entity!.id,
      );

      const mySilcBalance =
        currentPhase === 1
          ? await getSilcBalanceOfCurrentCitizen()
          : myParticipant?.silcBalanceSnapshot || 0;

      const myShare = "???"; // TODO: Calculate based on auecProfit and myParticipant.silcBalanceSnapshot

      const myPayoutState = getMyPayoutState(cycle, myParticipant);

      // TODO: Remove cycle.participants if the user doesn't have the manage permission

      return {
        cycle,
        currentPhase,
        myParticipant,
        mySilcBalance,
        myShare,
        myPayoutState,
      };
    },
  ),
);
