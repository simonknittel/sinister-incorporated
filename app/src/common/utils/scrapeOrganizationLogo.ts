import { type Organization } from "@prisma/client";

export const scrapeOrganizationLogo = async (
  organizationId: Organization["spectrumId"],
) => {
  const website = await fetch(
    `https://robertsspaceindustries.com/orgs/${organizationId}`,
  );

  const html = await website.text();

  const logoUrl = html.match(/"(\/media\/(?:.+)\/logo\/(?:.+))"/);

  return logoUrl?.[1] || undefined;
};
