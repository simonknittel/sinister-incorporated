import { Role } from "@prisma/client";
import clsx from "clsx";

interface Props {
  className?: string;
  role: Role;
}

const Role = ({ className, role }: Props) => {
  return (
    <span className={clsx(className, "px-2 py-1 rounded bg-neutral-700")}>
      {role.name}
    </span>
  );
};

export default Role;
