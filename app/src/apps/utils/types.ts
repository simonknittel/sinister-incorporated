import type { StaticImageData } from "next/image";

export interface App {
  id: string;
  name: string;
  href: string;
  imageSrc: StaticImageData;
  description: string;
  featured?: boolean;
  redacted?: boolean;
  /**
   * Either of these permission strings must be permitted in order to access the app.
   */
  permissionStrings?: string[];
}
