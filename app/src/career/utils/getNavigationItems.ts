import { authenticate } from "@/auth/server";
import type { Page } from "@/common/components/layouts/DefaultLayout/Navigation";
import { getMyReadableFlows } from "../queries";

export const getNavigationItems = async () => {
  const authentication = await authenticate();
  if (!authentication) return null;

  const flows = await getMyReadableFlows();

  const pages: Page[] = flows.map((flow) => ({
    name: flow.name,
    path: `/app/career/${flow.id}`,
  }));

  return pages;
};
