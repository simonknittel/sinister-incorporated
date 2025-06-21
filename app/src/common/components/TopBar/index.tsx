import clsx from "clsx";
import { Account } from "./Account";

interface Props {
  readonly className?: string;
}

export const TopBar = ({ className }: Props) => {
  return (
    <div
      className={clsx(
        "hidden lg:block px-6 pt-6 fixed z-10 left-0 right-0 top-0",
        className,
      )}
    >
      <div className="background-secondary-opaque rounded-primary p-2">
        <Account />
      </div>
    </div>
  );
};
