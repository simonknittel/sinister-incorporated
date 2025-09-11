import clsx from "clsx";

interface Props {
  readonly className?: string;
}

export const GlobalAlert = ({ className }: Props) => {
  return (
    <div
      className={clsx(
        className,
        "bg-sinister-red-900/50 lg:mb-4 text-center backdrop-blur",
      )}
    >
      <div className="border-y-2 border-sinister-red-500 text-sinister-red-500 uppercase">
        <span className="opacity-50">✱✱✱</span> Alert{" "}
        <span className="opacity-50">✱✱✱</span>
      </div>

      <p className="p-4">Angriff auf unser Zentrallager</p>

      <div className="border-y-2 border-sinister-red-500 text-sinister-red-500 uppercase">
        <span className="opacity-50">✱✱✱</span> Alert{" "}
        <span className="opacity-50">✱✱✱</span>
      </div>
    </div>
  );
};
