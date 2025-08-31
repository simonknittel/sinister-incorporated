import { FaExternalLinkAlt, FaSpinner } from "react-icons/fa";
import { Button2 } from "./Button2";
import { Link } from "./Link";

interface Props {
  readonly url: string;
}

export const IframePage = ({ url }: Props) => {
  return (
    <main className="pb-16 lg:px-2 lg:pb-2 relative">
      <iframe
        src={url}
        className="w-full h-[calc(100dvh-4rem)] lg:h-[calc(100dvh-4.75rem)] relative z-10"
        title="Formular für eine SILO-Anfrage"
      />

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <FaSpinner className="animate-spin text-5xl text-neutral-500" />
      </div>

      <Button2
        as={Link}
        href={url}
        title="In einem neuen Tab öffnen"
        variant="secondary"
        className="absolute right-3 top-1 z-10"
      >
        <FaExternalLinkAlt />
      </Button2>
    </main>
  );
};
