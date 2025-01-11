import * as Tooltip from "@radix-ui/react-tooltip";
import clsx from "clsx";

type Props = Readonly<{
  className?: string;
}>;

export const Formatting = ({ className }: Props) => {
  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger
          className={clsx(
            "text-sinister-red-500 hover:underline cursor-help",
            className,
          )}
        >
          Formatierungshilfe
        </Tooltip.Trigger>

        <Tooltip.Content
          className="p-4 text-sm leading-tight max-w-[640px] select-none rounded bg-neutral-600 shadow-sm"
          sideOffset={5}
        >
          <p>
            <strong>Erwähnungen</strong>
          </p>
          <p>
            Organisation: @org:&lt;spectrum_id&gt; (Beispiel: @org:S1NISTER)
          </p>
          <p>Citizen: @citizen:&lt;spectrum_id&gt; (Beispiel: @citizen:2781)</p>
          <Tooltip.Arrow className="fill-neutral-600" />
        </Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};
