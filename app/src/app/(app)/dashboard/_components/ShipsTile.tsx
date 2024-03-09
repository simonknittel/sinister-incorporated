import clsx from "clsx";

interface Props {
  className?: string;
}

export const ShipsTile = ({ className }: Readonly<Props>) => {
  return (
    <section
      className={clsx(
        className,
        "rounded-2xl p-4 lg:p-8 bg-neutral-900/50 backdrop-blur",
      )}
    >
      <h2 className="font-bold mb-4">Meine Schiffe</h2>

      <p className="text-neutral-500 italic mt-4">work in progress</p>
    </section>
  );
};
