import clsx from "clsx";
import Link from "next/link";

interface Props {
  className?: string;
}

export const Footer = ({ className }: Readonly<Props>) => {
  return (
    <footer className={clsx(className, "text-neutral-500 text-center text-sm")}>
      <div>
        <Link href="/imprint" className="underline">
          Impressum
        </Link>{" "}
        •{" "}
        <Link href="/privacy" className="underline">
          Datenschutzerklärung
        </Link>
      </div>
      Sinister Incorporated
    </footer>
  );
};
