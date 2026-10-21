import { ExternalService } from "@sam-monorepo/domain";

export const ExternalServiceDisplayNames: Record<ExternalService, string> = {
  [ExternalService.SPVIEWER]: "SPViewer",
  [ExternalService.RSI]: "RSI",
  [ExternalService.FLEETYARDS]: "FleetYards",
};
