"use client";

import { useAuthentication } from "@/auth/hooks/useAuthentication";
import type { Entity } from "@prisma/client";
import clsx from "clsx";
import { Link } from "./Link";

type Props = Readonly<{
  className?: string;
  citizen: Entity;
  page?: string;
}>;

export const CitizenLink = ({ className, citizen, page = "" }: Props) => {
  const authentication = useAuthentication();
  const isCitizenCurrentUser = authentication
    ? citizen.id === authentication.session.entityId
    : false;

  return (
    <Link
      href={`/app/spynet/citizen/${citizen.id}${page}`}
      className={clsx(
        "hover:underline",
        {
          "text-green-500": isCitizenCurrentUser,
          "text-sinister-red-500": !isCitizenCurrentUser,
        },
        className,
      )}
      prefetch={false}
    >
      {citizen.handle || citizen.id}
    </Link>
  );
};
