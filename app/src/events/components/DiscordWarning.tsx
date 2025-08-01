import Note from "@/common/components/Note";
import clsx from "clsx";

interface Props {
  readonly className?: string;
}

export const DiscordWarning = ({ className }: Props) => {
  return (
    <Note
      type="warning"
      message={
        <div className="flex flex-col">
          <p>
            Du musst dich erst in Discord bei diesem Event anmelden, bevor du
            dich hier in der Aufstellung anmelden kannst.
          </p>
        </div>
      }
      className={clsx("!max-w-none", className)}
    />
  );
};
