import { Tooltip } from "@/common/components/Tooltip";
import clsx from "clsx";

type Props = Readonly<{
  className?: string;
}>;

export const Formatting = ({ className }: Props) => {
  return (
    <Tooltip triggerChildren="Formatierungshilfe" className={clsx(className)}>
      <p>
        <strong>Erwähnungen</strong>
      </p>
      <p>Organisation: @org:&lt;spectrum_id&gt; (Beispiel: @org:S1NISTER)</p>
      <p>Citizen: @citizen:&lt;spectrum_id&gt; (Beispiel: @citizen:2781)</p>
    </Tooltip>
  );
};
