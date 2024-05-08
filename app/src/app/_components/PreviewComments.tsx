import { VercelToolbar } from "@vercel/toolbar/next";
import { getUnleashFlag } from "../../lib/getUnleashFlag";

export const PreviewComments = async () => {
  if (!(await getUnleashFlag("EnablePreviewComments"))) return null;

  return <VercelToolbar />;
};
