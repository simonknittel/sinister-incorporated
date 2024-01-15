import { type Role } from "@prisma/client";
import clsx from "clsx";
import Image from "next/image";
import { env } from "~/env.mjs";

interface Props {
  className?: string;
  role: Role;
}

const SingleRole = ({ className, role }: Readonly<Props>) => {
  return (
    <span
      className={clsx(
        className,
        "pl-2 pr-6 py-3 rounded bg-neutral-800 flex gap-2 items-center whitespace-nowrap text-2xl",
      )}
    >
      {role.imageId && (
        <div className="aspect-square w-16 h-16 flex items-center justify-center rounded overflow-hidden">
          <Image
            src={`https://${env.NEXT_PUBLIC_R2_PUBLIC_URL}/${role.imageId}`}
            alt=""
            width={64}
            height={64}
            className="max-w-full max-h-full"
          />
        </div>
      )}

      {role.name}
    </span>
  );
};

export default SingleRole;
