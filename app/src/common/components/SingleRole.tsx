import { env } from "@/env";
import { type Role } from "@prisma/client";
import clsx from "clsx";
import Image from "next/image";

type Props = Readonly<{
  className?: string;
  role: Role;
  showPlaceholder?: boolean;
}>;

export const SingleRole = ({
  className,
  role,
  showPlaceholder = false,
}: Props) => {
  return (
    <span
      className={clsx(
        className,
        "px-2 py-1 rounded bg-neutral-700/50 flex gap-2 items-center whitespace-nowrap",
      )}
    >
      {role.iconId && (
        <span className="aspect-square w-6 h-6 flex items-center justify-center rounded overflow-hidden">
          <Image
            src={`https://${env.NEXT_PUBLIC_R2_PUBLIC_URL}/${role.iconId}`}
            alt=""
            width={24}
            height={24}
            className="max-w-full max-h-full"
          />
        </span>
      )}

      {!role.iconId && showPlaceholder && <span className="size-6" />}

      {role.name}
    </span>
  );
};
