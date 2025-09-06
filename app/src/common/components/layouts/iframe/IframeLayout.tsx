import { FaSpinner } from "react-icons/fa";

interface Props {
  readonly url: string;
}

export const IframeLayout = ({ url }: Props) => {
  return (
    <div className="relative">
      <iframe
        src={url}
        className="w-full h-[calc(100dvh-64px-48px)] lg:h-[calc(100dvh-104px)] relative z-10"
        title="Formular für eine SILO-Anfrage"
      />

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <FaSpinner className="animate-spin text-5xl text-neutral-500" />
      </div>
    </div>
  );
};
