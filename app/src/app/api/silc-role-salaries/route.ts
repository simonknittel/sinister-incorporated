import apiErrorHandler from "@/common/utils/apiErrorHandler";
import { prisma } from "@/db";
import { env } from "@/env";
import { getRoleSalaries } from "@/silc/queries";
import { updateCitizensSilcBalances } from "@/silc/utils/updateCitizensSilcBalances";
import type { Entity, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { forbidden } from "next/navigation";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    if (
      env.CRON_SECRET &&
      request.headers.get("Authorization") !== `Bearer ${env.CRON_SECRET}`
    )
      return forbidden();

    const salaries = await getRoleSalaries();
    const now = new Date();

    const todaysSalaries = salaries.filter(
      (salary) => salary.dayOfMonth === now.getDate(),
    );

    const allCitizens = await prisma.entity.findMany({
      where: {
        roles: {
          not: null,
        },
      },
      orderBy: {
        handle: "asc",
      },
    });

    const citizensGroupedByRole = new Map<
      string,
      {
        role: Role;
        citizens: Entity[];
      }
    >();

    const allRoles = await prisma.role.findMany();

    for (const citizen of allCitizens) {
      const citizenRoleIds = citizen.roles?.split(",") ?? [];
      for (const citizenRoleId of citizenRoleIds) {
        const role = allRoles.find((r) => r.id === citizenRoleId);

        if (role) {
          if (!citizensGroupedByRole.has(role.id)) {
            citizensGroupedByRole.set(role.id, { role, citizens: [] });
          }

          citizensGroupedByRole.get(role.id)?.citizens.push(citizen);
        }
      }
    }

    for (const salary of todaysSalaries) {
      const group = citizensGroupedByRole.get(salary.roleId);
      if (!group) continue;

      await prisma.silcTransaction.createMany({
        data: group.citizens.map((citizen) => ({
          receiverId: citizen.id,
          value: salary.value,
          description: `Gehalt: ${group.role.name}`,
        })),
      });
    }

    /**
     * Update citizens' balances
     */
    const citizenIds = todaysSalaries.flatMap(
      (salary) =>
        citizensGroupedByRole
          .get(salary.roleId)
          ?.citizens.map((citizen) => citizen.id) || [],
    );
    await updateCitizensSilcBalances(citizenIds);

    /**
     * Revalidate cache(s)
     */
    revalidatePath("/app/silc");
    revalidatePath("/app/silc/transactions");
    revalidatePath("/app/dashboard");
    revalidatePath("/app/spynet/citizen/[id]/silc");

    return NextResponse.json({ success: "ok" });
  } catch (error) {
    return apiErrorHandler(error);
  }
}
