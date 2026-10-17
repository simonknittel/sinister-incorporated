/** The organization logos are hotlinked from the website they are scraped from */
const ORGANIZATION_LOGO_BASE_URL = "https://robertsspaceindustries.com";

/** The logo is a path on the website of Star Citizen, for example `/media/…` */
export const getOrganizationLogoUrl = (logo: string | null) =>
  logo ? new URL(logo, ORGANIZATION_LOGO_BASE_URL).href : null;
