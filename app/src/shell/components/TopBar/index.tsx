import clsx from "clsx";
import { CmdKLoader } from "../CmdK/CmdKLoader";
import { Account } from "./Account";
import { Apps } from "./Apps";

interface Props {
  readonly className?: string;
}

export const TopBar = ({ className }: Props) => {
  return (
    <div
      className={clsx(
        "hidden lg:flex fixed left-2 right-2 top-2 z-10 background-secondary-opaque rounded-primary",
        className,
      )}
    >
      <div className="flex-1">
        <Apps />
      </div>

      <CmdKLoader className="flex-initial w-96" />

      <div className="flex-1 flex justify-end">
        <Account />
      </div>
    </div>
  );
};
