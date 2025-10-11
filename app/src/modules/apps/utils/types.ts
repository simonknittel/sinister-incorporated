import type { StaticImageData } from "next/image";

export interface App {
  name: string;
  description: string;
  imageSrc: StaticImageData;
  tags?: string[];
}

export interface IntegratedApp extends App {
  href: string;
  /**
   * Either of these permission strings must be permitted in order to access the app.
   */
  permissionStrings?: string[];
}

export interface ExternalApp extends App {
  id: string;
  slug: string;
  defaultPage: {
    iframeUrl: string;
  };
  pages?: (
    | {
        title: string;
        slug: string;
        iframeUrl: string;
      }
    | {
        title: string;
        externalUrl: string;
      }
    | {
        title: string;
        slug: string;
      }
  )[];
  createLinks?: {
    title: string;
    slug: string;
  }[];

  team: {
    handle: string;
  }[];
}

export interface RedactedApp {
  name: string;
  featured?: boolean;
  redacted: boolean;
}

export type AppList = (App | RedactedApp)[];
