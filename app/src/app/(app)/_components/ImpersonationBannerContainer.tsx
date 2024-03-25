import { cookies } from "next/headers";
import { prisma } from "../../../server/db";
import ImpersonationBanner from "./ImpersonationBanner";

async function getImpersonatedRoles() {
  const cookieStore = cookies();
  const impersonate = cookieStore.get("impersonate");

  if (!impersonate) return null;

  return prisma.role.findMany({
    where: { id: { in: impersonate.value.split(",") } },
  });
}

const ImpersonationBannerContainer = async () => {
  const impersonatedRoles = await getImpersonatedRoles();

  if (!impersonatedRoles) return null;

  return <ImpersonationBanner roles={impersonatedRoles} />;
};

export default ImpersonationBannerContainer;
