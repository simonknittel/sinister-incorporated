import { flag } from "@unleash/nextjs";

export const getUnleashFlag = async (name: "DisableAlgolia") => {
  const result = await flag(
    name,
    {},
    {
      fetchOptions: { next: { revalidate: 60 } },
    },
  );

  return result.enabled;
};
