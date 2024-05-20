import { VercelToolbar } from "@vercel/toolbar/next";
import { dedupedGetUnleashFlag } from "../../lib/getUnleashFlag";

export const PreviewComments = async () => {
  if (!(await dedupedGetUnleashFlag("EnablePreviewComments"))) return null;

  return <VercelToolbar />;
};
