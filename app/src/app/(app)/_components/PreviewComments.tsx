import { VercelToolbar } from "@vercel/toolbar/next";
import { getUnleashFlag } from "../../../_lib/getUnleashFlag";

const PreviewComments = async () => {
  if (!(await getUnleashFlag("EnablePreviewComments"))) return null;

  return <VercelToolbar />;
};

export default PreviewComments;
