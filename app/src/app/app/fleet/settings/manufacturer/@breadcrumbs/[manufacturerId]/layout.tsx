import { Link } from "@/modules/common/components/Link";
import { type ReactNode } from "react";

interface Props {
  readonly children?: ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <>
      <Link
        href="/app/fleet/settings/manufacturer"
        className="text-sinister-red-500 hover:text-sinister-red-300 transition-colors"
      >
        Alle Hersteller
      </Link>

      <span className="text-neutral-700">/</span>

      {children}
    </>
  );
}
