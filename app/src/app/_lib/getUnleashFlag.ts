import { flag } from "@unleash/nextjs";
import { authenticate } from "./auth/authenticateAndAuthorize";

export const getUnleashFlag = async (
  name: "DisableAlgolia" | "EnablePreviewComments" | "EnableCareBearShooter",
) => {
  const authentication = await authenticate();

  const result = await flag(
    name,
    {
      userId: authentication ? authentication.session.user.id : undefined,
    },
    {
      fetchOptions: { next: { revalidate: 60 } },
    },
  );

  return result.enabled;
};
