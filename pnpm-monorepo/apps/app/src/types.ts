import "react";

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  interface CSSProperties {
    [key: `--${string}`]: string | number;
  }
}

export type {
  CitizenLogType,
  GenericCitizenLogType,
} from "@sam-monorepo/domain";
