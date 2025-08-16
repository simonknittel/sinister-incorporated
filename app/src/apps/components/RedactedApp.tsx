import clsx from "clsx";
import { random } from "lodash";

interface Props {
  readonly className?: string;
}

export const RedactedApp = ({ className }: Props) => {
  return (
    <div
      className={clsx(
        "background-secondary rounded-primary overflow-hidden",
        className,
      )}
    >
      <div className="aspect-video bg-black" />

      <div className="p-4 relative flex flex-col gap-2">
        <h2 className="font-bold">Redacted</h2>

        <p className="text-xs text-neutral-400">
          Lorem ipsum dolor sit amet consectetur adipisicing elit.
        </p>

        <div className="absolute inset-0 flex items-center justify-center backdrop-blur">
          <p
            className="text-sinister-red-500 font-bold border-2 border-sinister-red-500 rounded-secondary px-2 py-1 text-lg relative"
            style={{
              transform: `rotate(${random(-15, 15)}deg)`,
            }}
          >
            Redacted
          </p>
        </div>
      </div>
    </div>
  );
};
