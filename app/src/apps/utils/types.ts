import type { StaticImageData } from "next/image";

export interface App {
  name: string;
  description: string;
  imageSrc: StaticImageData;
  href: string;
  featured?: boolean;
}

export interface IntegratedApp extends App {
  /**
   * Either of these permission strings must be permitted in order to access the app.
   */
  permissionStrings?: string[];
}

export interface ExternalApp extends App {
  id: string;
  slug: string;
}

export interface RedactedApp {
  name: string;
  featured?: boolean;
  redacted: boolean;
}

export type AppList = (App | RedactedApp)[];
