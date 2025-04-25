"use client";

import clsx from "clsx";

interface Props {
  readonly className?: string;
  readonly error?: Error;
}

export const ErrorTile = ({ className, error }: Props) => {
  return (
    <section className={clsx("rounded-2xl bg-red-800/50", className)}>
      <div className="flex justify-between items-center border-b border-white/5">
        <h2 className="font-thin text-2xl p-4 lg:px-8">Fehler</h2>
      </div>

      <div className="p-4 lg:p-8">
        {error?.message ||
          "Ein unerwartete Fehler ist aufgetreten. Bitte probiere es später erneut."}
      </div>
    </section>
  );
};
