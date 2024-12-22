import type { EntityLogType } from "@/types";

export const entityLogTypeTranslations: Record<EntityLogType, string> = {
  handle: "Handle",
  "discord-id": "Discord ID",
  "teamspeak-id": "Teamspeak ID",
  "citizen-id": "Citizen ID",
  "community-moniker": "Community Moniker",
  "spectrum-id": "Spectrum ID",
} as const;
