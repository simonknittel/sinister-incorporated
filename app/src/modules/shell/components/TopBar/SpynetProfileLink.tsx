"use client";

import { Button2 } from "@/common/components/Button2";
import { Link } from "@/common/components/Link";
import { usePopover } from "@/common/components/Popover";
import clsx from "clsx";
import { FaUserSecret } from "react-icons/fa";

interface Props {
  readonly className?: string;
  readonly entityId: string;
}

export const SpynetProfileLink = ({ className, entityId }: Props) => {
  const { closePopover } = usePopover();

  return (
    <Button2
      as={Link}
      href={`/app/spynet/citizen/${entityId}`}
      className={clsx(className)}
      onClick={closePopover}
      variant="primary"
    >
      <FaUserSecret />
      Spynet Profil
    </Button2>
  );
};