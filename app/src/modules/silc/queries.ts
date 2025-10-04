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
import { getAuecPerSilc } from "./utils/getAuecPerSilc";
import { CyclePhase, getCurrentPhase } from "./utils/getCurrentPhase";
import { getPayoutState } from "./utils/getMyPayoutStatus";
import { getMyShare } from "./utils/getMyShare";
import { getOpenAuecPayout } from "./utils/getOpenAuecPayout";
import { getPaidAuec } from "./utils/getPaidAuec";
import { getTotalSilc } from "./utils/getTotalSilc";

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
    const hasProfitDistributionCycleManage = await authentication.authorize(
      "profitDistributionCycle",
      "manage",
    );

    // TODO: Only return past and current cycle for users without the manage permission
    const today = new Date();
    // today.setHours(0, 0, 0, 0);

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

    let currentCollectionCycle: string | null = null;

    return Promise.all(
      cycles
        .filter((cycle) => {
          if (status !== "open") return true;

          if (hasProfitDistributionCycleManage) return true;

          const currentPhase = getCurrentPhase(cycle);

          if (currentPhase === CyclePhase.Collection) {
            if (!currentCollectionCycle) {
              currentCollectionCycle = cycle.id;
              return true;
            }
            return false;
          }

          if (
            [CyclePhase.PayoutPreparation, CyclePhase.Payout].includes(
              currentPhase,
            )
          )
            return true;

          return false;
        })
        .map(async (cycle) => {
          const currentPhase = getCurrentPhase(cycle);
          const myParticipant = cycle.participants.find(
            (participant) =>
              participant.citizenId === authentication.session.entity!.id,
          );
          const mySilcBalance =
            currentPhase === CyclePhase.Collection
              ? await getSilcBalanceOfCurrentCitizen()
              : myParticipant?.silcBalanceSnapshot || 0;
          const totalSilc = getTotalSilc(cycle.participants);
          const auecPerSilc =
            cycle.auecProfit !== null
              ? getAuecPerSilc(cycle.auecProfit, totalSilc)
              : 0;
          const myShare = getMyShare(mySilcBalance, auecPerSilc);
          const myPayoutState = getPayoutState(cycle, myParticipant);

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

export const getProfitDistributionCycleById = cache(
  withTrace(
    "getProfitDistributionCycleById",
    async (id: ProfitDistributionCycle["id"]) => {
      const authentication = await requireAuthentication();
      const [hasProfitDistributionCycleRead, hasProfitDistributionCycleManage] =
        await Promise.all([
          authentication.authorize("profitDistributionCycle", "read"),
          authentication.authorize("profitDistributionCycle", "manage"),
        ]);
      if (!hasProfitDistributionCycleRead) forbidden();

      const cycle = await prisma.profitDistributionCycle.findUnique({
        where: {
          id,
        },
        include: {
          participants: {
            include: {
              citizen: {
                select: {
                  id: true,
                  handle: true,
                  silcBalance: true,
                },
              },
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
        currentPhase === CyclePhase.Collection
          ? await getSilcBalanceOfCurrentCitizen()
          : myParticipant?.silcBalanceSnapshot || 0;
      const totalSilc = getTotalSilc(cycle.participants);
      const auecPerSilc =
        cycle.auecProfit !== null
          ? getAuecPerSilc(cycle.auecProfit, totalSilc)
          : null;
      const myShare =
        auecPerSilc !== null ? getMyShare(mySilcBalance, auecPerSilc) : null;
      const myPayoutState = getPayoutState(cycle, myParticipant);
      const allSilcBalances = hasProfitDistributionCycleManage
        ? (await getSilcBalanceOfAllCitizens()).filter(
            (citizen) => citizen.silcBalance > 0,
          )
        : [];
      const openAuecPayout =
        auecPerSilc !== null
          ? getOpenAuecPayout(cycle.participants, auecPerSilc)
          : null;
      const paidAuec =
        auecPerSilc !== null
          ? getPaidAuec(cycle.participants, auecPerSilc)
          : null;

      // TODO: Remove cycle.participants if the user doesn't have the manage permission

      return {
        cycle,
        currentPhase,
        myParticipant,
        mySilcBalance,
        myShare,
        myPayoutState,
        allSilcBalances,
        totalSilc,
        openAuecPayout,
        paidAuec,
        auecPerSilc,
      };
    },
  ),
);
