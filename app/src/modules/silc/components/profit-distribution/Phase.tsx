import clsx from "clsx";
import type { ReactNode } from "react";
import { FaArrowUp } from "react-icons/fa";

interface Props {
  readonly phase: number;
  readonly currentPhase: number;
  readonly children: ReactNode;
}

export const Phase = ({ phase, currentPhase, children }: Props) => {
  return (
    <>
      <section className="flex">
        <div
          className={clsx(
            "flex-none w-8 text-xs whitespace-nowrap flex items-center justify-center rounded-l-primary py-2",
            {
              "bg-green-500 text-black": phase === currentPhase,
              "bg-neutral-700 text-white": phase !== currentPhase,
            },
          )}
          style={{
            writingMode: "sideways-lr",
          }}
        >
          {phase < currentPhase && "Abgeschlossene Phase"}
          {phase === currentPhase && "Aktuelle Phase"}
          {phase > currentPhase && "Nächste Phase"}
        </div>

        <div className="flex-1 p-4 background-secondary rounded-r-primary">
          {children}
        </div>
      </section>

      {phase > 1 && (
        <div className="my-4 flex justify-center">
          <FaArrowUp className="text-4xl text-neutral-700" />
        </div>
      )}
    </>
  );
};
