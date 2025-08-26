import clsx from "clsx";
import { CmdKLoader } from "../CmdK/CmdKLoader";
import { Account } from "./Account";

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
      <div className="flex-1 flex justify-center">
        <CmdKLoader className="w-full max-w-96" />
      </div>

      <Account />
    </div>
  );
};
